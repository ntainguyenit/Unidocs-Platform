package com.unidocs.cache;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class CustomCacheManagerTest {

    @Mock
    private CacheMetricsService metricsService;

    @InjectMocks
    private CustomCacheManager cacheManager;

    @Test
    void testPutAndGet_Success() {
        cacheManager.put("test-key", "test-value", 10000);
        Object val = cacheManager.get("test-key");
        assertEquals("test-value", val);
    }

    @Test
    void testGet_Expired() throws InterruptedException {
        cacheManager.put("test-key-2", "test-value-2", 10);
        Thread.sleep(50);
        Object val = cacheManager.get("test-key-2");
        assertNull(val);
    }
}
