package com.example.resumeai.service.impl;

import com.example.resumeai.config.AppProperties;
import com.example.resumeai.dto.auth.*;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.AuthProvider;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.*;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.security.JwtUtil;
import com.example.resumeai.service.AuthService;
import com.example.resumeai.service.EmailService;
import com.example.resumeai.service.GoogleAuthService;
import com.example.resumeai.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpUtil otpUtil;
    private final AppProperties appProperties;
    private final JwtUtil jwtUtil;
    private final GoogleAuthService googleAuthService;

    @Override
    public void sendOtp(SendOtpRequest request) {

        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email cannot be empty");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            String otp = otpUtil.generateOtp();

            user = User.builder()
                    .email(email)
                    .authProvider(AuthProvider.LOCAL)
                    .isEmailVerified(false)
                    .otpCode(otp)
                    .otpExpiresAt(Instant.now().plusSeconds(
                            appProperties.getOtp().getExpiryMinutes() * 60L))
                    .otpAttemptsLeft(appProperties.getOtp().getMaxAttempts())
                    .otpResendAvailableAt(Instant.now().plusSeconds(
                            appProperties.getOtp().getResendDelaySeconds()))
                    .name("User")                          // generic default
                    .roles(new HashSet<>(Set.of(Role.USER))) // default role
                    .recruiterVerified(false)
                    .isActive(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();   
        } else {
            // Returning user — just issue a new OTP
            if (user.getOtpResendAvailableAt() != null &&
                    user.getOtpResendAvailableAt().isAfter(Instant.now())) {
                long secondsLeft = Duration.between(
                        Instant.now(), user.getOtpResendAvailableAt()).getSeconds();
                throw new ForbiddenException("OTP already sent. Try again in " + secondsLeft + " seconds");
            }

            String otp = otpUtil.generateOtp();
            user.setOtpCode(otp);
            user.setOtpExpiresAt(Instant.now().plusSeconds(
                    appProperties.getOtp().getExpiryMinutes() * 60L));
            user.setOtpAttemptsLeft(appProperties.getOtp().getMaxAttempts());
            user.setOtpResendAvailableAt(Instant.now().plusSeconds(
                    appProperties.getOtp().getResendDelaySeconds()));
            user.setUpdatedAt(Instant.now());
        }

        userRepository.save(user);
        emailService.sendOtpEmail(email, user.getOtpCode());
    }

    @Override
    public AuthResponse verifyOtpAndLogin(VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getOtpAttemptsLeft() == null || user.getOtpAttemptsLeft() <= 0) {
            throw new ForbiddenException("OTP attempts exceeded. Please request a new OTP.");
        }

        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
            throw new ForbiddenException("OTP has expired. Please request a new one.");
        }

        if (!user.getOtpCode().equals(request.getOtp())) {
            user.setOtpAttemptsLeft(user.getOtpAttemptsLeft() - 1);
            userRepository.save(user);
            throw new UnauthorizedException("Invalid OTP");
        }

        // OTP is valid — mark email verified, clear OTP fields
        user.setIsEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        user.setOtpAttemptsLeft(null);
        user.setOtpResendAvailableAt(null);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );

        return buildResponse(user, token);
    }

    @Override
    public AuthResponse googleLogin(LoginRequest request) {

        if (request.getGoogleIdToken() == null || request.getGoogleIdToken().isBlank()) {
            throw new BadRequestException("Google ID token is required");
        }

        GoogleAuthService.GoogleUser googleUser =
                googleAuthService.verifyToken(request.getGoogleIdToken());

        String email = googleUser.getEmail();
        String sub = googleUser.getSub();
        String name = googleUser.getName();

        // Try to find by Google sub first
        User user = userRepository.findByGoogleSub(sub).orElse(null);

        if (user == null) {
            // Check if an account with this email already exists (LOCAL/OTP user)
            User emailUser = userRepository.findByEmail(email).orElse(null);

            if (emailUser != null) {
                // Merge: link the Google sub to the existing account
                emailUser.setGoogleSub(sub);
                // If they were LOCAL, update provider to show both are supported
                // We keep authProvider as-is but link the sub so next Google login finds them
                emailUser.setUpdatedAt(Instant.now());
                userRepository.save(emailUser);
                user = emailUser;
            } else {
                // Brand new user via Google
                user = User.builder()
                        .email(email)
                        .googleSub(sub)
                        .authProvider(AuthProvider.GOOGLE)
                        .isEmailVerified(true)
                        .name(name)
                        .roles(new HashSet<>(Set.of(Role.USER)))
                        .recruiterVerified(false)
                        .isActive(true)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build();
                userRepository.save(user);
            }
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );

        return buildResponse(user, token);
    }

    @Override
    public void resendOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getOtpResendAvailableAt() != null &&
                user.getOtpResendAvailableAt().isAfter(Instant.now())) {
            long secondsLeft = Duration.between(
                    Instant.now(), user.getOtpResendAvailableAt()).getSeconds();
            throw new ForbiddenException("Resend OTP available in " + secondsLeft + " seconds");
        }

        String otp = otpUtil.generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(Instant.now().plusSeconds(
                appProperties.getOtp().getExpiryMinutes() * 60L));
        user.setOtpAttemptsLeft(appProperties.getOtp().getMaxAttempts());
        user.setOtpResendAvailableAt(Instant.now().plusSeconds(
                appProperties.getOtp().getResendDelaySeconds()));
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        emailService.sendOtpEmail(email, otp);
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                        .build())
                .build();
    }
}