package com.unidocs.security.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class IpBlacklistService {
    private final Map<String, LocalDateTime> blacklistedIps = new ConcurrentHashMap<>();

    public void blacklistIp(String ip, int hours) {
        blacklistedIps.put(ip, LocalDateTime.now().plusHours(hours));
    }

    public boolean isBlacklisted(String ip) {
        LocalDateTime unbanTime = blacklistedIps.get(ip);
        if (unbanTime == null) return false;
        if (LocalDateTime.now().isAfter(unbanTime)) {
            blacklistedIps.remove(ip);
            return false;
        }
        return true;
    }

    public void removeIpFromBlacklist(String ip) {
        blacklistedIps.remove(ip);
    }
}
