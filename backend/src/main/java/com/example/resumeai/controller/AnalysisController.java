package com.example.resumeai.controller;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/compare")
    public AiResult compare(
            @RequestParam(required = false) String resumeId,
            @RequestParam(required = false) String resumeText,
            @RequestParam String jdText
    ) {
        return analysisService.compare(resumeId, resumeText, jdText);
    }

    @GetMapping("/history")
    public List<?> history() {
        return analysisService.getHistory();
    }
}