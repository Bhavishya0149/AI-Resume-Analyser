package com.example.resumeai.dto.job;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobResponse {

    private String id;
    private String title;
}