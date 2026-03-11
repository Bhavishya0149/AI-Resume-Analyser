package com.example.resumeai.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordWithTokenRequest {

    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;
}