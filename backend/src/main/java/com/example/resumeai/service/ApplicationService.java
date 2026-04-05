package com.example.resumeai.service;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.dto.application.LeaderboardEntryResponse;

import java.util.List;

public interface ApplicationService {

    AiResult applyToJob(String jobId, String resumeId);

    List<LeaderboardEntryResponse> getLeaderboard(String jobId);

    void removeFromLeaderboard(String jobId, String applicationId);
}