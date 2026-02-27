package com.example.multiauth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true, sparse = true)
    private String email;
    
    @Indexed(unique = true, sparse = true)
    private String mobile;
    
    private String password; // Null for Google users
    
    private String username;
    
    private String googleId; // Non-null for Google users
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}