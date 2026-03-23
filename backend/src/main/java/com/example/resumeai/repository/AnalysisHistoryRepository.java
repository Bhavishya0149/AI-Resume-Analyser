package com.example.resumeai.repository;

import com.example.resumeai.entity.AnalysisHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AnalysisHistoryRepository extends MongoRepository<AnalysisHistory, String> {

    List<AnalysisHistory> findByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserId(String userId);
}