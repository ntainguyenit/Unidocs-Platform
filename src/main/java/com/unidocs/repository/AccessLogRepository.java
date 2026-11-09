package com.unidocs.repository;

import com.unidocs.domain.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Single-line English comment: Repository for persisting and querying user access logs
@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    // Single-line English comment: Retrieve the latest access record for a specific client IP address
    Optional<AccessLog> findTopByIpAddressOrderByAccessedAtDesc(String ipAddress);
}
