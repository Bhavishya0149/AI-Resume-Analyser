package com.example.resumeai.service.impl;

import com.example.resumeai.config.AppProperties;
import com.example.resumeai.dto.resume.ResumeResponse;
import com.example.resumeai.entity.Resume;
import com.example.resumeai.entity.enums.FileType;
import com.example.resumeai.exception.ForbiddenException;
import com.example.resumeai.exception.NotFoundException;
import com.example.resumeai.exception.ApiException;
import com.example.resumeai.repository.ResumeRepository;
import com.example.resumeai.service.CloudinaryService;
import com.example.resumeai.service.ResumeService;
import com.example.resumeai.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final CloudinaryService cloudinaryService;
    private final AppProperties appProperties;

    private final Tika tika = new Tika();

    @Override
    public ResumeResponse uploadResume(MultipartFile file) {

        String userId = SecurityUtil.getCurrentUserId();

        if (resumeRepository.countByUserId(userId) >= appProperties.getResume().getMaxCount()) {
            throw new ApiException("Resume limit reached");
        }

        if (file.getSize() > appProperties.getResume().getMaxSizeBytes()) {
            throw new ApiException("File too large");
        }

        FileType fileType = getFileType(file.getOriginalFilename());

        String cloudinaryUrl = cloudinaryService.uploadFile(file, "resumes");
        String extractedText;

        try {
            extractedText = tika.parseToString(file.getInputStream());
        } catch (Exception e) {
            throw new ApiException("Text extraction failed");
        }

        Resume resume = Resume.builder()
                .userId(userId)
                .fileName(file.getOriginalFilename())
                .cloudinaryUrl(cloudinaryUrl)
                .extractedText(extractedText)
                .fileType(fileType)
                .fileSize(file.getSize())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        resumeRepository.save(resume);

        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .cloudinaryUrl(resume.getCloudinaryUrl())
                .createdAt(resume.getCreatedAt())
                .build();
    }

    @Override
    public List<ResumeResponse> getMyResumes() {

        String userId = SecurityUtil.getCurrentUserId();

        return resumeRepository.findByUserId(userId)
                .stream()
                .map(r -> ResumeResponse.builder()
                        .id(r.getId())
                        .fileName(r.getFileName())
                        .cloudinaryUrl(r.getCloudinaryUrl())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public void deleteResume(String id) {

        String userId = SecurityUtil.getCurrentUserId();

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!resume.getUserId().equals(userId)) {
            throw new ForbiddenException("Unauthorized");
        }

        cloudinaryService.deleteFile(resume.getCloudinaryUrl());

        resumeRepository.delete(resume);
    }

    private FileType getFileType(String fileName) {

        if (fileName == null) throw new ApiException("Invalid file");

        String lower = fileName.toLowerCase();

        if (lower.endsWith(".pdf")) return FileType.PDF;
        if (lower.endsWith(".docx")) return FileType.DOCX;
        if (lower.endsWith(".txt")) return FileType.TXT;

        throw new ApiException("Unsupported file type");
    }
}