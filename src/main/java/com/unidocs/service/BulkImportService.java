package com.unidocs.service;

import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.domain.DocumentType;
import com.unidocs.domain.Faculty;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.DocumentRepository;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.util.SlugGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class BulkImportService {

    private static final Logger log = LoggerFactory.getLogger(BulkImportService.class);

    public static class ImportProgress {
        public int totalFiles = 0;
        public int processedFiles = 0;
        public int failedFiles = 0;
        public String status = "IDLE";
    }
    public static final ImportProgress currentProgress = new ImportProgress();

    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    private final com.unidocs.repository.UniversityRepository universityRepository;
    private final java.util.concurrent.ExecutorService thumbnailExecutor = java.util.concurrent.Executors.newFixedThreadPool(2);

    public BulkImportService(FacultyRepository facultyRepository, 
                             CourseRepository courseRepository, 
                             DocumentRepository documentRepository, 
                             StorageService storageService,
                             com.unidocs.repository.UniversityRepository universityRepository) {
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.universityRepository = universityRepository;
    }

    @org.springframework.scheduling.annotation.Async
    public void importFromZipAsync(java.io.File tempFile) {
        currentProgress.status = "RUNNING";
        currentProgress.totalFiles = 0;
        currentProgress.processedFiles = 0;
        currentProgress.failedFiles = 0;

        try {
            com.unidocs.domain.University defaultUniversity = universityRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No university found in DB to link faculties"));

            try (java.util.zip.ZipFile zip = new java.util.zip.ZipFile(tempFile)) {
                currentProgress.totalFiles = zip.size();
                java.util.Enumeration<? extends java.util.zip.ZipEntry> entries = zip.entries();
                while (entries.hasMoreElements()) {
                    java.util.zip.ZipEntry entry = entries.nextElement();
                    if (!entry.isDirectory()) {
                        try {
                            String filePath = entry.getName();
                            // Normalize separators
                            filePath = filePath.replace("\\", "/");
                            String[] parts = filePath.split("/");
                            
                            if (parts.length >= 2) { 
                                int startIndex = 0;
                                
                                // Detect Root Folder and skip it (e.g. OneDrive exports or wrapper folders)
                                if (parts.length >= 3) {
                                    String p0 = parts[0];
                                    String p1 = parts[1];
                                    if ((!isFacultyPrefix(p0) && isFacultyPrefix(p1)) || p0.toLowerCase().startsWith("onedrive") || p0.toLowerCase().startsWith("export")) {
                                        startIndex = 1;
                                    }
                                }
                                
                                String facultyName = parts[startIndex].trim();
                                String courseName = parts.length > startIndex + 1 ? parts[startIndex + 1].trim() : "Khoa Khác";
                                
                                // Extract Folder Name (Academic Year) and keep original file name
                                String folderName = "Khác (Tài liệu không xác định năm)";
                                if (parts.length > startIndex + 2) {
                                    folderName = String.join(" - ", java.util.Arrays.copyOfRange(parts, startIndex + 2, parts.length - 1));
                                }
                                String fileName = parts[parts.length - 1].trim();

                                Faculty faculty = upsertFaculty(facultyName, defaultUniversity);
                                Course course = upsertCourse(courseName, faculty);
                                
                                try (java.io.InputStream is = zip.getInputStream(entry)) {
                                    processDocument(is, fileName, course, folderName);
                                }
                            }
                            currentProgress.processedFiles++;
                        } catch (Exception fileEx) {
                            log.error("Error processing file in ZIP: {}", entry.getName(), fileEx);
                            currentProgress.failedFiles++;
                            currentProgress.processedFiles++;
                        }
                    } else {
                        currentProgress.processedFiles++;
                    }
                }
            }
            currentProgress.status = "COMPLETED";
        } catch (Exception e) {
            log.error("Error during async bulk import", e);
            currentProgress.status = "FAILED";
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private boolean isFacultyPrefix(String str) {
        String lower = str.toLowerCase().trim();
        return lower.startsWith("khoa ") || 
               lower.startsWith("viện ") || 
               lower.startsWith("trường ") || 
               lower.startsWith("bộ môn ") ||
               lower.startsWith("môn học đại cương");
    }

    private Faculty upsertFaculty(String name, com.unidocs.domain.University university) {
        List<Faculty> existingFaculties = facultyRepository.findAll().stream()
                .filter(f -> f.getName().trim().equalsIgnoreCase(name.trim()))
                .toList();

        if (!existingFaculties.isEmpty()) {
            return existingFaculties.get(0);
        }

        Faculty newFaculty = new Faculty();
        newFaculty.setName(name);
        newFaculty.setSlug(SlugGenerator.generateSlug(name) + "-" + UUID.randomUUID().toString().substring(0, 4));
        newFaculty.setUniversity(university);
        return facultyRepository.save(newFaculty);
    }

    private Course upsertCourse(String name, Faculty faculty) {
        List<Course> existingCourses = courseRepository.findAll().stream()
                .filter(c -> c.getFaculty().getId().equals(faculty.getId()) && c.getName().trim().equalsIgnoreCase(name.trim()))
                .toList();

        if (!existingCourses.isEmpty()) {
            return existingCourses.get(0);
        }

        Course newCourse = new Course();
        newCourse.setName(name);
        newCourse.setSlug(SlugGenerator.generateSlug(name) + "-" + UUID.randomUUID().toString().substring(0, 4));
        newCourse.setFaculty(faculty);
        return courseRepository.save(newCourse);
    }

    private void processDocument(java.io.InputStream is, String fileName, Course course, String folderName) throws Exception {
        log.info("Processing file: {}", fileName);
        java.io.File entryTempFile = java.io.File.createTempFile("entry-", ".tmp");
        try {
            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(entryTempFile)) {
                byte[] copyBuffer = new byte[8192];
                int read;
                while ((read = is.read(copyBuffer)) != -1) {
                    fos.write(copyBuffer, 0, read);
                }
            }
            
            if (entryTempFile.length() == 0) return;

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (java.io.InputStream fileIs = new java.io.FileInputStream(entryTempFile)) {
                byte[] hashBuffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = fileIs.read(hashBuffer)) != -1) {
                    digest.update(hashBuffer, 0, bytesRead);
                }
            }
            byte[] hashBytes = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String sha256Hash = hexString.toString();

            Optional<Document> existingDoc = documentRepository.findBySha256Hash(sha256Hash);
            if (existingDoc.isPresent()) {
                log.info("Document already exists, skipping: {}", fileName);
                return;
            }

            DocumentType fileType = determineType(fileName);
            
            String extension = "";
            int extIndex = fileName.lastIndexOf(".");
            if (extIndex > 0) {
                extension = fileName.substring(extIndex);
            }
            String s3Key = UUID.randomUUID().toString() + extension;
            
            String storageUrl = storageService.uploadFile(entryTempFile, s3Key, getContentType(fileName));

            String thumbnailUrl = null;
            if (fileType == DocumentType.PDF && entryTempFile.length() < 50_000_000) { // Limit thumbnail generation to PDFs < 50MB
                log.info("Generating thumbnail for: {}", fileName);
                try (java.io.InputStream bais = new java.io.FileInputStream(entryTempFile)) {
                    java.util.concurrent.Future<byte[]> future = thumbnailExecutor.submit(() -> {
                        try {
                            return com.unidocs.util.PdfThumbnailUtil.generateThumbnail(bais);
                        } catch (Exception e) {
                            return null;
                        }
                    });
                    
                    try {
                        byte[] thumbBytes = future.get(15, java.util.concurrent.TimeUnit.SECONDS);
                        if (thumbBytes != null) {
                            String thumbFilename = "thumb_" + UUID.randomUUID().toString() + ".jpg";
                            thumbnailUrl = storageService.uploadFile(thumbBytes, thumbFilename, "image/jpeg");
                        }
                    } catch (java.util.concurrent.TimeoutException te) {
                        log.warn("Thumbnail generation timed out for: {}", fileName);
                        future.cancel(true);
                    } catch (Exception e) {
                        log.warn("Error generating thumbnail for: {}", fileName, e);
                    }
                }
            }

            Document doc = new Document();
            int dotIndex = fileName.lastIndexOf(".");
            doc.setTitle(dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName);
            doc.setFolderName(folderName);
            doc.setSlug(UUID.randomUUID().toString().substring(0, 8) + "-" + System.currentTimeMillis());
            doc.setFileType(fileType);
            doc.setFileSize(entryTempFile.length());
            doc.setSha256Hash(sha256Hash);
            doc.setStorageUrl(storageUrl);
            doc.setThumbnailUrl(thumbnailUrl);
            doc.setStatus(DocumentStatus.APPROVED);
            doc.setUploaderIp("ADMIN_IMPORT");
            doc.setUploadedAt(LocalDateTime.now());
            doc.setCourse(course);

            documentRepository.save(doc);

            try {
                Thread.sleep(200); // 200ms delay to prevent rate limits / Cloudflare blocking
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        } finally {
            if (entryTempFile.exists()) {
                entryTempFile.delete();
            }
        }
    }

    private DocumentType determineType(String filename) {
        String lowerName = filename.toLowerCase();
        if (lowerName.endsWith(".pdf")) return DocumentType.PDF;
        if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) return DocumentType.DOCX;
        if (lowerName.matches(".*\\.(png|jpg|jpeg|gif|webp|heic|bmp|svg)$")) return DocumentType.IMAGE;
        return DocumentType.PDF;
    }

    private String getContentType(String name) {
        String lowerName = name.toLowerCase();
        if (lowerName.endsWith(".pdf")) return "application/pdf";
        if (lowerName.endsWith(".png")) return "image/png";
        if (lowerName.matches(".*\\.(jpg|jpeg)$")) return "image/jpeg";
        if (lowerName.endsWith(".gif")) return "image/gif";
        if (lowerName.endsWith(".webp")) return "image/webp";
        if (lowerName.endsWith(".svg")) return "image/svg+xml";
        if (lowerName.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lowerName.endsWith(".doc")) return "application/msword";
        return "application/octet-stream"; 
    }
}
