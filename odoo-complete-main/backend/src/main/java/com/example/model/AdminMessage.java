// com.example.model.AdminMessage.java
package com.example.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admin_messages")
public class AdminMessage {

    @Id
    private String id;

    private String title;

    private String content;

    private String type; // INFO, WARNING, ANNOUNCEMENT, BROADCAST, PERSONAL

    @DBRef
    private User createdBy;

    private LocalDateTime createdAt;

    private boolean isActive = true; // Default to true for new messages
    
    private String targetUserId; // For personal messages to specific users

    // Constructors
    public AdminMessage() {
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }

    public AdminMessage(String title, String content, String type, User createdBy) {
        this.title = title;
        this.content = content;
        this.type = type;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }
    
    public String getTargetUserId() { return targetUserId; }
    public void setTargetUserId(String targetUserId) { this.targetUserId = targetUserId; }
}