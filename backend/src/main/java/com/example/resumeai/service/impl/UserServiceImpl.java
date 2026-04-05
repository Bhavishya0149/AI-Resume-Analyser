package com.example.resumeai.service.impl;

import com.example.resumeai.config.AppProperties;
import com.example.resumeai.dto.user.UpdateUserRequest;
import com.example.resumeai.dto.user.UserProfileResponse;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.AuthProvider;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.*;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.CloudinaryService;
import com.example.resumeai.service.UserService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
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
                .orElseThrow(() -> new NotFoundException("User not found"));

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
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isGoogle = user.getAuthProvider() == AuthProvider.GOOGLE;

        if (request != null && request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {

            long maxSize = appProperties.getProfilePicture().getMaxSizeBytes();
            if (profilePicture.getSize() > maxSize) {
                throw new ApiException("Profile picture exceeds maximum allowed size");
            }

            String contentType = profilePicture.getContentType();
            if (contentType == null ||
                    !(contentType.equals("image/jpeg") ||
                            contentType.equals("image/png") ||
                            contentType.equals("image/webp"))) {
                throw new ApiException("Profile picture must be JPEG, PNG, or WebP");
            }

            if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isBlank()) {
                cloudinaryService.deleteFile(user.getProfilePictureUrl());
            }

            String imageUrl = cloudinaryService.uploadFile(profilePicture, "profile-pictures");
            user.setProfilePictureUrl(imageUrl);
        }

        if (request != null && request.getNewEmail() != null && !request.getNewEmail().isBlank()) {

            if (isGoogle) {
                throw new ForbiddenException("Google users cannot change their email");
            }

            validateCurrentPassword(user, request.getCurrentPassword());

            if (userRepository.existsByEmail(request.getNewEmail())) {
                throw new ConflictException("This email is already in use");
            }

            user.setEmail(request.getNewEmail());
            user.setIsEmailVerified(false);
        }

        if (request != null && request.getNewPassword() != null && !request.getNewPassword().isBlank()) {

            if (isGoogle) {
                throw new ForbiddenException("Google users cannot set a password");
            }

            if (request.getNewPassword().length() < 6) {
                throw new BadRequestException("New password must be at least 6 characters");
            }

            validateCurrentPassword(user, request.getCurrentPassword());
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request != null && request.getRequestedRole() != null && !request.getRequestedRole().isBlank()) {

            String requestedRole = request.getRequestedRole().toUpperCase();

            if ("USER".equals(requestedRole)) {
                user.getRoles().remove(Role.RECRUITER);
                user.getRoles().add(Role.USER);
            } else if ("RECRUITER".equals(requestedRole)) {
                user.getRoles().remove(Role.USER);
                user.getRoles().add(Role.RECRUITER);
            } else {
                throw new BadRequestException("Invalid role requested. Must be USER or RECRUITER");
            }
        }

        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    @Override
    public void removeProfilePicture(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getProfilePictureUrl() == null || user.getProfilePictureUrl().isBlank()) {
            throw new ApiException("No profile picture to remove");
        }

        cloudinaryService.deleteFile(user.getProfilePictureUrl());
        user.setProfilePictureUrl(null);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    private void validateCurrentPassword(User user, String currentPassword) {
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new UnauthorizedException("Current password is required for this change");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
    }
}