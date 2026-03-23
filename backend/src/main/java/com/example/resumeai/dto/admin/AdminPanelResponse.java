package com.example.resumeai.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminPanelResponse {

    private List<JobSummary> jobs;
    private List<RecruiterSummary> recruiters;

    @Data
    @Builder
    public static class JobSummary {
        private String id;
        private String title;
        private Boolean isPublic;
        private Boolean isActive;
        private Boolean allowApplications;
        private String createdBy;
    }

    @Data
    @Builder
    public static class RecruiterSummary {
        private String id;
        private String name;
        private String email;
        private Boolean recruiterVerified;
    }
}
