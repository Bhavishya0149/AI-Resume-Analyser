package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.entity.AnalysisHistory;
import com.example.resumeai.entity.Resume;
import com.example.resumeai.repository.AnalysisHistoryRepository;
import com.example.resumeai.repository.ResumeRepository;
import com.example.resumeai.service.AiService;
import com.example.resumeai.service.AnalysisService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisServiceImpl implements AnalysisService {

    private final AiService aiService;
    private final ResumeRepository resumeRepository;
    private final AnalysisHistoryRepository historyRepository;

    @Override
    public AiResult compare(String resumeId, String resumeText, String jdText) {

        String userId = SecurityUtil.getCurrentUserId();

        String finalResumeText = resumeText;

        if (resumeId != null) {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));
            finalResumeText = resume.getExtractedText();
        }

        AiResult result = aiService.analyze(finalResumeText, jdText);

        AnalysisHistory history = AnalysisHistory.builder()
                .userId(userId)
                .resumeId(resumeId)
                .resumeText(resumeText)
                .jdText(jdText)
                .tfidfSimilarity(result.getTfidfSimilarity())
                .embeddingSimilarity(result.getEmbeddingSimilarity())
                .skillMatchPercentage(result.getSkillMatchPercentage())
                .qualificationScore(result.getQualificationScore())
                .matchedSkills(result.getMatchedSkills())
                .missingSkills(result.getMissingSkills())
                .createdAt(Instant.now())
                .build();

        historyRepository.save(history);

        return result;
    }

    @Override
    public List<AnalysisHistory> getHistory() {

        String userId = SecurityUtil.getCurrentUserId();

        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}