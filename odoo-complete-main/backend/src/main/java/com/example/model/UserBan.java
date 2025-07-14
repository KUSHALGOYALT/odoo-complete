package com.example.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_bans")
public class UserBan {
    
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    @DBRef
    private User bannedBy;
    
    private String reason;
    private LocalDateTime bannedAt;
    private LocalDateTime unbannedAt;
    
    @DBRef
    private User unbannedBy;
    
    private String unbanReason;
    private boolean isActive;

    // Constructors
    public UserBan() {
        this.bannedAt = LocalDateTime.now();
        this.isActive = true;
    }

    public UserBan(User user, User bannedBy, String reason) {
        this();
        this.user = user;
        this.bannedBy = bannedBy;
        this.reason = reason;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getBannedBy() { return bannedBy; }
    public void setBannedBy(User bannedBy) { this.bannedBy = bannedBy; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getBannedAt() { return bannedAt; }
    public void setBannedAt(LocalDateTime bannedAt) { this.bannedAt = bannedAt; }

    public LocalDateTime getUnbannedAt() { return unbannedAt; }
    public void setUnbannedAt(LocalDateTime unbannedAt) { this.unbannedAt = unbannedAt; }

    public User getUnbannedBy() { return unbannedBy; }
    public void setUnbannedBy(User unbannedBy) { this.unbannedBy = unbannedBy; }

    public String getUnbanReason() { return unbanReason; }
    public void setUnbanReason(String unbanReason) { this.unbanReason = unbanReason; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }
} 