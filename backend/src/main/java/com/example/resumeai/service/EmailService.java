package com.example.resumeai.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp);

    void sendPasswordResetEmail(String to, String resetLink);
}