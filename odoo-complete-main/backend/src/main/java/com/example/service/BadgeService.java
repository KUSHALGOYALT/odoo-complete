package com.example.service;

import com.example.dto.BadgeDto;
import com.example.model.Badge;
import com.example.model.BadgeRarity;
import com.example.model.User;
import com.example.model.UserBadge;
import com.example.repository.BadgeRepository;
import com.example.repository.UserBadgeRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all badges for a user (with earned status)
    public List<BadgeDto> getUserBadges(String userId) {
        List<Badge> allBadges = badgeRepository.findAllActiveOrdered();
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdAndIsActiveTrue(userId);

        return allBadges.stream().map(badge -> {
            BadgeDto dto = convertToDto(badge);
            
            // Check if user has earned this badge
            Optional<UserBadge> userBadge = userBadges.stream()
                .filter(ub -> ub.getBadgeId().equals(badge.getId()))
                .findFirst();
            
            if (userBadge.isPresent()) {
                dto.setIsEarned(true);
                dto.setEarnedAt(userBadge.get().getEarnedAt());
                dto.setAchievementContext(userBadge.get().getAchievementContext());
            } else {
                dto.setIsEarned(false);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    // Get earned badges for a user
    public List<BadgeDto> getEarnedBadges(String userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdAndIsActiveTrue(userId);
        
        return userBadges.stream()
            .map(userBadge -> {
                Badge badge = badgeRepository.findById(userBadge.getBadgeId())
                    .orElseThrow(() -> new RuntimeException("Badge not found"));
                BadgeDto dto = convertToDto(badge);
                dto.setIsEarned(true);
                dto.setEarnedAt(userBadge.getEarnedAt());
                dto.setAchievementContext(userBadge.getAchievementContext());
                return dto;
            })
            .collect(Collectors.toList());
    }

    // Check and award badges based on user stats
    public void checkAndAwardBadges(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user stats
        int totalRatings = user.getStats().getTotalRatings();
        double averageRating = user.getStats().getAverageRating();
        int totalSwaps = user.getStats().getTotalSwaps();
        int completedSwaps = user.getStats().getCompletedSwaps();
        int profileViews = user.getStats().getProfileViews();

        // Check rating-based badges
        checkRatingBadges(user, totalRatings, averageRating);
        
        // Check swap-based badges
        checkSwapBadges(user, totalSwaps, completedSwaps);
        
        // Check activity-based badges
        checkActivityBadges(user, profileViews);
        
        // Check combination badges
        checkCombinationBadges(user, totalRatings, averageRating, completedSwaps);
    }

    private void checkRatingBadges(User user, int totalRatings, double averageRating) {
        // First rating badge
        if (totalRatings >= 1) {
            awardBadgeIfNotEarned(user, "first-rating", "First Steps", 
                "Received your first rating", "Star", "text-yellow-600", "bg-yellow-100", 
                BadgeRarity.COMMON, "RATING", 1, "totalRatings");
        }

        // Rating level badges
        if (totalRatings >= 3 && averageRating >= 3.0) {
            awardBadgeIfNotEarned(user, "rating-3", "Rising Star", 
                "Maintain a 3+ star average rating", "Star", "text-yellow-600", "bg-yellow-100", 
                BadgeRarity.COMMON, "RATING", 3, "averageRating");
        }

        if (totalRatings >= 5 && averageRating >= 4.0) {
            awardBadgeIfNotEarned(user, "rating-4", "Trusted Partner", 
                "Maintain a 4+ star average rating", "Medal", "text-blue-600", "bg-blue-100", 
                BadgeRarity.RARE, "RATING", 4, "averageRating");
        }

        if (totalRatings >= 10 && averageRating >= 4.8) {
            awardBadgeIfNotEarned(user, "rating-5", "Perfect Knight", 
                "Maintain a 5-star average rating", "Crown", "text-purple-600", "bg-purple-100", 
                BadgeRarity.LEGENDARY, "RATING", 5, "averageRating");
        }

        // Rating count badges
        if (totalRatings >= 10) {
            awardBadgeIfNotEarned(user, "rating-10", "Veteran", 
                "Received 10+ ratings", "Trophy", "text-orange-600", "bg-orange-100", 
                BadgeRarity.RARE, "RATING", 10, "totalRatings");
        }

        if (totalRatings >= 25) {
            awardBadgeIfNotEarned(user, "rating-25", "Elite", 
                "Received 25+ ratings", "Award", "text-red-600", "bg-red-100", 
                BadgeRarity.EPIC, "RATING", 25, "totalRatings");
        }
    }

    private void checkSwapBadges(User user, int totalSwaps, int completedSwaps) {
        // First swap badge
        if (completedSwaps >= 1) {
            awardBadgeIfNotEarned(user, "first-swap", "Skill Swapper", 
                "Completed your first skill swap", "Zap", "text-green-600", "bg-green-100", 
                BadgeRarity.COMMON, "SWAP", 1, "completedSwaps");
        }

        // Swap count badges
        if (completedSwaps >= 5) {
            awardBadgeIfNotEarned(user, "swap-5", "Dedicated Learner", 
                "Completed 5+ skill swaps", "Heart", "text-pink-600", "bg-pink-100", 
                BadgeRarity.RARE, "SWAP", 5, "completedSwaps");
        }

        if (completedSwaps >= 10) {
            awardBadgeIfNotEarned(user, "swap-10", "Skill Master", 
                "Completed 10+ skill swaps", "Shield", "text-indigo-600", "bg-indigo-100", 
                BadgeRarity.EPIC, "SWAP", 10, "completedSwaps");
        }

        if (completedSwaps >= 25) {
            awardBadgeIfNotEarned(user, "swap-25", "Grand Master", 
                "Completed 25+ skill swaps", "Sword", "text-gray-800", "bg-gray-100", 
                BadgeRarity.LEGENDARY, "SWAP", 25, "completedSwaps");
        }
    }

    private void checkActivityBadges(User user, int profileViews) {
        // Profile views badge
        if (profileViews >= 100) {
            awardBadgeIfNotEarned(user, "views-100", "Popular", 
                "Profile viewed 100+ times", "Users", "text-blue-600", "bg-blue-100", 
                BadgeRarity.RARE, "ACTIVITY", 100, "profileViews");
        }
    }

    private void checkCombinationBadges(User user, int totalRatings, double averageRating, int completedSwaps) {
        // Perfect achiever badge
        if (totalRatings >= 10 && averageRating >= 4.8 && completedSwaps >= 10) {
            awardBadgeIfNotEarned(user, "perfect-achiever", "Perfect Achiever", 
                "5-star rating with 10+ completed swaps", "Crown", "text-yellow-600", "bg-yellow-100", 
                BadgeRarity.LEGENDARY, "COMBINATION", 1, "perfect");
        }

        // Community pillar badge
        if (totalRatings >= 25 && completedSwaps >= 10) {
            awardBadgeIfNotEarned(user, "community-pillar", "Community Pillar", 
                "25+ ratings and 10+ completed swaps", "Trophy", "text-purple-600", "bg-purple-100", 
                BadgeRarity.EPIC, "COMBINATION", 1, "community");
        }
    }

    private void awardBadgeIfNotEarned(User user, String badgeId, String name, String description, 
                                     String icon, String color, String bgColor, BadgeRarity rarity, 
                                     String conditionType, Integer conditionValue, String conditionField) {
        
        // Check if user already has this badge
        Optional<UserBadge> existingBadge = userBadgeRepository.findByUserIdAndBadgeId(user.getId(), badgeId);
        if (existingBadge.isPresent()) {
            return; // User already has this badge
        }

        // Find or create the badge
        Badge badge = badgeRepository.findByName(name)
            .orElseGet(() -> createBadge(badgeId, name, description, icon, color, bgColor, rarity, conditionType, conditionValue, conditionField));

        // Award the badge to the user
        UserBadge userBadge = new UserBadge(user.getId(), badge.getId(), 
            "Earned through " + conditionType.toLowerCase() + " achievement");
        userBadgeRepository.save(userBadge);
    }

    private Badge createBadge(String id, String name, String description, String icon, String color, 
                            String bgColor, BadgeRarity rarity, String conditionType, 
                            Integer conditionValue, String conditionField) {
        Badge badge = new Badge(name, description, icon, color, bgColor, rarity, conditionType, conditionValue, conditionField);
        badge.setId(id);
        return badgeRepository.save(badge);
    }

    private BadgeDto convertToDto(Badge badge) {
        BadgeDto dto = new BadgeDto();
        dto.setId(badge.getId());
        dto.setName(badge.getName());
        dto.setDescription(badge.getDescription());
        dto.setIcon(badge.getIcon());
        dto.setColor(badge.getColor());
        dto.setBgColor(badge.getBgColor());
        dto.setRarity(badge.getRarity());
        dto.setConditionType(badge.getConditionType());
        dto.setConditionValue(badge.getConditionValue());
        dto.setConditionField(badge.getConditionField());
        dto.setIsActive(badge.getIsActive());
        dto.setCreatedAt(badge.getCreatedAt());
        dto.setUpdatedAt(badge.getUpdatedAt());
        return dto;
    }

    public BadgeStats getBadgeStats(String userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdAndIsActiveTrue(userId);
        
        long totalBadges = userBadges.size();
        long legendaryBadges = userBadges.stream()
            .filter(ub -> {
                Badge badge = badgeRepository.findById(ub.getBadgeId()).orElse(null);
                return badge != null && badge.getRarity() == BadgeRarity.LEGENDARY;
            }).count();
        long epicBadges = userBadges.stream()
            .filter(ub -> {
                Badge badge = badgeRepository.findById(ub.getBadgeId()).orElse(null);
                return badge != null && badge.getRarity() == BadgeRarity.EPIC;
            }).count();
        long rareBadges = userBadges.stream()
            .filter(ub -> {
                Badge badge = badgeRepository.findById(ub.getBadgeId()).orElse(null);
                return badge != null && badge.getRarity() == BadgeRarity.RARE;
            }).count();
        long commonBadges = userBadges.stream()
            .filter(ub -> {
                Badge badge = badgeRepository.findById(ub.getBadgeId()).orElse(null);
                return badge != null && badge.getRarity() == BadgeRarity.COMMON;
            }).count();

        return new BadgeStats(totalBadges, legendaryBadges, epicBadges, rareBadges, commonBadges);
    }

    public static class BadgeStats {
        private long totalBadges;
        private long legendaryBadges;
        private long epicBadges;
        private long rareBadges;
        private long commonBadges;

        public BadgeStats(long totalBadges, long legendaryBadges, long epicBadges, long rareBadges, long commonBadges) {
            this.totalBadges = totalBadges;
            this.legendaryBadges = legendaryBadges;
            this.epicBadges = epicBadges;
            this.rareBadges = rareBadges;
            this.commonBadges = commonBadges;
        }

        public long getTotalBadges() { return totalBadges; }
        public long getLegendaryBadges() { return legendaryBadges; }
        public long getEpicBadges() { return epicBadges; }
        public long getRareBadges() { return rareBadges; }
        public long getCommonBadges() { return commonBadges; }
    }
} 