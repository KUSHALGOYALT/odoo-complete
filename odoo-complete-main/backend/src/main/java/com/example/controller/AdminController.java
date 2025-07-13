package com.example.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.AdminDashboardStats;
import com.example.dto.AdminMessageDto;
import com.example.dto.ApiResponse;
import com.example.model.AdminMessage;
import com.example.model.SwapRequest;
import com.example.model.User;
import com.example.service.AdminService;
import com.example.service.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/swaps")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SwapRequest>> getAllSwapRequests() {
        List<SwapRequest> swaps = adminService.getAllSwapRequests();
        return ResponseEntity.ok(swaps);
    }

    @PutMapping("/users/{userId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> banUser(@PathVariable String userId) {
        User bannedUser = adminService.banUser(userId);
        return ResponseEntity.ok(new ApiResponse(true, "User banned successfully"));
    }

    @PutMapping("/users/{userId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> unbanUser(@PathVariable String userId) {
        User unbannedUser = adminService.unbanUser(userId);
        return ResponseEntity.ok(new ApiResponse(true, "User unbanned successfully"));
    }

    @PostMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> sendPlatformMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AdminMessageDto messageDto) {
        AdminMessage message = adminService.sendPlatformMessage(userPrincipal.getId(), messageDto);
        return ResponseEntity.ok(new ApiResponse(true, "Message sent successfully"));
    }

    @GetMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminMessage>> getAllPlatformMessages() {
        List<AdminMessage> messages = adminService.getAllPlatformMessages();
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminMessage>> getActivePlatformMessages() {
        List<AdminMessage> messages = adminService.getActivePlatformMessages();
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/messages/{messageId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deactivateMessage(@PathVariable String messageId) {
        adminService.deactivateMessage(messageId);
        return ResponseEntity.ok(new ApiResponse(true, "Message deactivated successfully"));
    }

    @DeleteMapping("/swaps/{swapId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteSwapRequest(@PathVariable String swapId) {
        adminService.deleteSwapRequest(swapId);
        return ResponseEntity.ok(new ApiResponse(true, "Swap request deleted successfully"));
    }

    @PutMapping("/users/{userId}/make-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> makeUserAdmin(@PathVariable String userId) {
        User adminUser = adminService.makeUserAdmin(userId);
        return ResponseEntity.ok(new ApiResponse(true, "User promoted to admin successfully"));
    }

    @PutMapping("/users/{userId}/remove-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> removeAdminRole(@PathVariable String userId) {
        User user = adminService.removeAdminRole(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Admin role removed successfully"));
    }

    @DeleteMapping("/users/{userId}/skills/{skillName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> rejectSkill(
            @PathVariable String userId,
            @PathVariable String skillName) {
        adminService.rejectSkill(userId, skillName);
        return ResponseEntity.ok(new ApiResponse(true, "Skill rejected successfully"));
    }
}