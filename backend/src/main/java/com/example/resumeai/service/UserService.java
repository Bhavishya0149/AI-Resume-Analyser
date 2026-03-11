package com.example.resumeai.service;

import com.example.resumeai.dto.user.UserProfileResponse;
import com.example.resumeai.dto.user.UpdateUserRequest;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserProfileResponse getCurrentUserProfile();

    void updateCurrentUser(String userId,
                       UpdateUserRequest request,
                       MultipartFile profilePicture);
}