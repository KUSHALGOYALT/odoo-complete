package com.example.controller;

import com.example.dto.ApiResponse;
import com.example.dto.UserProfileDto;
import com.example.dto.SearchDto;
import com.example.service.UserService;
import com.example.service.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
import com.example.model.User;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileDto> getUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileDto profile = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserProfileDto profileDto) {
        try {
            userService.validateSkills(profileDto.getOfferedSkills(), profileDto.getWantedSkills());
            userService.updateProfile(userPrincipal.getId(), profileDto);
            return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to update profile: " + e.getMessage()));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<UserProfileDto>> getPublicUsers() {
        return ResponseEntity.ok(userService.getAllPublicUsers());
    }

    @PostMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam(required = false) String q,
                                                  @RequestParam(required = false) String skill,
                                                  Authentication authentication) {
        String currentUserId = authentication.getName();
        List<User> users = userService.searchUsers(q, skill, currentUserId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/available")
    public ResponseEntity<List<User>> getAvailableUsers(Authentication authentication) {
        String currentUserId = authentication.getName();
        List<User> users = userService.getAvailableUsers(currentUserId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable String id) {
        userService.incrementProfileViews(id);
        return ResponseEntity.ok(userService.getUserProfile(id));
    }
}