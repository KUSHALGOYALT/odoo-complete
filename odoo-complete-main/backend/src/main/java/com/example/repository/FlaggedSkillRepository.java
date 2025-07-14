package com.example.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.model.FlaggedSkill;

@Repository
public interface FlaggedSkillRepository extends MongoRepository<FlaggedSkill, String> {
    
    List<FlaggedSkill> findByStatus(String status);
    
    List<FlaggedSkill> findByStatusOrderByFlaggedAtDesc(String status);
    
    List<FlaggedSkill> findByUserId(String userId);
    
    List<FlaggedSkill> findAllByOrderByFlaggedAtDesc();

    long countByStatus(String status);
} 