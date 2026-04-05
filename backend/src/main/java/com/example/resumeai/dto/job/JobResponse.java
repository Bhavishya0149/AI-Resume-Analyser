package com.example.resumeai.dto.job;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class JobResponse {

    private String id;
    private String title;
    private String shortDescription;
    private String organisationName;
    private Boolean isPublic;
    private Boolean allowApplications;
    private Boolean isActive;
    private String contactEmail;
    private String contactPhone;
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}