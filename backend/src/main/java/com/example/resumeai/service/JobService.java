package com.example.resumeai.service;

import com.example.resumeai.dto.job.JobCreateRequest;
import com.example.resumeai.dto.job.JobUpdateRequest;
import com.example.resumeai.dto.job.JobResponse;

import java.util.List;

public interface JobService {

    JobResponse createJob(JobCreateRequest request);

    JobResponse updateJob(String jobId, JobUpdateRequest request);

    List<JobResponse> getPublicJobs();

    List<JobResponse> getMyJobs();

    void deleteJob(String jobId);
}