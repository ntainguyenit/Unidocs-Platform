package com.unidocs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Single-line English comment: Entity representing a user website access record for security auditing
@Entity
@Table(name = "access_logs")
@Getter
@Setter
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Single-line English comment: Client IP address stored silently for security tracing and never exposed publicly
    @JsonIgnore
    @Column(name = "ip_address", nullable = false, length = 100)
    private String ipAddress;

    // Single-line English comment: Parsed friendly device and browser name displayed in footer
    @Column(name = "device_name", nullable = false, length = 150)
    private String deviceName;

    // Single-line English comment: Raw User-Agent header string archived internally for auditing
    @JsonIgnore
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    // Single-line English comment: Requested frontend path visited by the user
    @Column(name = "request_path", length = 255)
    private String requestPath;

    // Single-line English comment: Access timestamp stored in application timezone
    @Column(name = "accessed_at", nullable = false)
    private LocalDateTime accessedAt;

    @PrePersist
    protected void onCreate() {
        // Single-line English comment: Ensure access timestamp is populated before persisting
        if (accessedAt == null) {
            accessedAt = LocalDateTime.now();
        }
    }
}
