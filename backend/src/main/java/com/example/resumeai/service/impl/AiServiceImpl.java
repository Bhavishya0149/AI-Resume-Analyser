package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.resumeai.exception.ApiException;

import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String AI_SERVICE_URL = "http://localhost:5000/analyze";

    private Double toDouble(Object value) {
        return value == null ? 0.0 : Double.parseDouble(value.toString());
    }

    @Override
    public AiResult analyze(String resumeText, String jdText) {

        Map<String, String> request = Map.of(
                "resume_text", resumeText,
                "jd_text", jdText
        );

        Map<String, Object> response = restTemplate.postForObject(
                AI_SERVICE_URL,
                request,
                Map.class
        );

        if (response == null) {
            throw new ApiException("AI service returned null response");
        }

        return AiResult.builder()
                .tfidfSimilarity(toDouble(response.get("tfidf_similarity")))
                .embeddingSimilarity(toDouble(response.get("embedding_similarity")))
                .skillMatchPercentage(toDouble(response.get("skill_match_percentage")))
                .qualificationScore(toDouble(response.get("qualification_score")))
                .matchedSkills((List<String>) response.get("matched_skills"))
                .missingSkills((List<String>) response.get("missing_skills"))
                .build();
    }
}