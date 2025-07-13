package com.example.model;

import jakarta.validation.constraints.NotBlank;

public class Skill {
    @NotBlank(message = "Skill name is required")
    private String name;
    private SkillLevel level;

    public Skill() {}

    public Skill(String name, SkillLevel level) {
        this.name = name;
        this.level = level;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public SkillLevel getLevel() { return level; }
    public void setLevel(SkillLevel level) { this.level = level; }
}
