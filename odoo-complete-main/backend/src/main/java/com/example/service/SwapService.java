package com.example.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.dto.SwapRequestDto;
import com.example.exception.BadRequestException;
import com.example.exception.ResourceNotFoundException;
import com.example.model.SwapRequest;
import com.example.model.SwapStatus;
import com.example.model.User;
import com.example.repository.SwapRequestRepository;
import com.example.repository.UserRepository;

@Service
public class SwapService {

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BadgeService badgeService;

    public SwapRequest createSwapRequest(String requesterId, SwapRequestDto dto) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));
        User requestedUser = userRepository.findById(dto.getRequestedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Requested user not found"));

        boolean requesterHasSkill = requester.getOfferedSkills().stream()
                .anyMatch(skill -> skill.getName().equalsIgnoreCase(dto.getRequesterSkill()));
        boolean requestedUserHasSkill = requestedUser.getOfferedSkills().stream()
                .anyMatch(skill -> skill.getName().equalsIgnoreCase(dto.getRequestedSkill()));

        if (!requesterHasSkill || !requestedUserHasSkill) {
            throw new BadRequestException("Invalid skills specified in swap request");
        }

        // Prevent duplicate pending swap requests for the same skill pair
        boolean duplicateExists = swapRequestRepository.findByRequesterIdAndStatus(requesterId, SwapStatus.PENDING)
            .stream()
            .anyMatch(swap -> swap.getRequestedUserId().equals(dto.getRequestedUserId())
                && swap.getRequesterSkill().equalsIgnoreCase(dto.getRequesterSkill())
                && swap.getRequestedSkill().equalsIgnoreCase(dto.getRequestedSkill()));
        if (duplicateExists) {
            throw new BadRequestException("You have already sent a pending swap request for this skill pair to this user.");
        }

        SwapRequest request = new SwapRequest();
        request.setRequesterId(requesterId);
        request.setRequestedUserId(dto.getRequestedUserId());
        request.setRequesterSkill(dto.getRequesterSkill());
        request.setRequestedSkill(dto.getRequestedSkill());
        request.setMessage(dto.getMessage());
        request.setSuperSwap(dto.isSuperSwap());

        return swapRequestRepository.save(request);
    }

    public SwapRequest updateSwapRequestStatus(String swapId, SwapStatus status, String userId) {
        SwapRequest swapRequest = swapRequestRepository.findById(swapId)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));

        // Check if user is involved in the swap
        boolean isRequester = swapRequest.getRequesterId().equals(userId);
        boolean isRequested = swapRequest.getRequestedUserId().equals(userId);
        
        if (!isRequester && !isRequested) {
            throw new BadRequestException("You are not authorized to modify this swap request");
        }

        // Handle different status updates
        if (status == SwapStatus.ACCEPTED || status == SwapStatus.REJECTED) {
            // Only the requested user can accept or reject
            if (!isRequested) {
                throw new BadRequestException("Only the requested user can accept or reject this swap");
            }
        } else if (status == SwapStatus.COMPLETED) {
            // Both users can complete the swap
            if (!isRequester && !isRequested) {
                throw new BadRequestException("Only participants can complete this swap");
            }
            // Check if swap is already accepted
            if (swapRequest.getStatus() != SwapStatus.ACCEPTED) {
                throw new BadRequestException("Only accepted swaps can be completed");
            }
            
            // Update user stats when swap is completed
            updateUserStatsOnCompletion(swapRequest);
        } else {
            throw new BadRequestException("Invalid status update");
        }

        swapRequest.setStatus(status);
        swapRequest.setUpdatedAt(LocalDateTime.now());
        SwapRequest savedSwap = swapRequestRepository.save(swapRequest);
        
        // Check for badges after status update
        if (status == SwapStatus.COMPLETED) {
            badgeService.checkAndAwardBadges(swapRequest.getRequesterId());
            badgeService.checkAndAwardBadges(swapRequest.getRequestedUserId());
        }
        
        return savedSwap;
    }

    private void updateUserStatsOnCompletion(SwapRequest swapRequest) {
        // Update requester stats
        User requester = userRepository.findById(swapRequest.getRequesterId()).orElse(null);
        if (requester != null) {
            requester.getStats().setTotalSwaps(requester.getStats().getTotalSwaps() + 1);
            requester.getStats().setCompletedSwaps(requester.getStats().getCompletedSwaps() + 1);
            userRepository.save(requester);
        }
        
        // Update requested user stats
        User requestedUser = userRepository.findById(swapRequest.getRequestedUserId()).orElse(null);
        if (requestedUser != null) {
            requestedUser.getStats().setTotalSwaps(requestedUser.getStats().getTotalSwaps() + 1);
            requestedUser.getStats().setCompletedSwaps(requestedUser.getStats().getCompletedSwaps() + 1);
            userRepository.save(requestedUser);
        }
    }

    public List<SwapRequest> getUserSwapRequests(String userId) {
        return swapRequestRepository.findByRequesterIdOrRequestedUserId(userId, userId);
    }

    public List<SwapRequest> getPendingSwapRequests(String userId) {
        return swapRequestRepository.findByRequestedUserIdAndStatus(userId, SwapStatus.PENDING);
    }

    // ✅ Added missing method
    public SwapRequest findSwapRequestById(String swapRequestId) {
        return swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));
    }
}
