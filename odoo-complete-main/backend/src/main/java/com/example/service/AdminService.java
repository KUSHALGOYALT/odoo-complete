package com.example.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.FlaggedSkillDto;
import com.example.dto.PlatformAnnouncementDto;
import com.example.dto.UserBanDto;
import com.example.exception.ResourceNotFoundException;
import com.example.model.FlaggedSkill;
import com.example.model.PlatformAnnouncement;
import com.example.model.SwapRequest;
import com.example.model.SwapStatus;
import com.example.model.User;
import com.example.model.UserBan;
import com.example.repository.FlaggedSkillRepository;
import com.example.repository.PlatformAnnouncementRepository;
import com.example.repository.SwapRequestRepository;
import com.example.repository.UserBanRepository;
import com.example.repository.UserRepository;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private FlaggedSkillRepository flaggedSkillRepository;

    @Autowired
    private UserBanRepository userBanRepository;

    @Autowired
    private PlatformAnnouncementRepository announcementRepository;

    // ========================
    // FLAGGED SKILLS MANAGEMENT
    // ========================

    public List<FlaggedSkill> getFlaggedSkills() {
        return flaggedSkillRepository.findByStatusOrderByFlaggedAtDesc("PENDING");
    }

    public List<FlaggedSkill> getFlaggedSkillsByStatus(String status) {
        return flaggedSkillRepository.findByStatusOrderByFlaggedAtDesc(status);
    }

    public FlaggedSkill approveSkill(String flaggedSkillId, String adminId, String reviewNotes) {
        FlaggedSkill flaggedSkill = flaggedSkillRepository.findById(flaggedSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Flagged skill not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        flaggedSkill.setStatus("APPROVED");
        flaggedSkill.setReviewedAt(LocalDateTime.now());
        flaggedSkill.setReviewedBy(admin);
        flaggedSkill.setReviewNotes(reviewNotes);

        return flaggedSkillRepository.save(flaggedSkill);
    }

    public FlaggedSkill rejectSkill(String flaggedSkillId, String adminId, String reviewNotes) {
        FlaggedSkill flaggedSkill = flaggedSkillRepository.findById(flaggedSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Flagged skill not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        // Remove the skill from user's offered skills
        User user = flaggedSkill.getUser();
        if (user.getOfferedSkills() != null) {
            user.getOfferedSkills().removeIf(skill -> skill.getName().equals(flaggedSkill.getSkillName()));
            userRepository.save(user);
        }

        flaggedSkill.setStatus("REJECTED");
        flaggedSkill.setReviewedAt(LocalDateTime.now());
        flaggedSkill.setReviewedBy(admin);
        flaggedSkill.setReviewNotes(reviewNotes);

        return flaggedSkillRepository.save(flaggedSkill);
    }

    public FlaggedSkill flagSkill(FlaggedSkillDto flaggedSkillDto) {
        User user = userRepository.findById(flaggedSkillDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FlaggedSkill flaggedSkill = new FlaggedSkill(
            user,
            flaggedSkillDto.getSkillName(),
            flaggedSkillDto.getSkillDescription(),
            flaggedSkillDto.getReason()
        );

        return flaggedSkillRepository.save(flaggedSkill);
    }

    // ========================
    // USER BAN MANAGEMENT
    // ========================

    public UserBan banUser(UserBanDto banDto, String adminId) {
        User user = userRepository.findById(banDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        // Check if user is already banned
        Optional<UserBan> existingBan = userBanRepository.findByUserIdAndIsActiveTrue(banDto.getUserId());
        if (existingBan.isPresent()) {
            throw new RuntimeException("User is already banned");
        }

        // Create new ban record
        UserBan userBan = new UserBan(user, admin, banDto.getReason());
        userBan = userBanRepository.save(userBan);

        // Update user status
        user.setBanned(true);
        userRepository.save(user);

        return userBan;
    }

    public UserBan unbanUser(String userId, String adminId, String unbanReason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        UserBan userBan = userBanRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No active ban found for user"));

        userBan.setActive(false);
        userBan.setUnbannedAt(LocalDateTime.now());
        userBan.setUnbannedBy(admin);
        userBan.setUnbanReason(unbanReason);
        userBan = userBanRepository.save(userBan);

        // Update user status
        user.setBanned(false);
        userRepository.save(user);

        return userBan;
    }

    public List<UserBan> getActiveBans() {
        return userBanRepository.findByIsActiveTrue();
    }

    public List<UserBan> getBanHistory(String userId) {
        return userBanRepository.findByUserIdOrderByBannedAtDesc(userId);
    }

    public List<UserBan> getAllBanHistory() {
        return userBanRepository.findAllByOrderByBannedAtDesc();
    }

    // ========================
    // SWAP MONITORING
    // ========================

    public List<SwapRequest> getAllSwaps() {
        return swapRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<SwapRequest> getSwapsByStatus(String status) {
        return swapRequestRepository.findByStatus(SwapStatus.valueOf(status.toUpperCase()));
    }

    public Map<String, Object> getSwapStatistics() {
        List<SwapRequest> allSwaps = swapRequestRepository.findAll();
        
        long totalSwaps = allSwaps.size();
        long pendingSwaps = allSwaps.stream().filter(s -> SwapStatus.PENDING.equals(s.getStatus())).count();
        long acceptedSwaps = allSwaps.stream().filter(s -> SwapStatus.ACCEPTED.equals(s.getStatus())).count();
        long cancelledSwaps = allSwaps.stream().filter(s -> SwapStatus.CANCELLED.equals(s.getStatus())).count();
        long completedSwaps = allSwaps.stream().filter(s -> SwapStatus.COMPLETED.equals(s.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSwaps", totalSwaps);
        stats.put("pendingSwaps", pendingSwaps);
        stats.put("acceptedSwaps", acceptedSwaps);
        stats.put("cancelledSwaps", cancelledSwaps);
        stats.put("completedSwaps", completedSwaps);
        stats.put("completionRate", totalSwaps > 0 ? (double) completedSwaps / totalSwaps * 100 : 0);

        return stats;
    }

    // ========================
    // PLATFORM ANNOUNCEMENTS
    // ========================

    public PlatformAnnouncement createAnnouncement(PlatformAnnouncementDto announcementDto, String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        PlatformAnnouncement announcement = new PlatformAnnouncement(
            announcementDto.getTitle(),
            announcementDto.getMessage(),
            announcementDto.getType(),
            admin
        );

        return announcementRepository.save(announcement);
    }

    public List<PlatformAnnouncement> getActiveAnnouncements() {
        return announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<PlatformAnnouncement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    public PlatformAnnouncement updateAnnouncement(String announcementId, PlatformAnnouncementDto announcementDto) {
        PlatformAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        announcement.setTitle(announcementDto.getTitle());
        announcement.setMessage(announcementDto.getMessage());
        announcement.setType(announcementDto.getType());
        announcement.setUpdatedAt(LocalDateTime.now());

        return announcementRepository.save(announcement);
    }

    public void deactivateAnnouncement(String announcementId) {
        PlatformAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        announcement.setActive(false);
        announcement.setUpdatedAt(LocalDateTime.now());
        announcementRepository.save(announcement);
    }

    // ========================
    // REPORTS GENERATION
    // ========================

    public Map<String, Object> generateUserActivityReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(user -> user.isActive() && !user.isBanned()).count();
        long bannedUsers = allUsers.stream().filter(User::isBanned).count();
        
        report.put("userStats", Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "bannedUsers", bannedUsers,
            "inactiveUsers", totalUsers - activeUsers - bannedUsers
        ));
        
        // Recent user activity
        List<User> recentUsers = allUsers.stream()
            .sorted((u1, u2) -> Integer.compare(u2.getStats().getProfileViews(), u1.getStats().getProfileViews()))
            .limit(10)
            .toList();
        
        report.put("recentUsers", recentUsers);
        
        return report;
    }

    public Map<String, Object> generateSwapStatsReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        Map<String, Object> swapStats = getSwapStatistics();
        report.put("swapStats", swapStats);
        
        // Recent swaps
        List<SwapRequest> recentSwaps = swapRequestRepository.findAllByOrderByCreatedAtDesc();
        report.put("recentSwaps", recentSwaps.stream().limit(20).toList());
        
        return report;
    }

    public Map<String, Object> generateFeedbackReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        List<User> allUsers = userRepository.findAll();
        double averageRating = allUsers.stream()
            .mapToDouble(user -> user.getStats() != null ? user.getStats().getAverageRating() : 0.0)
            .average()
            .orElse(0.0);
        
        long totalRatings = allUsers.stream()
            .mapToLong(user -> user.getStats() != null ? user.getStats().getTotalRatings() : 0)
            .sum();
        
        report.put("feedbackStats", Map.of(
            "averageRating", averageRating,
            "totalRatings", totalRatings,
            "usersWithRatings", allUsers.stream()
                .filter(user -> user.getStats() != null && user.getStats().getTotalRatings() > 0)
                .count()
        ));
        
        // Top rated users
        List<User> topRatedUsers = allUsers.stream()
            .filter(user -> user.getStats() != null && user.getStats().getAverageRating() > 0)
            .sorted((u1, u2) -> Double.compare(u2.getStats().getAverageRating(), u1.getStats().getAverageRating()))
            .limit(10)
            .toList();
        
        report.put("topRatedUsers", topRatedUsers);
        
        return report;
    }

    // ========================
    // DASHBOARD STATISTICS
    // ========================

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrueAndBannedFalse();
        long bannedUsers = userBanRepository.findByIsActiveTrue().size();
        
        // Swap statistics
        Map<String, Object> swapStats = getSwapStatistics();
        
        // Flagged skills
        long pendingFlaggedSkills = flaggedSkillRepository.countByStatus("PENDING");
        
        // Announcements
        long activeAnnouncements = announcementRepository.countByIsActiveTrue();
        
        stats.put("userStats", Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "bannedUsers", bannedUsers
        ));
        
        stats.put("swapStats", swapStats);
        stats.put("pendingFlaggedSkills", pendingFlaggedSkills);
        stats.put("activeAnnouncements", activeAnnouncements);
        
        return stats;
    }
}