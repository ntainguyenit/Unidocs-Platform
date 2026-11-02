package com.unidocs.controller.publicapi;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class HealthControllerTest {

    @Test
    void healthCheck_ReturnsStatusUp() {
        HealthController controller = new HealthController();
        ResponseEntity<Map<String, Object>> response = controller.healthCheck();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("UniDocs Platform", response.getBody().get("service"));
        assertNotNull(response.getBody().get("timestamp"));
    }
}
