package com.example.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.model.AdminMessage;

@Repository
public interface AdminMessageRepository extends MongoRepository<AdminMessage, String> {
    List<AdminMessage> findByIsActiveTrueOrderByCreatedAtDesc();
    List<AdminMessage> findAllByOrderByCreatedAtDesc();
    List<AdminMessage> findByTargetUserIdAndIsActiveTrueOrderByCreatedAtDesc(String targetUserId);
}
