package com.example.resumeai.service;

import com.example.resumeai.dto.ai.AiResult;

import java.util.List;

public interface ApplicationService {

    AiResult applyToJob(String jobId, String resumeId);

    List<?> getLeaderboard(String jobId);
}