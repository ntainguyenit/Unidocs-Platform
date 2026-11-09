package com.unidocs.controller.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unidocs.domain.AccessLog;
import com.unidocs.dto.response.AccessInfoDto;
import com.unidocs.repository.AccessLogRepository;
import com.unidocs.service.AccessLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Single-line English comment: Unit tests ensuring /api/access-logs records IP silently and omits it from JSON output
class AccessLogApiControllerTest {

    @Test
    void recordAccess_SerializedJsonNeverExposesClientIp() throws Exception {
        // Single-line English comment: Configure mock repository and real service + controller
        AccessLogRepository repo = mock(AccessLogRepository.class);
        when(repo.save(any(AccessLog.class))).thenAnswer(inv -> inv.getArgument(0));
        AccessLogService service = new AccessLogService(repo);
        AccessLogApiController controller = new AccessLogApiController(service);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("CF-Connecting-IP")).thenReturn("198.51.100.123");
        when(request.getHeader("User-Agent")).thenReturn("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36");

        ResponseEntity<AccessInfoDto> response = controller.recordAccess(Map.of("path", "/"), request);

        // Single-line English comment: Assert HTTP 200 and verify serialized JSON strictly omits IP fields and values
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(response.getBody());
        assertFalse(json.contains("198.51.100.123"));
        assertFalse(json.contains("ipAddress"));
        assertFalse(json.contains("\"ip\""));
        assertTrue(json.contains("Windows - Chrome"));
        assertTrue(response.getBody().getDisplayText().startsWith("Lần truy cập cuối: lúc "));
    }

    @Test
    void recordAccess_WhenDatabaseThrows_ReturnsSafeFallbackWithoutError() {
        // Single-line English comment: Simulate transient repository failure
        AccessLogRepository repo = mock(AccessLogRepository.class);
        when(repo.save(any(AccessLog.class))).thenThrow(new RuntimeException("DB unavailable"));
        AccessLogService service = new AccessLogService(repo);
        AccessLogApiController controller = new AccessLogApiController(service);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("User-Agent")).thenReturn("Mozilla/5.0 (Android 14; Mobile) Firefox/126.0");

        ResponseEntity<AccessInfoDto> response = controller.recordAccess(Map.of("path", "/terms"), request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Android - Firefox", response.getBody().getDeviceName());
    }
}
