package com.example.multiauth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    private String email;
    
    private String mobile;
    
    @NotBlank(message = "Password is required for email/mobile login")
    private String password;
    
    private String googleToken; // For Google OAuth flow
}