package com.example.dto;

public class SearchDto {
    private String skill;
    private String location;
    private String skillLevel;
    private boolean wantedSkills = false;

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public boolean isWantedSkills() {
        return wantedSkills;
    }

    public void setWantedSkills(boolean wantedSkills) {
        this.wantedSkills = wantedSkills;
    }
}
