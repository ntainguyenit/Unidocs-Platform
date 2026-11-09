package com.unidocs.service;

import com.unidocs.domain.AccessLog;
import com.unidocs.dto.response.AccessInfoDto;
import com.unidocs.repository.AccessLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

// Single-line English comment: Service handling silent IP logging and formatted session access metadata
@Service
public class AccessLogService {

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int MAX_IP_LENGTH = 100;
    private static final int MAX_DEVICE_LENGTH = 150;
    private static final int MAX_PATH_LENGTH = 255;
    private static final int MAX_UA_LENGTH = 2000;

    private final AccessLogRepository accessLogRepository;

    public AccessLogService(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    // Single-line English comment: Persist access log with client IP silently and return sanitized display metadata
    @Transactional
    public AccessInfoDto recordAccess(HttpServletRequest request,
                                      String requestPath,
                                      String platformHint,
                                      Boolean mobileHint,
                                      Boolean touchMacHint) {
        String clientIp = extractClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        String effectivePlatformHint = firstNonBlank(platformHint, request != null ? request.getHeader("Sec-CH-UA-Platform") : null);
        boolean effectiveMobileHint = resolveMobileHint(mobileHint, request != null ? request.getHeader("Sec-CH-UA-Mobile") : null);
        boolean isTouchMac = Boolean.TRUE.equals(touchMacHint);

        String deviceName = resolveDeviceName(userAgent, effectivePlatformHint, effectiveMobileHint, isTouchMac);
        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);

        AccessLog entity = new AccessLog();
        entity.setIpAddress(clientIp);
        entity.setDeviceName(deviceName);
        entity.setUserAgent(truncate(userAgent, MAX_UA_LENGTH));
        entity.setRequestPath(sanitizePath(requestPath));
        entity.setAccessedAt(now);

        AccessLog saved = accessLogRepository.save(entity);
        LocalDateTime effectiveTime = saved != null && saved.getAccessedAt() != null ? saved.getAccessedAt() : now;

        return formatAccessInfo(effectiveTime, deviceName);
    }

    // Single-line English comment: Build safe fallback response when database recording cannot complete
    public AccessInfoDto buildFallbackAccessInfo(HttpServletRequest request,
                                                 String platformHint,
                                                 Boolean mobileHint,
                                                 Boolean touchMacHint) {
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        String effectivePlatformHint = firstNonBlank(platformHint, request != null ? request.getHeader("Sec-CH-UA-Platform") : null);
        boolean effectiveMobileHint = resolveMobileHint(mobileHint, request != null ? request.getHeader("Sec-CH-UA-Mobile") : null);
        String deviceName = resolveDeviceName(userAgent, effectivePlatformHint, effectiveMobileHint, Boolean.TRUE.equals(touchMacHint));

        return formatAccessInfo(LocalDateTime.now(VIETNAM_ZONE), deviceName);
    }

    // Single-line English comment: Format access timestamp and device name without exposing any IP information
    public AccessInfoDto formatAccessInfo(LocalDateTime timestamp, String deviceName) {
        LocalDateTime safeTime = timestamp != null ? timestamp : LocalDateTime.now(VIETNAM_ZONE);
        String safeDevice = sanitizeDeviceLabel(deviceName);
        if (safeDevice.isEmpty()) {
            safeDevice = "Thiết bị web";
        }
        String time = safeTime.format(TIME_FORMATTER);
        String date = safeTime.format(DATE_FORMATTER);
        String displayText = String.format("Lần truy cập cuối: lúc %s ngày %s (%s)", time, date, safeDevice);
        return new AccessInfoDto(time, date, safeDevice, displayText);
    }

    // Single-line English comment: Extract real client IP prioritizing Cloudflare and reverse proxy headers
    public String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String cfIp = cleanIpHeader(request.getHeader("CF-Connecting-IP"));
        if (cfIp != null) {
            return cfIp;
        }
        String trueClientIp = cleanIpHeader(request.getHeader("True-Client-IP"));
        if (trueClientIp != null) {
            return trueClientIp;
        }
        String xRealIp = cleanIpHeader(request.getHeader("X-Real-IP"));
        if (xRealIp != null) {
            return xRealIp;
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            String[] parts = xForwardedFor.split(",");
            for (String part : parts) {
                String candidate = cleanIpHeader(part);
                if (candidate != null) {
                    return candidate;
                }
            }
        }
        String remoteAddr = cleanIpHeader(request.getRemoteAddr());
        return remoteAddr != null ? remoteAddr : "unknown";
    }

    // Single-line English comment: Parse concise human-readable device and browser label from User-Agent and hints
    public String resolveDeviceName(String userAgent,
                                    String platformHint,
                                    boolean isMobileHint,
                                    boolean isTouchMac) {
        String ua = userAgent != null ? userAgent : "";
        String uaLower = ua.toLowerCase(Locale.ROOT);
        String hintLower = sanitizeDeviceLabel(platformHint).toLowerCase(Locale.ROOT);

        String osName = resolveOsName(uaLower, hintLower, isMobileHint, isTouchMac);
        String browserName = resolveBrowserName(uaLower);

        String combined;
        if (!osName.isEmpty() && !browserName.isEmpty()) {
            combined = osName + " - " + browserName;
        } else if (!osName.isEmpty()) {
            combined = osName;
        } else if (!browserName.isEmpty()) {
            combined = browserName;
        } else {
            combined = "Thiết bị web";
        }

        return truncate(sanitizeDeviceLabel(combined), MAX_DEVICE_LENGTH);
    }

    // Single-line English comment: Determine normalized operating system or hardware category name
    private String resolveOsName(String uaLower, String hintLower, boolean isMobileHint, boolean isTouchMac) {
        if (uaLower.contains("ipad") || (uaLower.contains("macintosh") && isTouchMac)) {
            return "iPad";
        }
        if (uaLower.contains("iphone")) {
            return "iPhone";
        }
        if (uaLower.contains("ipod")) {
            return "iPod";
        }
        if (uaLower.contains("android") || hintLower.contains("android")) {
            return "Android";
        }
        if (uaLower.contains("windows phone")) {
            return "Windows Phone";
        }
        if (uaLower.contains("windows") || hintLower.contains("win")) {
            return "Windows";
        }
        if (uaLower.contains("macintosh") || uaLower.contains("mac os x") || hintLower.contains("mac")) {
            return "macOS";
        }
        if (uaLower.contains("cros") || hintLower.contains("chrome os")) {
            return "Chromebook";
        }
        if (uaLower.contains("linux") || hintLower.contains("linux")) {
            return "Linux";
        }
        if (uaLower.contains("mobile") || isMobileHint) {
            return "Mobile";
        }
        if (!hintLower.isEmpty()) {
            return capitalizeFirst(hintLower);
        }
        return "";
    }

    // Single-line English comment: Identify browser or mobile in-app webview name safely
    private String resolveBrowserName(String uaLower) {
        if (uaLower.isEmpty()) {
            return "";
        }
        if (uaLower.contains("zalo")) {
            return "Zalo Browser";
        }
        if (uaLower.contains("fban") || uaLower.contains("fbav")) {
            return "Facebook Browser";
        }
        if (uaLower.contains("instagram")) {
            return "Instagram Browser";
        }
        if (uaLower.contains("bytedancewebview") || uaLower.contains("musical_ly") || uaLower.contains("tiktok")) {
            return "TikTok Browser";
        }
        if (uaLower.contains("coc_coc_browser")) {
            return "Cốc Cốc";
        }
        if (uaLower.contains("edg/") || uaLower.contains("edga/") || uaLower.contains("edgios/")) {
            return "Edge";
        }
        if (uaLower.contains("opr/") || uaLower.contains("opera")) {
            return "Opera";
        }
        if (uaLower.contains("samsungbrowser/")) {
            return "Samsung Internet";
        }
        if (uaLower.contains("firefox/") || uaLower.contains("fxios/")) {
            return "Firefox";
        }
        if (uaLower.contains("chrome/") || uaLower.contains("crios/")) {
            return "Chrome";
        }
        if (uaLower.contains("safari/")) {
            return "Safari";
        }
        return "";
    }

    // Single-line English comment: Parse Sec-CH-UA-Mobile header or explicit boolean hint
    private boolean resolveMobileHint(Boolean mobileHint, String secChMobileHeader) {
        if (mobileHint != null) {
            return mobileHint;
        }
        return secChMobileHeader != null && secChMobileHeader.trim().equals("?1");
    }

    // Single-line English comment: Clean header IP value and ignore empty or unknown proxy markers
    private String cleanIpHeader(String rawIp) {
        if (rawIp == null) {
            return null;
        }
        String trimmed = rawIp.trim();
        if (trimmed.isEmpty() || "unknown".equalsIgnoreCase(trimmed)) {
            return null;
        }
        return truncate(trimmed, MAX_IP_LENGTH);
    }

    // Single-line English comment: Normalize visited path before database storage
    private String sanitizePath(String path) {
        if (path == null || path.trim().isEmpty()) {
            return "/";
        }
        String cleaned = path.replaceAll("[\\r\\n\\t]", "").trim();
        if (!cleaned.startsWith("/")) {
            cleaned = "/" + cleaned;
        }
        return truncate(cleaned, MAX_PATH_LENGTH);
    }

    // Single-line English comment: Strip braces, angle brackets, quotes, and control characters from device label
    private String sanitizeDeviceLabel(String input) {
        if (input == null) {
            return "";
        }
        return input.replaceAll("[{}\"'<>\\r\\n\\t]", "").trim();
    }

    // Single-line English comment: Pick first non-blank candidate string
    private String firstNonBlank(String primary, String secondary) {
        if (primary != null && !primary.trim().isEmpty()) {
            return primary.trim();
        }
        if (secondary != null && !secondary.trim().isEmpty()) {
            return secondary.trim();
        }
        return "";
    }

    // Single-line English comment: Capitalize first character of non-empty label
    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        if (text.length() == 1) {
            return text.toUpperCase(Locale.ROOT);
        }
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    // Single-line English comment: Truncate string safely to column limit
    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
