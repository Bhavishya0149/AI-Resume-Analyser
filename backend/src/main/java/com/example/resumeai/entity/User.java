package com.example.resumeai.entity;

import com.example.resumeai.entity.enums.AuthProvider;
import com.example.resumeai.entity.enums.Role;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Set;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private AuthProvider authProvider;
    private Boolean isEmailVerified;

    private String otpCode;
    private Instant otpExpiresAt;
    private Integer otpAttemptsLeft;
    private Instant otpResendAvailableAt;

    private String name;
    private String profilePictureUrl;

    private Set<Role> roles;
    private Boolean recruiterVerified;
    private Boolean isActive;

    private String passwordResetToken;
    private Instant passwordResetTokenExpiry;

    private Instant createdAt;
    private Instant updatedAt;
}