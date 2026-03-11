package com.example.resumeai.dto.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiResult {

    private Double tfidfSimilarity;
    private Double embeddingSimilarity;
    private Double skillMatchPercentage;
    private Double qualificationScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
}