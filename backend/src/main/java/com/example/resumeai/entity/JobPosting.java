package com.example.resumeai.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "job_postings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPosting {

    @Id
    private String id;

    private String createdBy;
    private String title;
    private String descriptionText;    

    private String shortDescription;    
    private String organisationName;   

    private Boolean isPublic;
    private Boolean allowApplications;
    private Boolean isActive;

    private String contactEmail;        
    private String contactPhone;        

    private Instant createdAt;
    private Instant updatedAt;
}