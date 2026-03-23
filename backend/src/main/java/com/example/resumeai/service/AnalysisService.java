package com.example.resumeai.service;

import com.example.resumeai.dto.ai.AiResult;

import java.util.List;

public interface AnalysisService {

    AiResult compare(String resumeId, String resumeText, String jdText);

    List<?> getHistory();

    void deleteHistoryEntry(String entryId);

    void deleteAllHistory(String targetUserId);
}