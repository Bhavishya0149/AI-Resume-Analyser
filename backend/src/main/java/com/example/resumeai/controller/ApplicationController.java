package com.example.resumeai.controller;

import com.example.resumeai.dto.ai.AiResult;
import com.example.resumeai.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/{id}/apply")
    public AiResult apply(
            @PathVariable String id,
            @RequestParam String resumeId
    ) {
        return applicationService.applyToJob(id, resumeId);
    }

    @GetMapping("/{id}/leaderboard")
    public List<?> leaderboard(@PathVariable String id) {
        return applicationService.getLeaderboard(id);
    }

    @DeleteMapping("/{jobId}/leaderboard/{applicationId}")
    public ResponseEntity<?> removeFromLeaderboard(
            @PathVariable String jobId,
            @PathVariable String applicationId
    ) {
        applicationService.removeFromLeaderboard(jobId, applicationId);
        return ResponseEntity.ok(Map.of("message", "Entry removed from leaderboard"));
    }
}