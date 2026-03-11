package com.example.resumeai.controller;

import com.example.resumeai.dto.resume.ResumeResponse;
import com.example.resumeai.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping
    public ResumeResponse uploadResume(@RequestParam("file") MultipartFile file) {
        return resumeService.uploadResume(file);
    }

    @GetMapping
    public List<ResumeResponse> getMyResumes() {
        return resumeService.getMyResumes();
    }

    @DeleteMapping("/{id}")
    public String deleteResume(@PathVariable String id) {
        resumeService.deleteResume(id);
        return "Resume deleted";
    }
}