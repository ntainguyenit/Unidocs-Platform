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
        assertFalse(service.isContentClean("Fuck"));
        assertFalse(service.isContentClean("fucking you"));
    }

    @Test
    void testSanitizeContent() {
        ContentModerationService service = new ContentModerationService();
        String result = service.sanitizeContent("Hello viagra world");
        assertEquals("Hello *** world", result);
    }

    @Test
    void testValidateCourseName_SpamAndProfanityRejected() {
        ContentModerationService service = new ContentModerationService();

        // Profanity
        assertFalse(service.isValidCourseName("Fuck"));
        assertFalse(service.isValidCourseName("Fuckyou"));
        assertFalse(service.isValidCourseName("Fuckingyou"));

        // Single character / too short
        assertFalse(service.isValidCourseName("Ứ"));
        assertFalse(service.isValidCourseName("Df"));

        // Keyboard mashing & meaningless strings
        assertFalse(service.isValidCourseName("Fds"));
        assertFalse(service.isValidCourseName("Fsdf"));
        assertFalse(service.isValidCourseName("asdf"));

        // Troll laughter / chat phrases
        assertFalse(service.isValidCourseName("Haha"));
        assertFalse(service.isValidCourseName("Hihi"));
        assertFalse(service.isValidCourseName("Huhu"));
        assertFalse(service.isValidCourseName("Hello"));
        assertFalse(service.isValidCourseName("Ko Khóa Luôn À"));
        assertFalse(service.isValidCourseName("Thêm Là Hiển Thị Luôn À :))"));
    }

    @Test
    void testValidateCourseName_LegitimateCoursesAccepted() {
        ContentModerationService service = new ContentModerationService();

        assertTrue(service.isValidCourseName("Báo In"));
        assertTrue(service.isValidCourseName("Các Hệ Quản Trị CSDL"));
        assertTrue(service.isValidCourseName("Cấu Trúc Dữ Liệu và Thuật Toán"));
        assertTrue(service.isValidCourseName("Công Nghệ Phần Mềm"));
        assertTrue(service.isValidCourseName("Lập Trình Web"));
        assertTrue(service.isValidCourseName("Xây Dựng Ứng Dụng Với .Net"));
    }
}
