package com.example.resumeai.service.impl;

import com.example.resumeai.entity.JobPosting;
import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import com.example.resumeai.repository.JobPostingRepository;
import com.example.resumeai.repository.UserRepository;
import com.example.resumeai.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;

    @Override
    public void verifyRecruiter(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getRoles().add(Role.RECRUITER);
        user.setRecruiterVerified(true);

        userRepository.save(user);
    }

    @Override
    public void revokeRecruiter(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getRoles().remove(Role.RECRUITER);
        user.setRecruiterVerified(false);

        userRepository.save(user);
    }

    @Override
    public void deactivateJob(String jobId) {

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setIsActive(false);

        jobPostingRepository.save(job);
    }
}