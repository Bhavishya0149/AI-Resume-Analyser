package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.entity.Application;
import com.example.resumeai.entity.JobPosting;
import com.example.resumeai.entity.Resume;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.ApplicationRepository;
import com.example.resumeai.repository.JobPostingRepository;
import com.example.resumeai.repository.ResumeRepository;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.AiService;
import com.example.resumeai.service.ApplicationService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    @Override
    public AiResult applyToJob(String jobId, String resumeId) {

        String userId = SecurityUtil.getCurrentUserId();

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        if (!Boolean.TRUE.equals(job.getAllowApplications())) {
            throw new ForbiddenException("Applications not allowed");
        }

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        AiResult result = aiService.analyze(resume.getExtractedText(), job.getDescriptionText());

        Optional<Application> existingOpt = applicationRepository.findByUserIdAndJobPostingId(userId, jobId);

        Application application;

        if (existingOpt.isPresent()) {
            application = existingOpt.get();
            application.setResumeId(resumeId);
            application.setTfidfSimilarity(result.getTfidfSimilarity());
            application.setEmbeddingSimilarity(result.getEmbeddingSimilarity());
            application.setSkillMatchPercentage(result.getSkillMatchPercentage());
            application.setQualificationScore(result.getQualificationScore());
            application.setMatchedSkills(result.getMatchedSkills());
            application.setMissingSkills(result.getMissingSkills());
            application.setCreatedAt(Instant.now());
        } else {
            application = Application.builder()
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
        }

        applicationRepository.save(application);

        return result;
    }

    @Override
    public List<Application> getLeaderboard(String jobId) {
        return applicationRepository.findByJobPostingIdOrderByQualificationScoreDesc(jobId);
    }

    @Override
    public void removeFromLeaderboard(String jobId, String applicationId) {

        String userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found"));

        boolean isAdmin = user.getRoles().contains(Role.ADMIN);
        boolean isJobPoster = job.getCreatedBy().equals(userId);
        boolean isCandidate = application.getUserId().equals(userId);

        if (!isAdmin && !isJobPoster && !isCandidate) {
            throw new ForbiddenException("Not allowed to remove this leaderboard entry");
        }

        applicationRepository.delete(application);
    }
}