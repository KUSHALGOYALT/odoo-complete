package com.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.model.UserBadge;

@Repository
public interface UserBadgeRepository extends MongoRepository<UserBadge, String> {
    
    List<UserBadge> findByUserIdAndIsActiveTrue(String userId);
    
    @Query("{'userId': ?0, 'badgeId': ?1, 'isActive': true}")
    Optional<UserBadge> findByUserIdAndBadgeId(String userId, String badgeId);
    
    @Query(value = "{'userId': ?0, 'isActive': true}", count = true)
    Long countByUserId(String userId);
    
    @Query("{'userId': ?0, 'isActive': true}")
    List<UserBadge> findRecentBadgesByUserId(String userId);
    
    // Note: For badge rarity filtering, we'll need to join with Badge collection
    // This is a simplified version - in practice you might need aggregation
    List<UserBadge> findByUserIdAndIsActiveTrueOrderByEarnedAtDesc(String userId);
} 