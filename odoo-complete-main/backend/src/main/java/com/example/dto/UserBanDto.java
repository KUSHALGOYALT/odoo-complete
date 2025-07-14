package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserBanDto {
    
    @NotNull(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Ban reason is required")
    private String reason;

    // Constructors
    public UserBanDto() {}

    public UserBanDto(String userId, String reason) {
        this.userId = userId;
        this.reason = reason;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
} 