package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FlaggedSkillDto {
    
    @NotBlank(message = "Skill name is required")
    private String skillName;
    
    @NotBlank(message = "Skill description is required")
    private String skillDescription;
    
    @NotBlank(message = "Reason for flagging is required")
    private String reason;
    
    @NotNull(message = "User ID is required")
    private String userId;

    // Constructors
    public FlaggedSkillDto() {}

    public FlaggedSkillDto(String skillName, String skillDescription, String reason, String userId) {
        this.skillName = skillName;
        this.skillDescription = skillDescription;
        this.reason = reason;
        this.userId = userId;
    }

    // Getters and Setters
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getSkillDescription() { return skillDescription; }
    public void setSkillDescription(String skillDescription) { this.skillDescription = skillDescription; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
} 