package com.example.resumeai.service.impl;

import com.example.resumeai.dto.admin.AdminPanelResponse;
import com.example.resumeai.entity.JobPosting;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.repository.JobPostingRepository;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;

    @Override
    public void verifyRecruiter(String userId) {
        System.out.println("ENTERED VERIFY RECRUITER!");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.getRoles().add(Role.RECRUITER);
        user.setRecruiterVerified(true);

        userRepository.save(user);
    }

    @Override
    public void revokeRecruiter(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.getRoles().remove(Role.RECRUITER);
        user.setRecruiterVerified(false);

        userRepository.save(user);
    }

    @Override
    public void deactivateJob(String jobId) {

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException("Job not found"));

        job.setIsActive(false);

        jobPostingRepository.save(job);
    }

    @Override
    public AdminPanelResponse getAdminPanel() {

        List<AdminPanelResponse.JobSummary> jobs = jobPostingRepository.findAll()
                .stream()
                .map(j -> AdminPanelResponse.JobSummary.builder()
                        .id(j.getId())
                        .title(j.getTitle())
                        .isPublic(j.getIsPublic())
                        .isActive(j.getIsActive())
                        .allowApplications(j.getAllowApplications())
                        .createdBy(j.getCreatedBy())
                        .build())
                .toList();

        List<AdminPanelResponse.RecruiterSummary> recruiters = userRepository.findByRolesContaining(Role.RECRUITER)
                .stream()
                .map(u -> AdminPanelResponse.RecruiterSummary.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .recruiterVerified(u.getRecruiterVerified())
                        .build())
                .toList();

        return AdminPanelResponse.builder()
                .jobs(jobs)
                .recruiters(recruiters)
                .build();
    }
}