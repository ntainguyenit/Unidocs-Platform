package com.unidocs.security;

import com.unidocs.security.service.ContentModerationService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ContentModerationServiceTest {

    @Test
    void testIsContentClean_Valid() {
        ContentModerationService service = new ContentModerationService();
        assertTrue(service.isContentClean("This is a clean message."));
    }

    @Test
    void testIsContentClean_Invalid() {
        ContentModerationService service = new ContentModerationService();
        assertFalse(service.isContentClean("Check out my viagra link"));
    }

    @Test
    void testSanitizeContent() {
        ContentModerationService service = new ContentModerationService();
        String result = service.sanitizeContent("Hello viagra world");
        assertEquals("Hello *** world", result);
    }
}
