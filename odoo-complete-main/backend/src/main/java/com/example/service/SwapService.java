package com.example.service;

import com.example.dto.SwapRequestDto;
import com.example.exception.BadRequestException;
import com.example.exception.ResourceNotFoundException;
import com.example.model.SwapRequest;
import com.example.model.SwapStatus;
import com.example.model.User;
import com.example.repository.SwapRequestRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SwapService {

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private UserRepository userRepository;

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

        if (!swapRequest.getRequestedUserId().equals(userId)) {
            throw new BadRequestException("Only the requested user can update the swap status");
        }

        if (status == SwapStatus.ACCEPTED || status == SwapStatus.REJECTED || status == SwapStatus.COMPLETED) {
            swapRequest.setStatus(status);
            swapRequest.setUpdatedAt(LocalDateTime.now());
            return swapRequestRepository.save(swapRequest);
        } else {
            throw new BadRequestException("Invalid status update");
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
