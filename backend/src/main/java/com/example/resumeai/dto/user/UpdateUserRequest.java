package com.example.resumeai.dto.user;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String name;

    private String newEmail;
    private String newPassword;
    private String currentPassword;
}