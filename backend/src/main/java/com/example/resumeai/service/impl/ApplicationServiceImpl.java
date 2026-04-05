package com.example.resumeai.service.impl;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.dto.application.LeaderboardEntryResponse;
import com.example.resumeai.entity.*;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.*;
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
            throw new ForbiddenException("This job is not accepting applications");
        }

        if (!Boolean.TRUE.equals(job.getIsActive())) {
            throw new ForbiddenException("This job is no longer active");
        }

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!resume.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only apply with your own resume");
        }

        AiResult result = aiService.analyze(resume.getExtractedText(), job.getDescriptionText());

        Optional<Application> existingOpt = applicationRepository
                .findByUserIdAndJobPostingId(userId, jobId);

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
    public List<LeaderboardEntryResponse> getLeaderboard(String jobId) {

        String currentUserId = SecurityUtil.getCurrentUserId();

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        boolean isAdmin = currentUser.getRoles().contains(Role.ADMIN);
        boolean isCreator = job.getCreatedBy().equals(currentUserId);
        boolean canSeeAllResumes = isAdmin || isCreator;

        List<Application> applications = applicationRepository
                .findByJobPostingIdOrderByQualificationScoreDesc(jobId);

        return applications.stream().map(app -> {

            // Pull user profile live from DB (never cached in Application entity)
            LeaderboardEntryResponse.UserSnapshot snapshot = userRepository
                    .findById(app.getUserId())
                    .map(u -> LeaderboardEntryResponse.UserSnapshot.builder()
                            .id(u.getId())
                            .name(u.getName())
                            .profilePictureUrl(u.getProfilePictureUrl())
                            .build())
                    .orElse(null);

            // Resume URL: visible to the applicant themselves, the creator, and admins
            String resumeUrl = null;
            boolean isOwnApplication = app.getUserId().equals(currentUserId);

            if (canSeeAllResumes || isOwnApplication) {
                resumeUrl = resumeRepository.findById(app.getResumeId())
                        .map(Resume::getCloudinaryUrl)
                        .orElse(null);
            }

            return LeaderboardEntryResponse.builder()
                    .applicationId(app.getId())
                    .qualificationScore(app.getQualificationScore())
                    .tfidfSimilarity(app.getTfidfSimilarity())
                    .embeddingSimilarity(app.getEmbeddingSimilarity())
                    .skillMatchPercentage(app.getSkillMatchPercentage())
                    .matchedSkills(app.getMatchedSkills())
                    .missingSkills(app.getMissingSkills())
                    .resumeUrl(resumeUrl)
                    .appliedAt(app.getCreatedAt())
                    .userProfile(snapshot)
                    .build();

        }).toList();
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