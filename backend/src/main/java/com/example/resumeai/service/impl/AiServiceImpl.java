package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.service.AiService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AiServiceImpl implements AiService {

    @Override
    public AiResult analyze(String resumeText, String jdText) {

        double score = ThreadLocalRandom.current().nextDouble(50, 90);

        return AiResult.builder()
                .tfidfSimilarity(score)
                .embeddingSimilarity(score + 2)
                .skillMatchPercentage(score - 5)
                .qualificationScore(score)
                .matchedSkills(List.of("Java", "Spring"))
                .missingSkills(List.of("Docker"))
                .build();
    }
}