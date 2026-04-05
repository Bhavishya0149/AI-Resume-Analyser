package com.example.resumeai.dto.auth;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class LoginRequest {

    @Email(message = "Invalid email format")
    private String email;

    private String password;
    private String googleIdToken;
}