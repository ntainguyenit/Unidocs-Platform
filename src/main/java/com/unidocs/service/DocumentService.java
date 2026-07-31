package com.unidocs.service;

import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.domain.DocumentType;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.DocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CourseRepository courseRepository;
    private final StorageService storageService;
    private final com.unidocs.repository.AuditLogRepository auditLogRepository;

    public DocumentService(DocumentRepository documentRepository, 
                           CourseRepository courseRepository, 
                           StorageService storageService,
                           com.unidocs.repository.AuditLogRepository auditLogRepository) {
        this.documentRepository = documentRepository;
        this.courseRepository = courseRepository;
        this.storageService = storageService;
        this.auditLogRepository = auditLogRepository;
    }

    public List<Document> getApprovedDocumentsByCourse(Long courseId) {
        return documentRepository.findByCourseIdAndStatusOrderByUploadedAtDesc(courseId, DocumentStatus.APPROVED);
    }

    public Page<Document> getAllDocumentsPaginated(int page, int size, String status, String sort) {
        org.springframework.data.domain.Sort sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "reliabilityScore").and(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "uploadedAt"));
        
        if ("newest".equalsIgnoreCase(sort)) {
            sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "uploadedAt");
        } else if ("oldest".equalsIgnoreCase(sort)) {
            sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "uploadedAt");
        }
        
        Pageable pageable = PageRequest.of(page, size, sorting);
        if (status != null && !status.isEmpty()) {
            try {
                DocumentStatus docStatus = DocumentStatus.valueOf(status.toUpperCase());
                return documentRepository.findByStatus(docStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }
        return documentRepository.findAll(pageable);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAllByOrderByReliabilityScoreDescUploadedAtDesc();
    }

    @Transactional
    public Document uploadDocument(MultipartFile file, Long courseId, String ipAddress, String userAgent) throws Exception {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Học phần không tồn tại"));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }
        
        DocumentType type = determineType(originalFilename);
        if (type == null) {
            throw new IllegalArgumentException("Chỉ cho phép định dạng PDF, DOCX, PPTX và các định dạng ảnh (PNG, JPG, JPEG, GIF, WEBP, SVG)");
        }

        String hash = computeSha256(file);
        
        Optional<Document> existing = documentRepository.findBySha256Hash(hash);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Tài liệu này đã tồn tại trên hệ thống!");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;
        String storageUrl = storageService.uploadFile(file, newFilename);

        String thumbnailUrl = null;
        if (type == DocumentType.PDF) {
            byte[] thumbBytes = com.unidocs.util.PdfThumbnailUtil.generateThumbnail(file.getInputStream());
            if (thumbBytes != null) {
                String thumbFilename = "thumb_" + UUID.randomUUID().toString() + ".jpg";
                thumbnailUrl = storageService.uploadFile(thumbBytes, thumbFilename, "image/jpeg");
            }
        }

        Document doc = new Document();
        doc.setTitle(originalFilename.substring(0, originalFilename.lastIndexOf(".")));
        doc.setSlug(UUID.randomUUID().toString().substring(0, 8) + "-" + System.currentTimeMillis());
        doc.setFileType(type);
        doc.setFileSize(file.getSize());
        doc.setSha256Hash(hash);
        doc.setStorageUrl(storageUrl);
        doc.setThumbnailUrl(thumbnailUrl);
        doc.setStatus(DocumentStatus.PENDING);
        doc.setUploaderIp(ipAddress);
        doc.setCourse(course);
        doc.setUploadBatchId(ipAddress + "-" + java.time.LocalDateTime.now().getHour());
        
        Document savedDoc = documentRepository.save(doc);

        com.unidocs.domain.AuditLog log = new com.unidocs.domain.AuditLog();
        log.setAction("UPLOAD");
        log.setDocumentId(savedDoc.getId());
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        auditLogRepository.save(log);

        return savedDoc;
    }

    private DocumentType determineType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return DocumentType.PDF;
        if (lower.endsWith(".docx") || lower.endsWith(".doc")) return DocumentType.DOCX;
        if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return DocumentType.PPTX;
        if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || 
            lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg") || 
            lower.endsWith(".heic") || lower.endsWith(".bmp")) {
            return DocumentType.IMAGE;
        }
        return null;
    }

    private String computeSha256(MultipartFile file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream is = file.getInputStream()) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) > 0) {
                digest.update(buffer, 0, read);
            }
        }
        byte[] hash = digest.digest();
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Transactional
    public void approveDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài liệu"));
        doc.setStatus(DocumentStatus.APPROVED);
        documentRepository.save(doc);
    }

    @Transactional
    public void rejectDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài liệu"));
        
        String storageUrl = doc.getStorageUrl();
        if (storageUrl != null && storageUrl.contains("/")) {
            String filename = storageUrl.substring(storageUrl.lastIndexOf("/") + 1);
            try {
                storageService.deleteFile(filename);
            } catch (Exception e) {
                System.err.println("Failed to delete file from storage: " + filename);
            }
        }
        
        documentRepository.delete(doc);
    }

    public Document getDocumentBySlug(String slug) {
        return documentRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Tài liệu không tồn tại"));
    }

    @Transactional
    public void incrementViews(Long id) {
        Document doc = documentRepository.findById(id).orElse(null);
        if (doc != null) {
            doc.setViews(doc.getViews() + 1);
            documentRepository.save(doc);
        }
    }

    @Transactional
    public void incrementDownloads(Long id) {
        Document doc = documentRepository.findById(id).orElse(null);
        if (doc != null) {
            doc.setDownloads(doc.getDownloads() + 1);
            documentRepository.save(doc);
        }
    }

    @Transactional
    public void renameDocument(Long id, String newName) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài liệu"));
        
        String trimmedName = newName.trim();
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Tên tài liệu không được để trống");
        }
        
        if (doc.getTitle().equals(trimmedName)) {
            return;
        }

        if (documentRepository.existsByCourseIdAndTitle(doc.getCourse().getId(), trimmedName)) {
            throw new IllegalArgumentException("Đã tồn tại tài liệu có tên '" + trimmedName + "' trong học phần này.");
        }

        doc.setTitle(trimmedName);
        documentRepository.save(doc);
    }

    @Transactional
    public Document saveDirectly(Document document) {
        return documentRepository.save(document);
    }

    public List<Document> getTrendingDocumentsForCourse(Long courseId, int limit) {
        return documentRepository.findTrendingDocumentsByCourse(courseId, DocumentStatus.APPROVED, PageRequest.of(0, limit));
    }

    public List<Document> getRelatedDocuments(Document document, int limit) {
        Long courseId = document.getCourse().getId();
        Long excludeId = document.getId();
        String folderName = document.getFolderName();
        
        List<Document> related = new java.util.ArrayList<>();
        
        // Priority 1: Same folder
        if (folderName != null) {
            related.addAll(documentRepository.findRelatedDocumentsSameFolder(courseId, folderName, excludeId, DocumentStatus.APPROVED, PageRequest.of(0, limit)));
        }
        
        // Priority 2: Same course if we need more
        if (related.size() < limit) {
            int needed = limit - related.size();
            List<Document> sameCourse = documentRepository.findRelatedDocumentsSameCourse(courseId, excludeId, DocumentStatus.APPROVED, PageRequest.of(0, limit));
            
            for (Document d : sameCourse) {
                if (related.size() >= limit) break;
                if (related.stream().noneMatch(r -> r.getId().equals(d.getId()))) {
                    related.add(d);
                }
            }
        }
        
        return related;
    }
}