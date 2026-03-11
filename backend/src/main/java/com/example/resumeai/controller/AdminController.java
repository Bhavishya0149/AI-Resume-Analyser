package com.example.resumeai.controller;

import com.example.resumeai.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @PatchMapping("/users/{id}/verify-recruiter")
    public String verifyRecruiter(@PathVariable String id) {
        adminService.verifyRecruiter(id);
        return "Recruiter verified";
    }

    @PatchMapping("/users/{id}/revoke-recruiter")
    public String revokeRecruiter(@PathVariable String id) {
        adminService.revokeRecruiter(id);
        return "Recruiter revoked";
    }

    @PatchMapping("/jobs/{id}/deactivate")
    public String deactivateJob(@PathVariable String id) {
        adminService.deactivateJob(id);
        return "Job deactivated";
    }
}