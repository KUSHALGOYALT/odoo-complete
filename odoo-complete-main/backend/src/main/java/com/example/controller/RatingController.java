package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ApiResponse;
import com.example.dto.RatingDto;
import com.example.model.Rating;
import com.example.service.RatingService;
import com.example.service.UserPrincipal;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    // Submit a rating
    @PostMapping("/{raterId}")
    public ApiResponse<Rating> submitRating(@PathVariable String raterId, @RequestBody RatingDto ratingDto) {
        try {
            Rating rating = ratingService.createRating(raterId, ratingDto);
            return ApiResponse.success(rating, "Rating submitted successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to submit rating: " + e.getMessage());
        }
    }

    // Get all ratings received by a user
    @GetMapping("/user/{userId}")
    public ApiResponse<List<Rating>> getUserRatings(@PathVariable String userId) {
        try {
            List<Rating> ratings = ratingService.getUserRatings(userId);
            return ApiResponse.success(ratings, "User ratings fetched successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to fetch ratings: " + e.getMessage());
        }
    }

    // Get ratings for the authenticated user
    @GetMapping("/user")
    public ApiResponse<List<Rating>> getCurrentUserRatings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<Rating> ratings = ratingService.getUserRatings(userPrincipal.getId());
            return ApiResponse.success(ratings, "User ratings fetched successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to fetch ratings: " + e.getMessage());
        }
    }

    // Get average rating of a user
    @GetMapping("/user/{userId}/average")
    public ApiResponse<Double> getAverageRating(@PathVariable String userId) {
        try {
            Double avg = ratingService.getUserAverageRating(userId);
            return ApiResponse.success(avg, "Average rating fetched successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to fetch average rating: " + e.getMessage());
        }
    }
}
