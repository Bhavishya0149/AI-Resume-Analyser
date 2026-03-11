package com.example.resumeai.service;

import com.example.resumeai.dto.auth.*;

public interface AuthService {

    void signup(SignupRequest request);

    void verifyEmail(VerifyOtpRequest request);

    AuthResponse login(LoginRequest request);

    void requestPasswordReset(String email);

    void resetPasswordWithToken(ResetPasswordWithTokenRequest request);

    void resendOtp(String email);
}