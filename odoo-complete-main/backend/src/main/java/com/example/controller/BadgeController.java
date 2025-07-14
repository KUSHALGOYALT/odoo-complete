package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ApiResponse;
import com.example.dto.BadgeDto;
import com.example.service.BadgeService;
import com.example.service.UserPrincipal;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<BadgeDto>> getUserBadges(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BadgeDto> badges = badgeService.getUserBadges(userPrincipal.getId());
        return ResponseEntity.ok(badges);
    }

    @GetMapping("/user/earned")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<BadgeDto>> getEarnedBadges(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BadgeDto> badges = badgeService.getEarnedBadges(userPrincipal.getId());
        return ResponseEntity.ok(badges);
    }

    @GetMapping("/user/stats")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BadgeService.BadgeStats> getBadgeStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        BadgeService.BadgeStats stats = badgeService.getBadgeStats(userPrincipal.getId());
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/check")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> checkAndAwardBadges(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            badgeService.checkAndAwardBadges(userPrincipal.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Badge check completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to check badges: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BadgeDto>> getUserBadgesByAdmin(@PathVariable String userId) {
        List<BadgeDto> badges = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(badges);
    }

    @PostMapping("/user/{userId}/check")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> checkAndAwardBadgesByAdmin(@PathVariable String userId) {
        try {
            badgeService.checkAndAwardBadges(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Badge check completed successfully for user " + userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to check badges: " + e.getMessage()));
        }
    }
} 