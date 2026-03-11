package com.example.resumeai.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "analysis_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisHistory {

    @Id
    private String id;

    private String userId;

    private String resumeId;
    private String resumeText;
    private String jdText;

    private Double tfidfSimilarity;
    private Double embeddingSimilarity;
    private Double skillMatchPercentage;
    private Double qualificationScore;

    private List<String> matchedSkills;
    private List<String> missingSkills;

    private Instant createdAt;
}