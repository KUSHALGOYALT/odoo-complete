package com.example.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.model.UserBan;

@Repository
public interface UserBanRepository extends MongoRepository<UserBan, String> {
    
    Optional<UserBan> findByUserIdAndIsActiveTrue(String userId);
    
    List<UserBan> findByIsActiveTrue();
    
    List<UserBan> findByIsActiveFalse();
    
    List<UserBan> findByUserIdOrderByBannedAtDesc(String userId);
    
    List<UserBan> findAllByOrderByBannedAtDesc();
} 