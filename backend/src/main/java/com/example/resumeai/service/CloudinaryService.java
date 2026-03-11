package com.example.resumeai.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadFile(MultipartFile file, String folder);
    void deleteFile(String publicId);
}