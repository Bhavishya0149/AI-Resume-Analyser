package com.example.resumeai.service.impl;

import com.example.resumeai.dto.user.UserProfileResponse;
import com.example.resumeai.dto.user.UpdateUserRequest;
import com.example.resumeai.entity.User;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.UserService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.Instant;
import com.example.resumeai.service.CloudinaryService;
import com.example.resumeai.entity.enums.AuthProvider;
import com.example.resumeai.config.AppProperties;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final AppProperties appProperties;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getCurrentUserProfile() {

        String userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .recruiterVerified(user.getRecruiterVerified())
                .build();
    }

    @Override
    public void updateCurrentUser(String userId,
                                UpdateUserRequest request,
                                MultipartFile profilePicture) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isGoogle = user.getAuthProvider() == AuthProvider.GOOGLE;

        // 🔹 NAME UPDATE
        if (request != null && request.getName() != null) {
            user.setName(request.getName());
        }

        // 🔹 PROFILE PICTURE UPDATE
        if (profilePicture != null && !profilePicture.isEmpty()) {

            long maxSize = appProperties.getProfilePicture().getMaxSizeBytes();

            if (profilePicture.getSize() > maxSize) {
                throw new RuntimeException("Profile picture too large");
            }

            String contentType = profilePicture.getContentType();

            if (contentType == null ||
                    !(contentType.equals("image/jpeg") ||
                    contentType.equals("image/png") ||
                    contentType.equals("image/webp"))) {
                throw new RuntimeException("Invalid image type");
            }

            String imageUrl = cloudinaryService.uploadFile(profilePicture, "profile-pictures");

            user.setProfilePictureUrl(imageUrl);
        }

        // 🔹 EMAIL CHANGE
        if (request != null && request.getNewEmail() != null) {

            if (isGoogle) {
                throw new RuntimeException("Google users cannot change email");
            }

            validateCurrentPassword(user, request.getCurrentPassword());

            if (userRepository.existsByEmail(request.getNewEmail())) {
                throw new RuntimeException("Email already in use");
            }

            user.setEmail(request.getNewEmail());
            user.setIsEmailVerified(false);
        }

        // 🔹 PASSWORD CHANGE
        if (request != null && request.getNewPassword() != null) {

            if (isGoogle) {
                throw new RuntimeException("Google users cannot change password");
            }

            validateCurrentPassword(user, request.getCurrentPassword());

            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    private void validateCurrentPassword(User user, String currentPassword) {
        if (currentPassword == null ||
                !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
    }

}