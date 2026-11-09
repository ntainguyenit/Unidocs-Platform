package com.unidocs.service;

import com.unidocs.domain.AccessLog;
import com.unidocs.dto.response.AccessInfoDto;
import com.unidocs.repository.AccessLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Single-line English comment: Unit tests for silent IP persistence, proxy IP extraction, and device label parsing
class AccessLogServiceTest {

    private AccessLogRepository accessLogRepository;
    private AccessLogService accessLogService;

    @BeforeEach
    void setUp() {
        // Single-line English comment: Initialize repository mock and service under test
        accessLogRepository = mock(AccessLogRepository.class);
        accessLogService = new AccessLogService(accessLogRepository);
        when(accessLogRepository.save(any(AccessLog.class))).thenAnswer(invocation -> {
            AccessLog entity = invocation.getArgument(0);
            if (entity.getAccessedAt() == null) {
                entity.setAccessedAt(LocalDateTime.of(2026, 11, 10, 9, 15));
            }
            return entity;
        });
    }

    @Test
    void extractClientIp_PrioritizesCloudflareAndProxyHeaders() {
        // Single-line English comment: Verify CF-Connecting-IP overrides forwarded headers and remote address
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn("203.0.113.55");
        when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.10, 10.0.0.1");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        assertEquals("203.0.113.55", accessLogService.extractClientIp(request));
    }

    @Test
    void extractClientIp_FallsBackToFirstXForwardedForThenRemoteAddr() {
        // Single-line English comment: Verify X-Forwarded-For first IP is picked when CF header is absent
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn("unknown");
        when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.22, 10.0.0.2");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        assertEquals("198.51.100.22", accessLogService.extractClientIp(request));

        // Single-line English comment: Verify RemoteAddr fallback when all proxy headers are blank
        HttpServletRequest directRequest = mock(HttpServletRequest.class);
        when(directRequest.getRemoteAddr()).thenReturn("192.168.1.25");
        assertEquals("192.168.1.25", accessLogService.extractClientIp(directRequest));
    }

    @Test
    void resolveDeviceName_DetectsDesktopAndMobileDevicesAccurately() {
        // Single-line English comment: Verify desktop Windows Chrome UA parsing
        String winChromeUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36";
        assertEquals("Windows - Chrome", accessLogService.resolveDeviceName(winChromeUa, "Windows", false, false));

        // Single-line English comment: Verify desktop Windows Edge UA parsing
        String winEdgeUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0";
        assertEquals("Windows - Edge", accessLogService.resolveDeviceName(winEdgeUa, "Windows", false, false));

        // Single-line English comment: Verify iPhone Safari UA parsing
        String iphoneUa = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
        assertEquals("iPhone - Safari", accessLogService.resolveDeviceName(iphoneUa, "iOS", true, false));

        // Single-line English comment: Verify Android Chrome UA reduction parsing
        String androidUa = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/125.0.0.0 Mobile Safari/537.36";
        assertEquals("Android - Chrome", accessLogService.resolveDeviceName(androidUa, "Android", true, false));

        // Single-line English comment: Verify iPadOS desktop-mode heuristic via touchMac hint
        String macUa = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15";
        assertEquals("iPad - Safari", accessLogService.resolveDeviceName(macUa, "macOS", false, true));
    }

    @Test
    void recordAccess_SavesIpSilentlyAndReturnsSanitizedDisplayText() {
        // Single-line English comment: Arrange incoming request carrying real client IP and mobile User-Agent
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn("203.0.113.88");
        when(request.getHeader("User-Agent")).thenReturn("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1");

        // Single-line English comment: Record access and capture persisted JPA entity
        AccessInfoDto dto = accessLogService.recordAccess(request, "/course/lap-trinh", null, true, false);
        ArgumentCaptor<AccessLog> captor = ArgumentCaptor.forClass(AccessLog.class);
        verify(accessLogRepository).save(captor.capture());

        // Single-line English comment: Confirm client IP and metadata were persisted internally
        AccessLog persisted = captor.getValue();
        assertEquals("203.0.113.88", persisted.getIpAddress());
        assertEquals("iPhone - Safari", persisted.getDeviceName());
        assertEquals("/course/lap-trinh", persisted.getRequestPath());
        assertNotNull(persisted.getAccessedAt());

        // Single-line English comment: Confirm returned DTO formats exact footer string and contains zero IP leaks
        assertNotNull(dto);
        assertEquals("iPhone - Safari", dto.getDeviceName());
        assertTrue(Pattern.matches("^Lần truy cập cuối: lúc \\d{2}:\\d{2} ngày \\d{2}/\\d{2}/\\d{4} \\(iPhone - Safari\\)$", dto.getDisplayText()));
        assertFalse(dto.getDisplayText().contains("203.0.113.88"));
        assertFalse(dto.getDisplayText().contains("{"));
        assertFalse(dto.getDisplayText().contains("}"));
    }
}
