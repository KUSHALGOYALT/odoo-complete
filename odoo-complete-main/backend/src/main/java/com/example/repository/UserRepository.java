package com.example.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findByIsPublicTrueAndActiveTrue();
    List<User> findByRolesContaining(String role);

    @Query("{'offeredSkills.name': {$regex: ?0, $options: 'i'}, 'isPublic': true, 'active': true}")
    List<User> findByOfferedSkillsContainingIgnoreCase(String skill);

    @Query("{'wantedSkills': {$regex: ?0, $options: 'i'}, 'isPublic': true, 'active': true}")
    List<User> findByWantedSkillsContainingIgnoreCase(String skill);

    @Query("{'location': {$regex: ?0, $options: 'i'}, 'isPublic': true, 'active': true}")
    List<User> findByLocationContainingIgnoreCase(String location);

    @Query("{'name': {$regex: ?0, $options: 'i'}, 'isPublic': true, 'active': true, 'banned': false}")
    List<User> findByNameContainingIgnoreCase(String name);

    @Query("{'username': {$regex: ?0, $options: 'i'}, 'isPublic': true, 'active': true, 'banned': false}")
    List<User> findByUsernameContainingIgnoreCase(String username);

    @Query("{'isPublic': true, 'active': true, 'banned': false}")
    List<User> findByIsPublicTrueAndActiveTrueAndBannedFalse();

    long countByActiveTrueAndBannedFalse();
}
