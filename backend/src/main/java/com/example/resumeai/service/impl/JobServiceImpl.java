package com.example.resumeai.service.impl;

import com.example.resumeai.dto.job.JobCreateRequest;
import com.example.resumeai.dto.job.JobResponse;
import com.example.resumeai.entity.JobPosting;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.JobPostingRepository;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.repository.ApplicationRepository;
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
            throw new ForbiddenException("Not allowed to create public job");
        }

        JobPosting job = JobPosting.builder()
                .createdBy(userId)
                .title(request.getTitle())
                .descriptionText(request.getDescriptionText())
                .isPublic(request.getIsPublic())
                .allowApplications(request.getAllowApplications())
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        jobPostingRepository.save(job);

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .build();
    }

    @Override
    public List<JobResponse> getPublicJobs() {
        return jobPostingRepository.findByIsPublicTrueAndIsActiveTrue()
                .stream()
                .map(j -> JobResponse.builder()
                        .id(j.getId())
                        .title(j.getTitle())
                        .build())
                .toList();
    }

    @Override
    public List<JobResponse> getMyJobs() {

        String userId = SecurityUtil.getCurrentUserId();

        return jobPostingRepository.findByCreatedBy(userId)
                .stream()
                .map(j -> JobResponse.builder()
                        .id(j.getId())
                        .title(j.getTitle())
                        .build())
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
}