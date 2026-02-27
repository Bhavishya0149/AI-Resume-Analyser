package com.example.multiauth.service;

import com.example.multiauth.dto.UsernameRequest;
import com.example.multiauth.dto.UsernameResponse;
import com.example.multiauth.exception.ResourceNotFoundException;
import com.example.multiauth.model.User;
import com.example.multiauth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UsernameService {
    
    private final UserRepository userRepository;
    
    public UsernameResponse getUsername(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return UsernameResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }
    
    public UsernameResponse createUsername(String userId, UsernameRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setUsername(request.getUsername());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        return UsernameResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .build();
    }
    
    public UsernameResponse updateUsername(String userId, UsernameRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setUsername(request.getUsername());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        return UsernameResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .build();
    }
    
    public void deleteUsername(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setUsername(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}