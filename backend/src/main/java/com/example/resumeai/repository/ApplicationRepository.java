package com.example.resumeai.repository;

import com.example.resumeai.entity.Application;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {

    Optional<Application> findByUserIdAndJobPostingId(String userId, String jobPostingId);

    List<Application> findByJobPostingIdOrderByQualificationScoreDesc(String jobPostingId);
}