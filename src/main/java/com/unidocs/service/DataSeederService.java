package com.unidocs.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unidocs.domain.*;
import com.unidocs.repository.*;
import com.unidocs.util.CustomMultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "feature.import.enabled", havingValue = "true")
public class DataSeederService {

    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final DocumentService documentService;
    private final ObjectMapper objectMapper;

    public DataSeederService(UniversityRepository universityRepository,
                             FacultyRepository facultyRepository,
                             CourseRepository courseRepository,
                             DocumentService documentService) {
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.documentService = documentService;
        this.objectMapper = new ObjectMapper()
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public static class DriveItem {
        public String id;
        public String name;
        public String mimeType;
        public String size;
        public String rootName;
        public Integer totalDownload;
        public Integer totalView;
        public List<DriveItem> children;
    }

    @Async
    public void startImport(String jsonContent) {
        log.info("Bắt đầu tiến trình Nhập Liệu Hàng Loạt (Bulk Import)...");
        try {
            // Check if it's an array or single object
            List<DriveItem> faculties;
            if (jsonContent.trim().startsWith("[")) {
                faculties = objectMapper.readValue(jsonContent, new TypeReference<List<DriveItem>>() {});
            } else {
                DriveItem single = objectMapper.readValue(jsonContent, DriveItem.class);
                faculties = List.of(single);
            }

            // Get first university in DB (Default is HUSC)
            List<University> allUnis = universityRepository.findAll();
            University uni = allUnis.isEmpty() ? null : allUnis.get(0);
            
            if (uni == null) {
                throw new RuntimeException("No university found in DB to link faculties");
            }

            for (DriveItem facultyItem : faculties) {
                processFaculty(facultyItem, uni);
            }
            log.info("Hoàn thành tiến trình Nhập Liệu Hàng Loạt!");
        } catch (Exception e) {
            log.error("Lỗi trong quá trình Import JSON: ", e);
        }
    }

    @Transactional
    protected void processFaculty(DriveItem facultyItem, University uni) {
        Faculty faculty = facultyRepository.findBySlug(generateSlug(facultyItem.name)).orElse(null);
        if (faculty == null) {
            faculty = new Faculty();
            faculty.setName(facultyItem.name);
            faculty.setSlug(generateSlug(facultyItem.name));
            faculty.setUniversity(uni);
            faculty = facultyRepository.save(faculty);
        }

        if (facultyItem.children != null) {
            for (DriveItem courseItem : facultyItem.children) {
                processCourse(courseItem, faculty);
            }
        }
    }

    @Transactional
    protected void processCourse(DriveItem courseItem, Faculty faculty) {
        Course course = courseRepository.findBySlug(generateSlug(courseItem.name)).orElse(null);
        if (course == null) {
            course = new Course();
            course.setName(courseItem.name);
            course.setSlug(generateSlug(courseItem.name));
            course.setFaculty(faculty);
            course = courseRepository.save(course);
        }

        if (courseItem.children != null) {
            for (DriveItem yearFolderItem : courseItem.children) {
                // Here yearFolderItem is like "2024 - 2025"
                if (yearFolderItem.children != null) {
                    for (DriveItem docItem : yearFolderItem.children) {
                        processDocument(docItem, course, yearFolderItem.name);
                    }
                }
            }
        }
    }

    private void processDocument(DriveItem docItem, Course course, String yearLabel) {
        // Only process actual files (ignore deeper folders for now)
        if (docItem.mimeType == null || docItem.mimeType.contains("folder")) return;
        
        try {
            log.info("Đang xử lý file: {} (Size: {})", docItem.name, docItem.size);

            String downloadUrl = "https://drive.google.com/uc?export=download&id=" + docItem.id;
            URL url = new URL(downloadUrl);
            try (InputStream in = url.openStream()) {
                
                String extension = ".pdf";
                if (docItem.mimeType.contains("word")) extension = ".docx";
                else if (docItem.mimeType.contains("powerpoint")) extension = ".pptx";
                
                String originalFilename = docItem.name;
                if (!originalFilename.toLowerCase().endsWith(extension)) {
                    originalFilename += extension;
                }

                // Append year to title to differentiate if needed
                originalFilename = yearLabel + " - " + originalFilename;

                byte[] fileBytes = in.readAllBytes();
                MultipartFile mockFile = new CustomMultipartFile(
                        "file", 
                        originalFilename, 
                        docItem.mimeType, 
                        fileBytes
                );

                Document uploadedDoc = documentService.uploadDocument(mockFile, course.getId(), "127.0.0.1", "SYSTEM_SEEDER");
                
                // Set to approved automatically and set correct views/downloads
                uploadedDoc.setStatus(DocumentStatus.APPROVED);
                if (docItem.totalView != null) uploadedDoc.setViews(docItem.totalView);
                if (docItem.totalDownload != null) uploadedDoc.setDownloads(docItem.totalDownload);
                
                // documentService.uploadDocument returns a saved entity, so we update it
                documentService.saveDirectly(uploadedDoc);
                
                log.info("Upload thành công: {}", originalFilename);
            }
        } catch (IllegalArgumentException e) {
            log.warn("Bỏ qua file {} do: {}", docItem.name, e.getMessage()); // Like "Tài liệu này đã tồn tại"
        } catch (Exception e) {
            log.error("Lỗi khi xử lý file {}: {}", docItem.name, e.getMessage());
        }
    }

    private String generateSlug(String text) {
        if (text == null) return UUID.randomUUID().toString().substring(0, 8);
        return text.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[áàảãạâấầẩẫậăắằẳẵặ]", "a")
                .replaceAll("[éèẻẽẹêếềểễệ]", "e")
                .replaceAll("[íìỉĩị]", "i")
                .replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o")
                .replaceAll("[úùủũụưứừửữự]", "u")
                .replaceAll("[ýỳỷỹỵ]", "y")
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
