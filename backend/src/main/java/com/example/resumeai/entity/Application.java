package com.example.resumeai.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "applications")
@CompoundIndex(name = "user_job_unique", def = "{'userId':1,'jobPostingId':1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    private String id;

    private String jobPostingId;
    private String userId;
    private String resumeId;

    private Double tfidfSimilarity;
    private Double embeddingSimilarity;
    private Double skillMatchPercentage;
    private Double qualificationScore;

    private List<String> matchedSkills;
    private List<String> missingSkills;

    private Instant createdAt;
}