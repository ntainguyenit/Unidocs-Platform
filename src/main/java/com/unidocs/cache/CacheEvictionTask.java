package com.unidocs.cache;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CacheEvictionTask {
    private final CustomCacheManager cacheManager;

    public CacheEvictionTask(CustomCacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Scheduled(fixedRate = 60000)
    public void evictExpiredCaches() {
        cacheManager.clearExpired();
    }
}
