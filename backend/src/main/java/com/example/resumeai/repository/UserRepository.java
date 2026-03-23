package com.example.resumeai.repository;

import com.example.resumeai.entity.User;
import com.example.resumeai.entity.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByPasswordResetToken(String token);

    Optional<User> findByGoogleSub(String googleSub);

    List<User> findByRolesContaining(Role role);
}