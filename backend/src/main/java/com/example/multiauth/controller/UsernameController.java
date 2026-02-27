package com.example.multiauth.controller;

import com.example.multiauth.dto.UsernameRequest;
import com.example.multiauth.dto.UsernameResponse;
import com.example.multiauth.service.UsernameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/username")
@RequiredArgsConstructor
public class UsernameController {
    
    private final UsernameService usernameService;
    
    @GetMapping
    public ResponseEntity<UsernameResponse> getUsername(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(usernameService.getUsername(userId));
    }
    
    @PostMapping
    public ResponseEntity<UsernameResponse> createUsername(
            Authentication authentication,
            @Valid @RequestBody UsernameRequest request) {
        String userId = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usernameService.createUsername(userId, request));
    }
    
    @PutMapping
    public ResponseEntity<UsernameResponse> updateUsername(
            Authentication authentication,
            @Valid @RequestBody UsernameRequest request) {
        String userId = authentication.getName();
        return ResponseEntity.ok(usernameService.updateUsername(userId, request));
    }
    
    @DeleteMapping
    public ResponseEntity<Void> deleteUsername(Authentication authentication) {
        String userId = authentication.getName();
        usernameService.deleteUsername(userId);
        return ResponseEntity.noContent().build();
    }
}