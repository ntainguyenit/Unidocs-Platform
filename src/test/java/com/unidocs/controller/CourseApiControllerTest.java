package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Faculty;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.security.service.ContentModerationService;
import com.unidocs.service.CourseSpamCleanupService;
import com.unidocs.service.RateLimitingService;
import com.unidocs.service.TurnstileService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class CourseApiControllerTest {

    private CourseRepository courseRepository;
    private FacultyRepository facultyRepository;
    private ContentModerationService contentModerationService;
    private RateLimitingService rateLimitingService;
    private TurnstileService turnstileService;
    private CourseSpamCleanupService courseSpamCleanupService;
    private CourseApiController controller;
    private HttpServletRequest mockRequest;

    @BeforeEach
    void setUp() {
        courseRepository = mock(CourseRepository.class);
        facultyRepository = mock(FacultyRepository.class);
        contentModerationService = new ContentModerationService();
        rateLimitingService = new RateLimitingService();
        turnstileService = mock(TurnstileService.class);
        courseSpamCleanupService = mock(CourseSpamCleanupService.class);

        controller = new CourseApiController(
                courseRepository,
                facultyRepository,
                contentModerationService,
                rateLimitingService,
                turnstileService,
                courseSpamCleanupService
        );

        mockRequest = mock(HttpServletRequest.class);
        when(mockRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(turnstileService.verifyToken(any(), any())).thenReturn(true);
    }

    @Test
    void createCourse_ValidName_CreatesWithPendingStatus() {
        Faculty faculty = Faculty.builder().id(1L).name("Khoa CNTT").build();
        when(facultyRepository.findById(1L)).thenReturn(Optional.of(faculty));
        when(courseRepository.findBySlug(anyString())).thenReturn(Optional.empty());

        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
            Course c = invocation.getArgument(0);
            c.setId(100L);
            return c;
        });

        Map<String, String> payload = Map.of(
                "name", "Trí Tuệ Nhân Tạo Nâng Cao",
                "facultyId", "1"
        );

        ResponseEntity<?> response = controller.createCourse(payload, mockRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals("pending", body.get("status"), "New course must be created with status 'pending'!");
        assertEquals("Đã đóng góp Học phần mới thành công! Vui lòng đợi duyệt...", body.get("message"));
    }

    @Test
    void createCourse_SpamOrProfanity_ReturnsBadRequest() {
        Map<String, String> payload = Map.of(
                "name", "Fuck",
                "facultyId", "1"
        );

        ResponseEntity<?> response = controller.createCourse(payload, mockRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(courseRepository, never()).save(any());
    }

    @Test
    void createCourse_SingleCharacter_ReturnsBadRequest() {
        Map<String, String> payload = Map.of(
                "name", "Ứ",
                "facultyId", "1"
        );

        ResponseEntity<?> response = controller.createCourse(payload, mockRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(courseRepository, never()).save(any());
    }

    @Test
    void approveCourse_AdminApprove_ChangesStatusToActive() {
        Course course = Course.builder()
                .id(10L)
                .name("Kỹ Nghệ Dữ Liệu")
                .slug("ky-nghe-du-lieu")
                .status("pending")
                .build();

        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
            Course c = invocation.getArgument(0);
            c.setId(101L);
            return c;
        });

        ResponseEntity<?> response = controller.approveCourse(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals("active", body.get("status"));
        assertEquals("active", course.getStatus());
        assertNotNull(course.getCreatedAt());
    }

    @Test
    void createCourse_BurstSpam_ReturnsTooManyRequests() {
        Faculty faculty = Faculty.builder().id(1L).name("Khoa CNTT").build();
        when(facultyRepository.findById(1L)).thenReturn(Optional.of(faculty));
        when(courseRepository.findBySlug(anyString())).thenReturn(Optional.empty());
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> {
            Course c = invocation.getArgument(0);
            c.setId(101L);
            return c;
        });

        when(mockRequest.getRemoteAddr()).thenReturn("192.168.1.100");

        Map<String, String> payload1 = Map.of("name", "Học Phần Test 1", "facultyId", "1");
        Map<String, String> payload2 = Map.of("name", "Học Phần Test 2", "facultyId", "1");
        Map<String, String> payload3 = Map.of("name", "Học Phần Test 3", "facultyId", "1");

        // First 2 submissions succeed (within burst limit)
        ResponseEntity<?> resp1 = controller.createCourse(payload1, mockRequest);
        assertEquals(HttpStatus.OK, resp1.getStatusCode());

        ResponseEntity<?> resp2 = controller.createCourse(payload2, mockRequest);
        assertEquals(HttpStatus.OK, resp2.getStatusCode());

        // 3rd rapid submission exceeds burst limit (2 per 30s) -> 429 Too Many Requests
        ResponseEntity<?> resp3 = controller.createCourse(payload3, mockRequest);
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, resp3.getStatusCode());
        assertTrue(resp3.getBody().toString().contains("quá thường xuyên"));
    }

    @Test
    void deleteCourse_AdminDelete_CallsRepositoryDelete() {
        Course course = Course.builder().id(20L).name("Course To Delete").build();
        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));

        ResponseEntity<?> response = controller.deleteCourse(20L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(courseRepository).delete(course);
    }
}
