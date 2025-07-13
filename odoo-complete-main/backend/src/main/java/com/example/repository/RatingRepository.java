package com.example.repository;

import com.example.model.Rating;
import com.example.model.SwapRequest;
import com.example.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends MongoRepository<Rating, String> {
    List<Rating> findByRatedOrderByCreatedAtDesc(User rated);
    List<Rating> findByRater(User rater);
    boolean existsByRaterAndSwapRequest(User rater, SwapRequest swapRequest);
}
