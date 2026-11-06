package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.domain.Faculty;
import com.unidocs.repository.DocumentRepository;
import com.unidocs.service.DocumentService;
import com.unidocs.service.RateLimitingService;
import com.unidocs.service.TurnstileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

// Single-line English comment: Unit tests for new document approval notification logic
class DocumentNotificationTest {

    private DocumentService documentService;
    private DocumentRepository documentRepository;
    private TurnstileService turnstileService;
    private RateLimitingService rateLimitingService;
    private DocumentController documentController;

    @BeforeEach
    void setUp() {
        // Single-line English comment: Initialize mock objects
        documentService = mock(DocumentService.class);
        documentRepository = mock(DocumentRepository.class);
        turnstileService = mock(TurnstileService.class);
        rateLimitingService = mock(RateLimitingService.class);

        // Single-line English comment: Initialize controller under test
        documentController = new DocumentController(
                documentService,
                documentRepository,
                turnstileService,
                rateLimitingService
        );
    }

    @Test
    void getLatestApprovedDocument_WhenApprovedDocumentExists_ReturnsFormattedToastMessage() {
        // Single-line English comment: Build mock faculty and course
        Faculty faculty = Faculty.builder().id(1L).name("Khoa Lý luận chính trị").build();
        Course course = Course.builder().id(2L).name("Luật Hành Chính").faculty(faculty).build();

        // Single-line English comment: Build mock document with exact test timestamp
        Document document = new Document();
        document.setId(2808L);
        document.setTitle("Kinh tế chính trị Mác Lênin");
        document.setSlug("kinh-te-chinh-tri-mac-le-nin");
        document.setStatus(DocumentStatus.APPROVED);
        document.setCourse(course);
        document.setUploadedAt(LocalDateTime.of(2026, 11, 6, 9, 10));
        document.setApprovedAt(LocalDateTime.of(2026, 11, 6, 9, 13));

        // Single-line English comment: Mock repository response
        when(documentRepository.findLatestApprovedDocumentsWithCourseAndFaculty(eq(DocumentStatus.APPROVED), any()))
                .thenReturn(List.of(document));

        // Single-line English comment: Execute endpoint call
        ResponseEntity<?> response = documentController.getLatestApprovedDocument();

        // Single-line English comment: Assert response status is 200 OK
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        // Single-line English comment: Verify exact notification message format
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(2808L, body.get("id"));
        assertEquals("Luật Hành Chính", body.get("courseName"));
        assertEquals("Khoa Lý luận chính trị", body.get("facultyName"));
        assertEquals("09:13 ngày 06/11/2026", body.get("time"));
        assertEquals("Có tài liệu mới Học phần: Luật Hành Chính - Khoa Lý luận chính trị lúc 09:13 ngày 06/11/2026", body.get("message"));
    }

    @Test
    void getLatestApprovedDocument_WhenNoDocumentExists_ReturnsNoContent() {
        // Single-line English comment: Mock empty repository response
        when(documentRepository.findLatestApprovedDocumentsWithCourseAndFaculty(eq(DocumentStatus.APPROVED), any()))
                .thenReturn(Collections.emptyList());

        // Single-line English comment: Execute endpoint call
        ResponseEntity<?> response = documentController.getLatestApprovedDocument();

        // Single-line English comment: Assert response status is 204 No Content
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void approveDocument_InService_UpdatesStatusAndSetsApprovedAt() {
        // Single-line English comment: Setup real document repository mock for service test
        Document doc = new Document();
        doc.setId(10L);
        doc.setStatus(DocumentStatus.PENDING);
        assertNull(doc.getApprovedAt());

        // Single-line English comment: Mock finding document by ID
        when(documentRepository.findById(10L)).thenReturn(Optional.of(doc));

        // Single-line English comment: Initialize service with mocked dependencies
        com.unidocs.service.StorageService storageService = mock(com.unidocs.service.StorageService.class);
        com.unidocs.repository.CourseRepository courseRepository = mock(com.unidocs.repository.CourseRepository.class);
        com.unidocs.repository.AuditLogRepository auditLogRepository = mock(com.unidocs.repository.AuditLogRepository.class);
        DocumentService service = new DocumentService(documentRepository, courseRepository, storageService, auditLogRepository);

        // Single-line English comment: Execute approveDocument
        service.approveDocument(10L);

        // Single-line English comment: Verify status is APPROVED and approvedAt is set
        assertEquals(DocumentStatus.APPROVED, doc.getStatus());
        assertNotNull(doc.getApprovedAt());
        verify(documentRepository).save(doc);
    }
}
