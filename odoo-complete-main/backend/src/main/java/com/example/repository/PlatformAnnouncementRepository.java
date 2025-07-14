package com.example.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.model.PlatformAnnouncement;

@Repository
public interface PlatformAnnouncementRepository extends MongoRepository<PlatformAnnouncement, String> {
    
    List<PlatformAnnouncement> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<PlatformAnnouncement> findAllByOrderByCreatedAtDesc();
    
    List<PlatformAnnouncement> findByType(String type);
    
    List<PlatformAnnouncement> findByTypeAndIsActiveTrue(String type);

    long countByIsActiveTrue();
} 