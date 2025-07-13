// com.example.model.User.java
package com.example.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String username;
    private String email;
    private String password;
    private String location;
    private String tagline;
    private boolean isPublic;
    private List<Skill> offeredSkills = new ArrayList<>();
    private List<String> wantedSkills = new ArrayList<>();
    private String profilePhoto;
    private ProfileStats stats = new ProfileStats();
    private List<String> roles = new ArrayList<>();
    private boolean active = true;
    private String availability;
    private boolean banned = false;

    // Constructors
    public User() {
        this.roles.add("USER"); // Default role
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public List<Skill> getOfferedSkills() {
        return offeredSkills;
    }

    public void setOfferedSkills(List<Skill> offeredSkills) {
        this.offeredSkills = offeredSkills;
    }

    public List<String> getWantedSkills() {
        return wantedSkills;
    }

    public void setWantedSkills(List<String> wantedSkills) {
        this.wantedSkills = wantedSkills;
    }
    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public ProfileStats getStats() {
        return stats;
    }

    public void setStats(ProfileStats stats) {
        this.stats = stats;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean isActive) {
        this.active = isActive;
    }

    public boolean isBanned() {
        return banned;
    }

    public void setBanned(boolean banned) {
        this.banned = banned;
    }
}