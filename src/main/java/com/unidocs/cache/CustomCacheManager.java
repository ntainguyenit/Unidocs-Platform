package com.unidocs.cache;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CustomCacheManager {
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final CacheMetricsService metricsService;

    public CustomCacheManager(CacheMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    public void put(String key, Object value, long ttlMillis) {
        cache.put(key, new CacheEntry(value, System.currentTimeMillis() + ttlMillis));
    }

    public Object get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry != null && !entry.isExpired()) {
            metricsService.incrementHits();
            return entry.getValue();
        }
        if (entry != null) {
            cache.remove(key);
        }
        metricsService.incrementMisses();
        return null;
    }

    public void clearExpired() {
        long now = System.currentTimeMillis();
        cache.entrySet().removeIf(e -> e.getValue().isExpired(now));
    }

    private static class CacheEntry {
        private final Object value;
        private final long expiryTime;

        public CacheEntry(Object value, long expiryTime) {
            this.value = value;
            this.expiryTime = expiryTime;
        }

        public Object getValue() { return value; }
        public boolean isExpired() { return System.currentTimeMillis() > expiryTime; }
        public boolean isExpired(long now) { return now > expiryTime; }
    }
}
