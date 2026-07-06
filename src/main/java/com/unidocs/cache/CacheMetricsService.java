package com.unidocs.cache;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CacheMetricsService {
    private final AtomicLong hits = new AtomicLong(0);
    private final AtomicLong misses = new AtomicLong(0);

    public void incrementHits() { hits.incrementAndGet(); }
    public void incrementMisses() { misses.incrementAndGet(); }
    
    public long getHits() { return hits.get(); }
    public long getMisses() { return misses.get(); }
    public double getHitRatio() {
        long total = hits.get() + misses.get();
        if (total == 0) return 0.0;
        return (double) hits.get() / total;
    }
}
