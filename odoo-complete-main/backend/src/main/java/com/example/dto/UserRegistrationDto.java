package com.example.dto;

import jakarta.validation.constraints.*;
import java.util.List;
import com.example.model.Skill;

public class UserRegistrationDto {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String location;
    private String tagline;
    private boolean isPublic = true;

    private List<Skill> offeredSkills;
    private List<String> wantedSkills;
    private String availability;

    // ✅ Newly added field
    private String profilePhoto; // could be a URL, base64, or filename

    // --- Getters & Setters ---

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

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

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
}
