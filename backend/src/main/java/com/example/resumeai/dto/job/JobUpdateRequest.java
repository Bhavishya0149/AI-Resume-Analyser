package com.example.resumeai.dto.job;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class JobUpdateRequest {

    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    private String title;

    private String descriptionText;

    @Size(max = 600, message = "Short description must not exceed 600 characters")
    private String shortDescription;

    @Size(max = 200, message = "Organisation name must not exceed 200 characters")
    private String organisationName;

    private Boolean isPublic;
    private Boolean allowApplications;

    @Email(message = "Invalid contact email format")
    private String contactEmail;

    @Pattern(
        regexp = "^[+]?[0-9\\s\\-()]{7,20}$",
        message = "Invalid contact phone number"
    )
    private String contactPhone;
}