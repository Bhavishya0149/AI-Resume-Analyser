package com.example.resumeai.controller;

import com.example.resumeai.dto.auth.*;
import com.example.resumeai.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public String signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return "Signup successful. Please verify your email with OTP.";
    }

    @PostMapping("/verify-email")
    public String verifyEmail(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyEmail(request);
        return "Email verified successfully";
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestParam String email) {
        authService.requestPasswordReset(email);
        return ResponseEntity.ok(
                Map.of("message", "If the email exists, reset link has been sent")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordWithTokenRequest request) {
        authService.resetPasswordWithToken(request);
        return ResponseEntity.ok(
                Map.of("message", "Password reset successful")
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        authService.resendOtp(email);
        return ResponseEntity.ok(
                Map.of("message", "OTP resent successfully")
        );
    }
}