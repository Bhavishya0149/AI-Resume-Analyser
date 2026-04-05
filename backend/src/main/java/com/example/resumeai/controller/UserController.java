package com.example.resumeai.controller;

import com.example.resumeai.dto.user.UpdateUserRequest;
import com.example.resumeai.dto.user.UserProfileResponse;
import com.example.resumeai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getProfile() {
        return userService.getCurrentUserProfile();
    }

    @PutMapping(value = "/me", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateCurrentUser(
            @AuthenticationPrincipal String userId,
            @Valid @RequestPart(value = "data", required = false) UpdateUserRequest request,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture
    ) {
        userService.updateCurrentUser(userId, request, profilePicture);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @DeleteMapping("/me/profile-picture")
    public ResponseEntity<?> removeProfilePicture(
            @AuthenticationPrincipal String userId
    ) {
        userService.removeProfilePicture(userId);
        return ResponseEntity.ok(Map.of("message", "Profile picture removed successfully"));
    }
}