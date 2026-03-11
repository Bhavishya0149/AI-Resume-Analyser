package com.example.resumeai.service;

public interface AdminService {

    void verifyRecruiter(String userId);

    void revokeRecruiter(String userId);

    void deactivateJob(String jobId);
}