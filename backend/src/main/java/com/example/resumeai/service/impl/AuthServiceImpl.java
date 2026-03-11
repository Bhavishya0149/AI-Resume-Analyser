package com.example.resumeai.service.impl;

import com.example.resumeai.config.AppProperties;
import com.example.resumeai.dto.auth.*;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.AuthProvider;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.ConflictException;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.exception.UnauthorizedException;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.security.JwtUtil;
import com.example.resumeai.service.AuthService;
import com.example.resumeai.service.EmailService;
import com.example.resumeai.service.GoogleAuthService;
import com.example.resumeai.util.OtpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpUtil otpUtil;
    private final AppProperties appProperties;
    private final JwtUtil jwtUtil;
    private final GoogleAuthService googleAuthService;

    @Override
    public void signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        String otp = otpUtil.generateOtp();

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .authProvider(AuthProvider.LOCAL)
                .isEmailVerified(false)
                .otpCode(otp)
                .otpExpiresAt(Instant.now().plusSeconds(appProperties.getOtp().getExpiryMinutes() * 60L))
                .otpAttemptsLeft(appProperties.getOtp().getMaxAttempts())
                .otpResendAvailableAt(Instant.now().plusSeconds(appProperties.getOtp().getResendDelaySeconds()))
                .name(request.getName())
                .roles(Set.of(Role.USER))
                .recruiterVerified(false)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    public void verifyEmail(VerifyOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getOtpAttemptsLeft() <= 0) {
            throw new ForbiddenException("OTP attempts exceeded");
        }

        if (user.getOtpExpiresAt().isBefore(Instant.now())) {
            throw new ForbiddenException("OTP expired");
        }

        if (!user.getOtpCode().equals(request.getOtp())) {
            user.setOtpAttemptsLeft(user.getOtpAttemptsLeft() - 1);
            userRepository.save(user);
            throw new UnauthorizedException("Invalid OTP");
        }

        user.setIsEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        user.setOtpAttemptsLeft(null);
        user.setOtpResendAvailableAt(null);
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        if (request.getGoogleIdToken() != null) {

            String email = googleAuthService.verifyTokenAndGetEmail(request.getGoogleIdToken());

            User user = userRepository.findByEmail(email).orElseGet(() -> {

                User newUser = User.builder()
                        .email(email)
                        .authProvider(AuthProvider.GOOGLE)
                        .isEmailVerified(true)
                        .name(email.split("@")[0])
                        .roles(Set.of(Role.USER))
                        .recruiterVerified(false)
                        .isActive(true)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build();

                return userRepository.save(newUser);
            });

            if (user.getAuthProvider() == AuthProvider.LOCAL) {
                throw new ConflictException(
                        "Account registered with email/password. Use normal login."
                );
            }

            String token = jwtUtil.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
            );

            return buildResponse(user, token);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new ForbiddenException("Email not verified");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );

        return buildResponse(user, token);
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

    @Override
    public void requestPasswordReset(String email) {

        userRepository.findByEmail(email).ifPresent(user -> {

            String token = generateResetToken();

            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(
                    Instant.now().plusSeconds(15 * 60)
            );
            user.setUpdatedAt(Instant.now());

            userRepository.save(user);

            String resetLink = "http://localhost:3000/reset-password?token=" + token;

            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        });
    }

    @Override
    public void resetPasswordWithToken(ResetPasswordWithTokenRequest request) {

        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new NotFoundException("Invalid or expired token"));

        if (user.getPasswordResetTokenExpiry() == null ||
                user.getPasswordResetTokenExpiry().isBefore(Instant.now())) {
            throw new ForbiddenException("Reset token expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
    }

    private String generateResetToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    @Override
    public void resendOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new ConflictException("OTP not applicable for Google accounts");
        }

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new ConflictException("Email already verified");
        }

        if (user.getOtpResendAvailableAt() != null &&
                user.getOtpResendAvailableAt().isAfter(Instant.now())) {

            long secondsLeft = Duration.between(
                    Instant.now(),
                    user.getOtpResendAvailableAt()
            ).getSeconds();

            throw new ForbiddenException(
                    "Resend OTP available in " + secondsLeft + " seconds"
            );
        }

        String otp = otpUtil.generateOtp();

        user.setOtpCode(otp);
        user.setOtpExpiresAt(
                Instant.now().plusSeconds(appProperties.getOtp().getExpiryMinutes() * 60L)
        );
        user.setOtpAttemptsLeft(appProperties.getOtp().getMaxAttempts());
        user.setOtpResendAvailableAt(
                Instant.now().plusSeconds(appProperties.getOtp().getResendDelaySeconds())
        );
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }
}