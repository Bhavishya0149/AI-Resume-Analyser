package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.entity.AnalysisHistory;
import com.example.resumeai.entity.Resume;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.AnalysisHistoryRepository;
import com.example.resumeai.repository.ResumeRepository;
import com.example.resumeai.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Override
    public AiResult compare(String resumeId, String resumeText, String jdText) {

        String userId = SecurityUtil.getCurrentUserId();

        String finalResumeText = resumeText;

        if (resumeId != null) {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new NotFoundException("Resume not found"));
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

    @Override
    public void deleteHistoryEntry(String entryId) {

        String userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        AnalysisHistory entry = historyRepository.findById(entryId)
                .orElseThrow(() -> new NotFoundException("History entry not found"));

        boolean isAdmin = user.getRoles().contains(Role.ADMIN);
        boolean isOwner = entry.getUserId().equals(userId);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Not allowed to delete this history entry");
        }

        historyRepository.delete(entry);
    }

    @Override
    public void deleteAllHistory(String targetUserId) {

        String currentUserId = SecurityUtil.getCurrentUserId();

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isAdmin = currentUser.getRoles().contains(Role.ADMIN);

        String userIdToDelete;

        if (targetUserId != null && !targetUserId.isBlank()) {
            if (!isAdmin) {
                throw new ForbiddenException("Only admins can delete other users' history");
            }
            userIdToDelete = targetUserId;
        } else {
            userIdToDelete = currentUserId;
        }

        historyRepository.deleteByUserId(userIdToDelete);
    }
}