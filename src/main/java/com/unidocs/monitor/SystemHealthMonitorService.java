package com.unidocs.monitor;

import org.springframework.stereotype.Service;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.MemoryMXBean;
import java.util.HashMap;
import java.util.Map;

@Service
public class SystemHealthMonitorService {
    
    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        MemoryMXBean memBean = ManagementFactory.getMemoryMXBean();
        
        metrics.put("os_arch", osBean.getArch());
        metrics.put("os_name", osBean.getName());
        metrics.put("os_version", osBean.getVersion());
        metrics.put("processors", osBean.getAvailableProcessors());
        metrics.put("system_load_average", osBean.getSystemLoadAverage());
        
        long heapUsed = memBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long heapMax = memBean.getHeapMemoryUsage().getMax() / (1024 * 1024);
        metrics.put("heap_used_mb", heapUsed);
        metrics.put("heap_max_mb", heapMax);
        
        return metrics;
    }
}
