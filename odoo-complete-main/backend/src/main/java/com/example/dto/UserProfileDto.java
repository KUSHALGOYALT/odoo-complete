package com.example.dto;

import com.example.model.ProfileStats;
import com.example.model.Skill;

import java.util.List;

public class UserProfileDto {
    private String id;
    private String name;
    private String username;
    private String email;
    private String location;
    private String profilePhoto;
    private String tagline;
    private boolean isPublic;
    private List<Skill> offeredSkills;
    private List<String> wantedSkills;
    private String availability;
    private ProfileStats stats;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public List<Skill> getOfferedSkills() { return offeredSkills; }
    public void setOfferedSkills(List<Skill> offeredSkills) { this.offeredSkills = offeredSkills; }

    public List<String> getWantedSkills() { return wantedSkills; }
    public void setWantedSkills(List<String> wantedSkills) { this.wantedSkills = wantedSkills; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public ProfileStats getStats() { return stats; }
    public void setStats(ProfileStats stats) { this.stats = stats; }
}
