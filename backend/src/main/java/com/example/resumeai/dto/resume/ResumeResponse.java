package com.example.resumeai.dto.resume;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ResumeResponse {
    private String id;
    private String fileName;
    private Instant createdAt;
}