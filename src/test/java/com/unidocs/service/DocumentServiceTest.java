package com.unidocs.service;

import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.domain.DocumentType;
import com.unidocs.repository.AuditLogRepository;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private DocumentService documentService;

    private Course mockCourse;
    private Document mockDocument;

    @BeforeEach
    void setUp() {
        mockCourse = new Course();
        mockCourse.setId(1L);
        mockCourse.setName("Test Course");

        mockDocument = new Document();
        mockDocument.setId(10L);
        mockDocument.setTitle("Test Document");
        mockDocument.setCourse(mockCourse);
        mockDocument.setStatus(DocumentStatus.APPROVED);
        mockDocument.setStorageUrl("https://storage.url/test.pdf");
    }

    @Test
    void getApprovedDocumentsByCourse_ReturnsList() {
        when(documentRepository.findByCourseIdAndStatusOrderByUploadedAtDesc(1L, DocumentStatus.APPROVED))
                .thenReturn(Arrays.asList(mockDocument));

        List<Document> docs = documentService.getApprovedDocumentsByCourse(1L);
        assertFalse(docs.isEmpty());
        assertEquals("Test Document", docs.get(0).getTitle());
        verify(documentRepository).findByCourseIdAndStatusOrderByUploadedAtDesc(1L, DocumentStatus.APPROVED);
    }

    @Test
    void getAllDocumentsPaginated_WithValidStatus_ReturnsPage() {
        Page<Document> page = new PageImpl<>(Arrays.asList(mockDocument));
        when(documentRepository.findByStatus(eq(DocumentStatus.PENDING), any(Pageable.class)))
                .thenReturn(page);

        Page<Document> result = documentService.getAllDocumentsPaginated(0, 10, "PENDING", "newest");
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(documentRepository).findByStatus(eq(DocumentStatus.PENDING), any(Pageable.class));
    }

    @Test
    void uploadDocument_WithValidData_ReturnsDocument() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "dummy content".getBytes());
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(documentRepository.findBySha256Hash(anyString())).thenReturn(Optional.empty());
        when(storageService.uploadFile(any(), anyString())).thenReturn("https://storage.url/new-file.pdf");
        when(documentRepository.save(any(Document.class))).thenAnswer(i -> {
            Document d = i.getArgument(0);
            d.setId(99L);
            return d;
        });

        Document saved = documentService.uploadDocument(file, 1L, "127.0.0.1", "Mozilla");
        assertNotNull(saved);
        assertEquals("test", saved.getTitle());
        assertEquals(DocumentType.PDF, saved.getFileType());
        assertEquals(DocumentStatus.PENDING, saved.getStatus());
        verify(auditLogRepository).save(any());
    }

    @Test
    void uploadDocument_WithInvalidExtension_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("file", "test.exe", "application/x-msdownload", "dummy content".getBytes());
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            documentService.uploadDocument(file, 1L, "127.0.0.1", "Mozilla");
        });
        assertTrue(ex.getMessage().contains("Chỉ cho phép định dạng PDF, DOCX, PPTX và các định dạng ảnh"));
    }

    @Test
    void uploadDocument_WithDuplicateHash_ThrowsException() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "dummy content".getBytes());
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(documentRepository.findBySha256Hash(anyString())).thenReturn(Optional.of(mockDocument));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            documentService.uploadDocument(file, 1L, "127.0.0.1", "Mozilla");
        });
        assertTrue(ex.getMessage().contains("Tài liệu này đã tồn tại"));
    }

    @Test
    void approveDocument_Success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(mockDocument));
        
        documentService.approveDocument(10L);
        assertEquals(DocumentStatus.APPROVED, mockDocument.getStatus());
        verify(documentRepository).save(mockDocument);
    }

    @Test
    void rejectDocument_Success() throws Exception {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(mockDocument));
        
        documentService.rejectDocument(10L);
        verify(storageService).deleteFile("test.pdf");
        verify(documentRepository).delete(mockDocument);
    }

    @Test
    void incrementViews_Success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(mockDocument));
        mockDocument.setViews(5);

        documentService.incrementViews(10L);
        assertEquals(6, mockDocument.getViews());
        verify(documentRepository).save(mockDocument);
    }

    @Test
    void renameDocument_Success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(mockDocument));
        when(documentRepository.existsByCourseIdAndTitle(1L, "New Name")).thenReturn(false);

        documentService.renameDocument(10L, "New Name");
        assertEquals("New Name", mockDocument.getTitle());
        verify(documentRepository).save(mockDocument);
    }

    @Test
    void renameDocument_WithExistingName_ThrowsException() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(mockDocument));
        when(documentRepository.existsByCourseIdAndTitle(1L, "Existing Name")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            documentService.renameDocument(10L, "Existing Name");
        });
        assertTrue(ex.getMessage().contains("Đã tồn tại tài liệu có tên"));
    }
}
