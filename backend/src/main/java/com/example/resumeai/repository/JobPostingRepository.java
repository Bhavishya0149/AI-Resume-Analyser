package com.example.resumeai.repository;

import com.example.resumeai.entity.JobPosting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobPostingRepository extends MongoRepository<JobPosting, String> {

    List<JobPosting> findByIsPublicTrueAndIsActiveTrue();

    List<JobPosting> findByCreatedBy(String createdBy);
}