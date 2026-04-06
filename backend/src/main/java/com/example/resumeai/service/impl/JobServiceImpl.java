package com.example.resumeai.service.impl;

import com.example.resumeai.dto.job.JobCreateRequest;
import com.example.resumeai.dto.job.JobUpdateRequest;
import com.example.resumeai.dto.job.JobResponse;
import com.example.resumeai.entity.JobPosting;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.BadRequestException;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.ApplicationRepository;
import com.example.resumeai.repository.JobPostingRepository;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.JobService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public JobResponse createJob(JobCreateRequest request) {

        String userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean canCreatePublic = user.getRoles().contains(Role.ADMIN)
                || Boolean.TRUE.equals(user.getRecruiterVerified());

        if (Boolean.TRUE.equals(request.getIsPublic()) && !canCreatePublic) {
            throw new ForbiddenException("Not allowed to create a public job posting");
        }

        JobPosting job = JobPosting.builder()
                .createdBy(userId)
                .title(request.getTitle().trim())
                .descriptionText(request.getDescriptionText().trim())
                .shortDescription(request.getShortDescription() != null
                        ? request.getShortDescription().trim() : null)
                .organisationName(request.getOrganisationName() != null
                        ? request.getOrganisationName().trim() : null)
                .isPublic(request.getIsPublic())
                .allowApplications(request.getAllowApplications())
                .isActive(true)
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        jobPostingRepository.save(job);

        return toJobResponse(job);
    }

    @Override
    public JobResponse updateJob(String jobId, JobUpdateRequest request) {

        String userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        boolean isAdmin = user.getRoles().contains(Role.ADMIN);
        boolean isCreator = job.getCreatedBy().equals(userId);

        if (!isAdmin && !isCreator) {
            throw new ForbiddenException("You are not allowed to edit this job");
        }

        if (request.getDescriptionText() != null
                && !request.getDescriptionText().isBlank()
                && !request.getDescriptionText().equals(job.getDescriptionText())) {
            applicationRepository.deleteByJobPostingId(jobId);
            job.setDescriptionText(request.getDescriptionText().trim());
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            job.setTitle(request.getTitle().trim());
        }

        if (request.getShortDescription() != null) {
            job.setShortDescription(request.getShortDescription().trim());
        }

        if (request.getOrganisationName() != null) {
            job.setOrganisationName(request.getOrganisationName().trim());
        }

        if (request.getIsPublic() != null) {
            boolean canMakePublic = isAdmin || Boolean.TRUE.equals(user.getRecruiterVerified());
            if (Boolean.TRUE.equals(request.getIsPublic()) && !canMakePublic) {
                throw new ForbiddenException("Not allowed to make this job public");
            }
            job.setIsPublic(request.getIsPublic());
        }

        if (request.getAllowApplications() != null) {
            job.setAllowApplications(request.getAllowApplications());
        }

        if (request.getContactEmail() != null) {
            job.setContactEmail(request.getContactEmail().isBlank()
                    ? null : request.getContactEmail());
        }

        if (request.getContactPhone() != null) {
            job.setContactPhone(request.getContactPhone().isBlank()
                    ? null : request.getContactPhone());
        }

        job.setUpdatedAt(Instant.now());
        jobPostingRepository.save(job);

        return toJobResponse(job);
    }

    @Override
    public List<JobResponse> getPublicJobs() {
        return jobPostingRepository.findByIsPublicTrueAndIsActiveTrue()
                .stream()
                .map(this::toJobResponse)
                .toList();
    }

    @Override
    public List<JobResponse> getMyJobs() {
        String userId = SecurityUtil.getCurrentUserId();
        return jobPostingRepository.findByCreatedBy(userId)
                .stream()
                .map(this::toJobResponse)
                .toList();
    }

    @Override
    public void deleteJob(String jobId) {

        String userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        boolean isAdmin = user.getRoles().contains(Role.ADMIN);
        boolean isCreator = job.getCreatedBy().equals(userId);

        if (!isAdmin && !isCreator) {
            throw new ForbiddenException("You are not allowed to delete this job");
        }

        applicationRepository.deleteByJobPostingId(jobId);
        jobPostingRepository.delete(job);
    }

    private JobResponse toJobResponse(JobPosting job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .descriptionText(job.getDescriptionText())
                .shortDescription(job.getShortDescription())
                .organisationName(job.getOrganisationName())
                .isPublic(job.getIsPublic())
                .allowApplications(job.getAllowApplications())
                .isActive(job.getIsActive())
                .contactEmail(job.getContactEmail())
                .contactPhone(job.getContactPhone())
                .createdBy(job.getCreatedBy())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}