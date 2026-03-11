package com.example.resumeai.service.impl;

import com.example.resumeai.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Email Verification OTP");
        message.setText("Your OTP is: " + otp);

        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {

        if (mailSender == null) {
            System.out.println("RESET LINK for " + to + " = " + resetLink);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset");
        message.setText("Click the link to reset your password:\n" + resetLink);

        mailSender.send(message);
    }
}