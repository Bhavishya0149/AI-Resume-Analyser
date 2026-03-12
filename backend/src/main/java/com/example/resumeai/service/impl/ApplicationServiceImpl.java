package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.entity.Application;
import com.example.resumeai.entity.JobPosting;
import com.example.resumeai.entity.Resume;
import com.example.resumeai.exception.ConflictException;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.ApplicationRepository;
import com.example.resumeai.repository.JobPostingRepository;
import com.example.resumeai.repository.ResumeRepository;
import com.example.resumeai.service.AiService;
import com.example.resumeai.service.ApplicationService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;

    @Override
    public AiResult applyToJob(String jobId, String resumeId) {

        String userId = SecurityUtil.getCurrentUserId();

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        if (!Boolean.TRUE.equals(job.getAllowApplications())) {
            throw new ForbiddenException("Applications not allowed");
        }

        if (applicationRepository.findByUserIdAndJobPostingId(userId, jobId).isPresent()) {
            throw new ConflictException("Already applied");
        }

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        AiResult result = aiService.analyze(resume.getExtractedText(), job.getDescriptionText());

        Application application = Application.builder()
                .jobPostingId(jobId)
                .userId(userId)
                .resumeId(resumeId)
                .tfidfSimilarity(result.getTfidfSimilarity())
                .embeddingSimilarity(result.getEmbeddingSimilarity())
                .skillMatchPercentage(result.getSkillMatchPercentage())
                .qualificationScore(result.getQualificationScore())
                .matchedSkills(result.getMatchedSkills())
                .missingSkills(result.getMissingSkills())
                .createdAt(Instant.now())
                .build();

        applicationRepository.save(application);

        return result;
    }

    @Override
    public List<Application> getLeaderboard(String jobId) {
        return applicationRepository.findByJobPostingIdOrderByQualificationScoreDesc(jobId);
    }
}