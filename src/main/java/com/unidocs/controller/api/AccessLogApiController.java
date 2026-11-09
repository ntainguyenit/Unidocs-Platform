package com.unidocs.controller.api;

import com.unidocs.dto.response.AccessInfoDto;
import com.unidocs.service.AccessLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Single-line English comment: Public REST controller for silent IP recording and returning footer session info
@RestController
@RequestMapping("/api/access-logs")
public class AccessLogApiController {

    private static final Logger log = LoggerFactory.getLogger(AccessLogApiController.class);

    private final AccessLogService accessLogService;

    public AccessLogApiController(AccessLogService accessLogService) {
        this.accessLogService = accessLogService;
    }

    // Single-line English comment: Record current page access with server-side IP and return sanitized display payload
    @PostMapping
    public ResponseEntity<AccessInfoDto> recordAccess(
            @RequestBody(required = false) Map<String, Object> payload,
            HttpServletRequest request) {
        String path = extractString(payload, "path");
        String platformHint = extractString(payload, "platform");
        Boolean mobileHint = extractBoolean(payload, "mobile");
        Boolean touchMacHint = extractBoolean(payload, "touchMac");

        try {
            AccessInfoDto response = accessLogService.recordAccess(request, path, platformHint, mobileHint, touchMacHint);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Single-line English comment: Return sanitized timestamp and device fallback without exposing error details
            log.warn("Could not persist access log: {}", e.getMessage());
            return ResponseEntity.ok(accessLogService.buildFallbackAccessInfo(request, platformHint, mobileHint, touchMacHint));
        }
    }

    // Single-line English comment: Extract string field safely from optional request body map
    private String extractString(Map<String, Object> payload, String key) {
        if (payload == null) {
            return null;
        }
        Object value = payload.get(key);
        return value != null ? String.valueOf(value) : null;
    }

    // Single-line English comment: Extract boolean field safely from optional request body map
    private Boolean extractBoolean(Map<String, Object> payload, String key) {
        if (payload == null) {
            return null;
        }
        Object value = payload.get(key);
        if (value instanceof Boolean boolVal) {
            return boolVal;
        }
        if (value instanceof String strVal) {
            if ("true".equalsIgnoreCase(strVal)) {
                return Boolean.TRUE;
            }
            if ("false".equalsIgnoreCase(strVal)) {
                return Boolean.FALSE;
            }
        }
        return null;
    }
}
