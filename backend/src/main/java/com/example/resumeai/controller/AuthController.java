package com.example.resumeai.controller;

import com.example.resumeai.dto.auth.*;
import com.example.resumeai.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + request.getEmail()));
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyOtpAndLogin(request);
    }

    @PostMapping("/login")
    public AuthResponse googleLogin(@RequestBody LoginRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        authService.resendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
    }
}