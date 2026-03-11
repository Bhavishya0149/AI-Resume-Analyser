package com.example.resumeai.service;

import com.example.resumeai.dto.ai.AiResult;

public interface AiService {

    AiResult analyze(String resumeText, String jdText);
}