package com.example.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.model.ProfileStats;
import com.example.model.User;
import com.example.repository.UserRepository;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no admin users exist
        if (userRepository.findByRolesContaining("ADMIN").isEmpty()) {
            initializeAdminUser();
        }
    }

    private void initializeAdminUser() {
        // Create default admin user
        User adminUser = new User();
        adminUser.setName("Platform Administrator");
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@skillswap.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setLocation("System");
        adminUser.setTagline("Platform Administrator - Full System Control");
        adminUser.setPublic(false);
        adminUser.setActive(true);
        adminUser.setBanned(false);
        adminUser.setAvailability("AVAILABLE");
        
        // Set admin role only (no USER role needed for pure admin)
        adminUser.getRoles().clear();
        adminUser.getRoles().add("ADMIN");
        
        // Admin doesn't need swap skills - they manage the platform
        adminUser.setOfferedSkills(Arrays.asList());
        adminUser.setWantedSkills(Arrays.asList());
        
        // Initialize stats (admin doesn't participate in swaps)
        ProfileStats stats = new ProfileStats();
        stats.setTotalRatings(0);
        stats.setAverageRating(0.0);
        stats.setTotalSwaps(0);
        stats.setCompletedSwaps(0);
        stats.setProfileViews(0);
        adminUser.setStats(stats);

        userRepository.save(adminUser);
        System.out.println("✅ Platform Administrator created successfully!");
        System.out.println("📧 Email: admin@skillswap.com");
        System.out.println("🔑 Password: admin123");
        System.out.println("🎯 Role: Full Platform Administrator");
        System.out.println("⚠️  Please change the password after first login!");
    }
} 