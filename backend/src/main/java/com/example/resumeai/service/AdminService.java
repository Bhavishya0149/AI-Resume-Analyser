package com.example.resumeai.service;

import com.example.resumeai.dto.admin.AdminPanelResponse;

public interface AdminService {

    void verifyRecruiter(String userId);

    void revokeRecruiter(String userId);

    void deactivateJob(String jobId);

    AdminPanelResponse getAdminPanel();
}