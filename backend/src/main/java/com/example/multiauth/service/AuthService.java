package com.example.multiauth.service;

import com.example.multiauth.dto.AuthResponse;
import com.example.multiauth.dto.LoginRequest;
import com.example.multiauth.dto.RegisterRequest;
import com.example.multiauth.exception.AuthException;
import com.example.multiauth.model.AuthProvider;
import com.example.multiauth.model.User;
import com.example.multiauth.repository.UserRepository;
import com.example.multiauth.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    public AuthResponse register(RegisterRequest request) {
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getMobile())) {
            throw new AuthException("At least one of email or mobile is required");
        }
        
        if (StringUtils.hasText(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already exists");
        }
        
        if (StringUtils.hasText(request.getMobile()) && userRepository.existsByMobile(request.getMobile())) {
            throw new AuthException("Mobile number already exists");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId());
        
        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .message("Registration successful")
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        if (StringUtils.hasText(request.getGoogleToken())) {
            return handleGoogleLogin(request.getGoogleToken());
        } else if (StringUtils.hasText(request.getEmail())) {
            return handleEmailLogin(request.getEmail(), request.getPassword());
        } else if (StringUtils.hasText(request.getMobile())) {
            return handleMobileLogin(request.getMobile(), request.getPassword());
        } else {
            throw new AuthException("Invalid login request. Provide email, mobile, or Google token");
        }
    }
    
    private AuthResponse handleEmailLogin(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Invalid email or password"));
        
        if (user.getPassword() == null) {
            throw new AuthException("This account was created with Google. Please use Google login");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Invalid email or password");
        }
        
        String token = jwtUtil.generateToken(user.getId());
        
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .message("Login successful")
                .build();
    }
    
    private AuthResponse handleMobileLogin(String mobile, String password) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new AuthException("Invalid mobile or password"));
        
        if (user.getPassword() == null) {
            throw new AuthException("This account was created with Google. Please use Google login");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Invalid mobile or password");
        }
        
        String token = jwtUtil.generateToken(user.getId());
        
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .message("Login successful")
                .build();
    }
    
    private AuthResponse handleGoogleLogin(String googleToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                throw new AuthException("Invalid Google token");
            }
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            
            Optional<User> existingUser = userRepository.findByGoogleId(googleId);
            User user;
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                user = User.builder()
                        .googleId(googleId)
                        .email(email)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                user = userRepository.save(user);
            }
            
            String token = jwtUtil.generateToken(user.getId());
            
            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .message("Google login successful")
                    .build();
                    
        } catch (Exception e) {
            throw new AuthException("Google authentication failed: " + e.getMessage());
        }
    }
}
