package com.example.multiauth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsernameRequest {
    
    @NotBlank(message = "Username cannot be blank")
    private String username;
}