package com.example.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "flagged_skills")
public class FlaggedSkill {
    
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    private String skillName;
    private String skillDescription;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime flaggedAt;
    private LocalDateTime reviewedAt;
    
    @DBRef
    private User reviewedBy;
    
    private String reviewNotes;

    // Constructors
    public FlaggedSkill() {
        this.flaggedAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public FlaggedSkill(User user, String skillName, String skillDescription, String reason) {
        this();
        this.user = user;
        this.skillName = skillName;
        this.skillDescription = skillDescription;
        this.reason = reason;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getSkillDescription() { return skillDescription; }
    public void setSkillDescription(String skillDescription) { this.skillDescription = skillDescription; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getFlaggedAt() { return flaggedAt; }
    public void setFlaggedAt(LocalDateTime flaggedAt) { this.flaggedAt = flaggedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
} 