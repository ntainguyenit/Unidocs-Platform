package com.unidocs.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> courseCache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, this::newBucket);
    }

    private Bucket newBucket(String ip) {
        // 5 uploads per hour per IP
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofHours(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public Bucket resolveCourseBucket(String ip) {
        return courseCache.computeIfAbsent(ip, this::newCourseBucket);
    }

    private Bucket newCourseBucket(String ip) {
        // 3 course contributions per 15 minutes per IP
        Bandwidth limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(15)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
