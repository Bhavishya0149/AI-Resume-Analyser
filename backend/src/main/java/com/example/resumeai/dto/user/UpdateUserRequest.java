package com.example.resumeai.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Email(message = "Invalid email format")
    private String newEmail;

    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;

    private String currentPassword;

    private String requestedRole;
}