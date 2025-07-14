package com.example.config;

import com.example.model.Badge;
import com.example.model.BadgeRarity;
import com.example.repository.BadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class BadgeDataInitializer implements CommandLineRunner {

    @Autowired
    private BadgeRepository badgeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no badges exist
        if (badgeRepository.count() == 0) {
            initializeBadges();
        }
    }

    private void initializeBadges() {
        List<Badge> badges = Arrays.asList(
            // Rating-based badges
            new Badge("First Steps", "Received your first rating", "Star", "text-yellow-600", "bg-yellow-100", 
                     BadgeRarity.COMMON, "RATING", 1, "totalRatings"),
            new Badge("Rising Star", "Maintain a 3+ star average rating", "Star", "text-yellow-600", "bg-yellow-100", 
                     BadgeRarity.COMMON, "RATING", 3, "averageRating"),
            new Badge("Trusted Partner", "Maintain a 4+ star average rating", "Medal", "text-blue-600", "bg-blue-100", 
                     BadgeRarity.RARE, "RATING", 4, "averageRating"),
            new Badge("Perfect Knight", "Maintain a 5-star average rating", "Crown", "text-purple-600", "bg-purple-100", 
                     BadgeRarity.LEGENDARY, "RATING", 5, "averageRating"),
            new Badge("Veteran", "Received 10+ ratings", "Trophy", "text-orange-600", "bg-orange-100", 
                     BadgeRarity.RARE, "RATING", 10, "totalRatings"),
            new Badge("Elite", "Received 25+ ratings", "Award", "text-red-600", "bg-red-100", 
                     BadgeRarity.EPIC, "RATING", 25, "totalRatings"),

            // Swap-based badges
            new Badge("Skill Swapper", "Completed your first skill swap", "Zap", "text-green-600", "bg-green-100", 
                     BadgeRarity.COMMON, "SWAP", 1, "completedSwaps"),
            new Badge("Dedicated Learner", "Completed 5+ skill swaps", "Heart", "text-pink-600", "bg-pink-100", 
                     BadgeRarity.RARE, "SWAP", 5, "completedSwaps"),
            new Badge("Skill Master", "Completed 10+ skill swaps", "Shield", "text-indigo-600", "bg-indigo-100", 
                     BadgeRarity.EPIC, "SWAP", 10, "completedSwaps"),
            new Badge("Grand Master", "Completed 25+ skill swaps", "Sword", "text-gray-800", "bg-gray-100", 
                     BadgeRarity.LEGENDARY, "SWAP", 25, "completedSwaps"),

            // Activity-based badges
            new Badge("Popular", "Profile viewed 100+ times", "Users", "text-blue-600", "bg-blue-100", 
                     BadgeRarity.RARE, "ACTIVITY", 100, "profileViews"),
            new Badge("Communicator", "Sent 50+ messages", "MessageSquare", "text-teal-600", "bg-teal-100", 
                     BadgeRarity.COMMON, "ACTIVITY", 50, "totalMessages"),
            new Badge("Consistent", "Active for 30+ days", "Clock", "text-amber-600", "bg-amber-100", 
                     BadgeRarity.RARE, "ACTIVITY", 30, "daysActive"),

            // Combination badges
            new Badge("Perfect Achiever", "5-star rating with 10+ completed swaps", "Crown", "text-yellow-600", "bg-yellow-100", 
                     BadgeRarity.LEGENDARY, "COMBINATION", 1, "perfect"),
            new Badge("Community Pillar", "25+ ratings and 10+ completed swaps", "Trophy", "text-purple-600", "bg-purple-100", 
                     BadgeRarity.EPIC, "COMBINATION", 1, "community")
        );

        badgeRepository.saveAll(badges);
        System.out.println("✅ Badges initialized successfully!");
    }
} 