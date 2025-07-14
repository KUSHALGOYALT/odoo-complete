package com.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.model.Badge;
import com.example.model.BadgeRarity;

@Repository
public interface BadgeRepository extends MongoRepository<Badge, String> {
    
    List<Badge> findByIsActiveTrue();
    
    List<Badge> findByRarity(BadgeRarity rarity);
    
    List<Badge> findByConditionType(String conditionType);
    
    Optional<Badge> findByName(String name);
    
    @Query("{'isActive': true, 'conditionType': ?0, 'conditionValue': {$lte: ?1}}")
    List<Badge> findEligibleBadges(String conditionType, Integer value);
    
    @Query("{'isActive': true}")
    List<Badge> findAllActiveOrdered();
} 