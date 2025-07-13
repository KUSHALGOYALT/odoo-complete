// com.example.service.AdminService.java
package com.example.service;

import com.example.dto.AdminDashboardStats;
import com.example.dto.AdminMessageDto;
import com.example.model.AdminMessage;
import com.example.model.SwapRequest;
import com.example.model.User;
import com.example.repository.AdminMessageRepository;
import com.example.repository.SwapRequestRepository;
import com.example.repository.UserRepository;
import com.example.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private AdminMessageRepository adminMessageRepository;

    public AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByBannedFalse();
        long totalSwaps = swapRequestRepository.count();
        long pendingSwaps = swapRequestRepository.countByStatus("PENDING");
        long completedSwaps = swapRequestRepository.countByStatus("COMPLETED");
        long totalMessages = adminMessageRepository.count();

        return new AdminDashboardStats(
                totalUsers,
                activeUsers,
                totalSwaps,
                pendingSwaps,
                completedSwaps,
                totalMessages
        );
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<SwapRequest> getAllSwapRequests() {
        return swapRequestRepository.findAll();
    }

    public User banUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setBanned(true);
        return userRepository.save(user);
    }

    public User unbanUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setBanned(false);
        return userRepository.save(user);
    }

    public AdminMessage sendPlatformMessage(String adminId, AdminMessageDto messageDto) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        AdminMessage message = new AdminMessage();
        message.setTitle(messageDto.getTitle());
        message.setContent(messageDto.getContent());
        message.setType(messageDto.getType());
        message.setCreatedBy(admin);
        message.setCreatedAt(LocalDateTime.now());

        return adminMessageRepository.save(message);
    }

    public List<AdminMessage> getAllPlatformMessages() {
        return adminMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteSwapRequest(String swapId) {
        SwapRequest swapRequest = swapRequestRepository.findById(swapId)
                .orElseThrow(() -> new ResourceNotFoundException("SwapRequest", "id", swapId));
        swapRequestRepository.delete(swapRequest);
    }

    public User makeUserAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole("ADMIN");
        return userRepository.save(user);
    }

    public User removeAdminRole(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole("USER");
        return userRepository.save(user);
    }

    public void rejectSkill(String userId, String skillName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Remove skill from user's offered skills
        if (user.getOfferedSkills() != null) {
            user.getOfferedSkills().removeIf(skill -> skill.equals(skillName));
        }

        // Remove skill from user's wanted skills
        if (user.getWantedSkills() != null) {
            user.getWantedSkills().removeIf(skill -> skill.equals(skillName));
        }

        userRepository.save(user);
    }
}