package com.example.resumeai.repository;

import com.example.resumeai.entity.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResumeRepository extends MongoRepository<Resume, String> {

    List<Resume> findByUserId(String userId);

    long countByUserId(String userId);
}