package com.example.resumeai.entity;

import com.example.resumeai.entity.enums.FileType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "resumes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    private String id;

    private String userId;
    private String fileName;
    private String cloudinaryUrl;
    private String extractedText;

    private FileType fileType;
    private Long fileSize;

    private Instant createdAt;
    private Instant updatedAt;
}