package com.nexabank.repository;

import com.nexabank.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<AppUser, UUID> {
    boolean existsByUsername(String username);
    boolean existsByCustomerId(UUID customerId);
    Optional<AppUser> findByUsername(String username);
}
