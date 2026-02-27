package com.example.multiauth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    private String email;
    
    private String mobile;
    
    @NotBlank(message = "Password is required")
    private String password;
}
