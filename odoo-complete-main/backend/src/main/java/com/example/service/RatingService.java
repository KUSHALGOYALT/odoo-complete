package com.example.service;

import com.example.dto.RatingDto;
import com.example.exception.BadRequestException;
import com.example.model.Rating;
import com.example.model.SwapRequest;
import com.example.model.SwapStatus;
import com.example.model.User;
import com.example.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private SwapService swapService;

    @Autowired
    private UserService userService;

    public Rating createRating(String raterId, RatingDto ratingDto) {
        User rater = userService.findById(raterId);
        User rated = userService.findById(ratingDto.getRatedUserId());
        SwapRequest swapRequest = swapService.findSwapRequestById(ratingDto.getSwapRequestId());

        if (swapRequest.getStatus() != SwapStatus.COMPLETED) {
            throw new BadRequestException("You can only rate completed swaps");
        }

        if (!swapRequest.getRequesterId().equals(raterId) && !swapRequest.getRequestedUserId().equals(raterId)) {
            throw new BadRequestException("You can only rate users you've swapped with");
        }

        if (ratingRepository.existsByRaterAndSwapRequest(rater, swapRequest)) {
            throw new BadRequestException("You have already rated this swap");
        }

        Rating rating = new Rating();
        rating.setRater(rater);
        rating.setRated(rated);
        rating.setSwapRequest(swapRequest);
        rating.setRating(ratingDto.getRating());
        rating.setComment(ratingDto.getComment());

        Rating saved = ratingRepository.save(rating);
        updateUserRating(rated);
        return saved;
    }

    public List<Rating> getUserRatings(String userId) {
        User user = userService.findById(userId);
        return ratingRepository.findByRatedOrderByCreatedAtDesc(user);
    }

    public Double getUserAverageRating(String userId) {
        List<Rating> ratings = getUserRatings(userId);
        if (ratings.isEmpty()) return 0.0;
        return ratings.stream().mapToInt(Rating::getRating).average().orElse(0.0);
    }

    private void updateUserRating(User user) {
        Double avg = getUserAverageRating(user.getId());
        user.getStats().setAverageRating(avg);
        user.getStats().setTotalRatings(user.getStats().getTotalRatings() + 1);
        userService.save(user);
    }
}
