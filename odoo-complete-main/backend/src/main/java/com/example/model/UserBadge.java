package com.example.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_badges")
public class UserBadge {
    @Id
    private String id;

    private String userId; // Reference to User

    private String badgeId; // Reference to Badge

    private LocalDateTime earnedAt;

    private Boolean isActive = true;

    private String achievementContext; // Additional context about how the badge was earned

    // Constructors
    public UserBadge() {
        this.earnedAt = LocalDateTime.now();
    }

    public UserBadge(String userId, String badgeId) {
        this.userId = userId;
        this.badgeId = badgeId;
        this.earnedAt = LocalDateTime.now();
    }

    public UserBadge(String userId, String badgeId, String achievementContext) {
        this.userId = userId;
        this.badgeId = badgeId;
        this.achievementContext = achievementContext;
        this.earnedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(String badgeId) {
        this.badgeId = badgeId;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getAchievementContext() {
        return achievementContext;
    }

    public void setAchievementContext(String achievementContext) {
        this.achievementContext = achievementContext;
    }
} 