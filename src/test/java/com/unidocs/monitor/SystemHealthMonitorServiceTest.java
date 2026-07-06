package com.unidocs.monitor;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class SystemHealthMonitorServiceTest {

    @Test
    void testGetSystemMetrics_Success() {
        SystemHealthMonitorService service = new SystemHealthMonitorService();
        Map<String, Object> metrics = service.getSystemMetrics();
        assertNotNull(metrics);
        assertTrue(metrics.containsKey("os_arch"));
        assertTrue(metrics.containsKey("processors"));
    }
}
