package com.example.resumeai.service;

import com.example.resumeai.dto.resume.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {

    ResumeResponse uploadResume(MultipartFile file);

    List<ResumeResponse> getMyResumes();

    void deleteResume(String id);
}