package com.example.resumeai.service.impl;

import com.example.resumeai.dto.user.UserProfileResponse;
import com.example.resumeai.dto.user.UpdateUserRequest;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.AuthProvider;
import com.example.resumeai.exception.ApiException;
import com.example.resumeai.exception.ConflictException;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.exception.UnauthorizedException;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.UserService;
import com.example.resumeai.service.CloudinaryService;
import com.example.resumeai.util.SecurityUtil;
import com.example.resumeai.config.AppProperties;
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

        if (request != null && request.getName() != null && request.getName().length() != 0) {
            user.setName(request.getName());
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {

            long maxSize = appProperties.getProfilePicture().getMaxSizeBytes();

            if (profilePicture.getSize() > maxSize) {
                throw new ApiException("Profile picture too large");
            }

            String contentType = profilePicture.getContentType();

            if (contentType == null ||
                    !(contentType.equals("image/jpeg") ||
                            contentType.equals("image/png") ||
                            contentType.equals("image/webp"))) {
                throw new ApiException("Invalid image type");
            }

            String imageUrl = cloudinaryService.uploadFile(profilePicture, "profile-pictures");

            user.setProfilePictureUrl(imageUrl);
        }

        if (request != null && request.getNewEmail() != null && request.getNewEmail().length() != 0) {

            if (isGoogle) {
                throw new ForbiddenException("Google users cannot change email");
            }

            validateCurrentPassword(user, request.getCurrentPassword());

            if (userRepository.existsByEmail(request.getNewEmail())) {
                throw new ConflictException("Email already in use");
            }

            user.setEmail(request.getNewEmail());
            user.setIsEmailVerified(false);
        }

        if (request != null && request.getNewPassword() != null && request.getNewPassword().length() != 0) {

            if (isGoogle) {
                throw new ForbiddenException("Google users cannot change password");
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
            throw new UnauthorizedException("Current password is incorrect");
        }
    }

}