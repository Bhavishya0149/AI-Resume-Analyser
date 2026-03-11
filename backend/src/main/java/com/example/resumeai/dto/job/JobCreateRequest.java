package com.example.resumeai.dto.job;

import lombok.Data;

@Data
public class JobCreateRequest {

    private String title;
    private String descriptionText;
    private Boolean isPublic;
    private Boolean allowApplications;
}