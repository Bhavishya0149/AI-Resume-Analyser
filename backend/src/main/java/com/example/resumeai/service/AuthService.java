package com.example.resumeai.service;

import com.example.resumeai.dto.auth.*;

public interface AuthService {

    void sendOtp(SendOtpRequest request);

    AuthResponse verifyOtpAndLogin(VerifyOtpRequest request);

    AuthResponse googleLogin(LoginRequest request);

    void resendOtp(String email);
}