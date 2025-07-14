package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ApiResponse;
import com.example.dto.FlaggedSkillDto;
import com.example.dto.PlatformAnnouncementDto;
import com.example.dto.UserBanDto;
import com.example.model.FlaggedSkill;
import com.example.model.PlatformAnnouncement;
import com.example.model.SwapRequest;
import com.example.model.UserBan;
import com.example.service.AdminService;
import com.example.service.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ========================
    // DASHBOARD STATISTICS
    // ========================
    
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // ========================
    // FLAGGED SKILLS MANAGEMENT
    // ========================
    
    @GetMapping("/flagged-skills")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FlaggedSkill>> getFlaggedSkills(
            @RequestParam(required = false) String status) {
        List<FlaggedSkill> flaggedSkills;
        if (status != null) {
            flaggedSkills = adminService.getFlaggedSkillsByStatus(status);
        } else {
            flaggedSkills = adminService.getFlaggedSkills();
        }
        return ResponseEntity.ok(flaggedSkills);
    }

    @PostMapping("/flagged-skills")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FlaggedSkill>> flagSkill(
            @Valid @RequestBody FlaggedSkillDto flaggedSkillDto) {
        FlaggedSkill flaggedSkill = adminService.flagSkill(flaggedSkillDto);
        return ResponseEntity.ok(ApiResponse.success(flaggedSkill, "Skill flagged successfully"));
    }

    @PutMapping("/flagged-skills/{flaggedSkillId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FlaggedSkill>> approveSkill(
            @PathVariable String flaggedSkillId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false, defaultValue = "") String reviewNotes) {
        FlaggedSkill flaggedSkill = adminService.approveSkill(flaggedSkillId, userPrincipal.getId(), reviewNotes);
        return ResponseEntity.ok(ApiResponse.success(flaggedSkill, "Skill approved successfully"));
    }

    @PutMapping("/flagged-skills/{flaggedSkillId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FlaggedSkill>> rejectSkill(
            @PathVariable String flaggedSkillId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false, defaultValue = "") String reviewNotes) {
        FlaggedSkill flaggedSkill = adminService.rejectSkill(flaggedSkillId, userPrincipal.getId(), reviewNotes);
        return ResponseEntity.ok(ApiResponse.success(flaggedSkill, "Skill rejected successfully"));
    }

    // ========================
    // USER BAN MANAGEMENT
    // ========================
    
    @PostMapping("/users/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserBan>> banUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserBanDto banDto) {
        UserBan userBan = adminService.banUser(banDto, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(userBan, "User banned successfully"));
    }

    @PostMapping("/users/{userId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserBan>> unbanUser(
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false, defaultValue = "Admin decision") String unbanReason) {
        UserBan userBan = adminService.unbanUser(userId, userPrincipal.getId(), unbanReason);
        return ResponseEntity.ok(ApiResponse.success(userBan, "User unbanned successfully"));
    }

    @GetMapping("/users/bans/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserBan>> getActiveBans() {
        List<UserBan> activeBans = adminService.getActiveBans();
        return ResponseEntity.ok(activeBans);
    }

    @GetMapping("/users/{userId}/bans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserBan>> getUserBanHistory(@PathVariable String userId) {
        List<UserBan> banHistory = adminService.getBanHistory(userId);
        return ResponseEntity.ok(banHistory);
    }

    @GetMapping("/users/bans/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserBan>> getAllBanHistory() {
        List<UserBan> allBanHistory = adminService.getAllBanHistory();
        return ResponseEntity.ok(allBanHistory);
    }

    // ========================
    // SWAP MONITORING
    // ========================
    
    @GetMapping("/swaps")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SwapRequest>> getAllSwaps(
            @RequestParam(required = false) String status) {
        List<SwapRequest> swaps;
        if (status != null) {
            swaps = adminService.getSwapsByStatus(status);
        } else {
            swaps = adminService.getAllSwaps();
        }
        return ResponseEntity.ok(swaps);
    }

    @GetMapping("/swaps/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSwapStatistics() {
        Map<String, Object> stats = adminService.getSwapStatistics();
        return ResponseEntity.ok(stats);
    }

    // ========================
    // PLATFORM ANNOUNCEMENTS
    // ========================
    
    @PostMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlatformAnnouncement>> createAnnouncement(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PlatformAnnouncementDto announcementDto) {
        PlatformAnnouncement announcement = adminService.createAnnouncement(announcementDto, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(announcement, "Announcement created successfully"));
    }

    @GetMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlatformAnnouncement>> getAnnouncements(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<PlatformAnnouncement> announcements;
        if (activeOnly) {
            announcements = adminService.getActiveAnnouncements();
        } else {
            announcements = adminService.getAllAnnouncements();
        }
        return ResponseEntity.ok(announcements);
    }

    // Public endpoint for users to get active announcements
    @GetMapping("/announcements/public")
    public ResponseEntity<List<PlatformAnnouncement>> getPublicAnnouncements() {
        List<PlatformAnnouncement> announcements = adminService.getActiveAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @PutMapping("/announcements/{announcementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlatformAnnouncement>> updateAnnouncement(
            @PathVariable String announcementId,
            @Valid @RequestBody PlatformAnnouncementDto announcementDto) {
        PlatformAnnouncement announcement = adminService.updateAnnouncement(announcementId, announcementDto);
        return ResponseEntity.ok(ApiResponse.success(announcement, "Announcement updated successfully"));
    }

    @DeleteMapping("/announcements/{announcementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deactivateAnnouncement(@PathVariable String announcementId) {
        adminService.deactivateAnnouncement(announcementId);
        return ResponseEntity.ok(ApiResponse.success("Announcement deactivated successfully"));
    }

    // ========================
    // REPORTS GENERATION
    // ========================
    
    @GetMapping("/reports/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserActivityReport() {
        Map<String, Object> report = adminService.generateUserActivityReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/swap-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSwapStatsReport() {
        Map<String, Object> report = adminService.generateSwapStatsReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFeedbackReport() {
        Map<String, Object> report = adminService.generateFeedbackReport();
        return ResponseEntity.ok(report);
    }
}