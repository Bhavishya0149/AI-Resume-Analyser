package com.example.resumeai.dto.application;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class LeaderboardEntryResponse {

    private String applicationId;
    private Double qualificationScore;
    private Double tfidfSimilarity;
    private Double embeddingSimilarity;
    private Double skillMatchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String resumeUrl;
    private Instant appliedAt;
    private UserSnapshot userProfile;

    @Data
    @Builder
    public static class UserSnapshot {
        private String id;
        private String name;
        private String profilePictureUrl;
    }
}