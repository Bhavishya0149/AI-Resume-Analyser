package com.example.resumeai.controller;

import com.example.resumeai.dto.job.JobCreateRequest;
import com.example.resumeai.dto.job.JobResponse;
import com.example.resumeai.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    public JobResponse createJob(@RequestBody JobCreateRequest request) {
        return jobService.createJob(request);
    }

    @GetMapping("/public")
    public List<JobResponse> getPublicJobs() {
        return jobService.getPublicJobs();
    }

    @GetMapping("/my")
    public List<JobResponse> getMyJobs() {
        return jobService.getMyJobs();
    }

    @DeleteMapping("/{jobId}")
    public String deleteJob(@PathVariable String jobId) {
        jobService.deleteJob(jobId);
        return "Job deleted successfully";
    }
}