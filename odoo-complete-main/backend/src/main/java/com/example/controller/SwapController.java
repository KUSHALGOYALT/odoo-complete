// com.example.controller.SwapController.java
package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ApiResponse;
import com.example.dto.SwapRequestDto;
import com.example.model.SwapRequest;
import com.example.model.SwapStatus;
import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.SwapService;
import com.example.service.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/swaps")
public class SwapController {

    @Autowired
    private SwapService swapService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createSwapRequest(@Valid @RequestBody SwapRequestDto swapRequestDto,
                                               Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String userId = userPrincipal.getId();
            SwapRequest swapRequest = swapService.createSwapRequest(userId, swapRequestDto);
            return ResponseEntity.ok(new ApiResponse<>(true, swapRequest, "Swap request created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{swapId}/accept")
    public ResponseEntity<?> acceptSwapRequest(@PathVariable String swapId, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String userId = userPrincipal.getId();
            SwapRequest updatedSwap = swapService.updateSwapRequestStatus(swapId, SwapStatus.ACCEPTED, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, updatedSwap, "Swap request accepted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{swapId}/reject")
    public ResponseEntity<?> rejectSwapRequest(@PathVariable String swapId, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String userId = userPrincipal.getId();
            SwapRequest updatedSwap = swapService.updateSwapRequestStatus(swapId, SwapStatus.REJECTED, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, updatedSwap, "Swap request rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{swapId}/complete")
    public ResponseEntity<?> completeSwapRequest(@PathVariable String swapId, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String userId = userPrincipal.getId();
            SwapRequest updatedSwap = swapService.updateSwapRequestStatus(swapId, SwapStatus.COMPLETED, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, updatedSwap, "Swap request completed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserSwapRequests(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String userId = userPrincipal.getId();
            List<SwapRequest> swapRequests = swapService.getUserSwapRequests(userId);
            
            // Populate user objects for frontend
            for (SwapRequest swap : swapRequests) {
                if (swap.getRequesterId() != null) {
                    User requester = userRepository.findById(swap.getRequesterId()).orElse(null);
                    swap.setRequester(requester);
                }
                if (swap.getRequestedUserId() != null) {
                    User requestedUser = userRepository.findById(swap.getRequestedUserId()).orElse(null);
                    swap.setRequestedUser(requestedUser);
                }
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, swapRequests, "Swap requests retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingSwapRequests(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String userId = userPrincipal.getId();
            List<SwapRequest> pendingSwaps = swapService.getPendingSwapRequests(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, pendingSwaps, "Pending swap requests retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }
}