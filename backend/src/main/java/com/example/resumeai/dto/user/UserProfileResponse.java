package com.example.resumeai.dto.user;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserProfileResponse {

    private String id;
    private String email;
    private String name;
    private String profilePictureUrl;
    private Set<String> roles;
    private Boolean recruiterVerified;
    private String authProvider;
}