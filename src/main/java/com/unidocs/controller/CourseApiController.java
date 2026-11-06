package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Faculty;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.security.service.ContentModerationService;
import com.unidocs.service.CourseSpamCleanupService;
import com.unidocs.service.RateLimitingService;
import com.unidocs.service.TurnstileService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.CacheEvict;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseApiController {

    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final ContentModerationService contentModerationService;
    private final RateLimitingService rateLimitingService;
    private final TurnstileService turnstileService;
    private final CourseSpamCleanupService courseSpamCleanupService;

    public CourseApiController(CourseRepository courseRepository, 
                               FacultyRepository facultyRepository,
                               ContentModerationService contentModerationService,
                               RateLimitingService rateLimitingService,
                               TurnstileService turnstileService,
                               CourseSpamCleanupService courseSpamCleanupService) {
        this.courseRepository = courseRepository;
        this.facultyRepository = facultyRepository;
        this.contentModerationService = contentModerationService;
        this.rateLimitingService = rateLimitingService;
        this.turnstileService = turnstileService;
        this.courseSpamCleanupService = courseSpamCleanupService;
    }

    @PostMapping
    @CacheEvict(value = {"university", "faculty", "course"}, allEntries = true)
    public ResponseEntity<?> createCourse(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String ip = getClientIp(request);

            // 1. IP-Based Rate Limiting (Anti-Spam & Anti-Bot protection for JS loops)
            Bucket bucket = rateLimitingService.resolveCourseBucket(ip);
            if (!bucket.tryConsume(1)) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                    "message", "Hệ thống phát hiện gửi yêu cầu quá thường xuyên. Vui lòng thử lại sau giây lát!"
                ));
            }

            String name = payload.get("name");
            String facultyIdStr = payload.get("facultyId");
            
            if (name == null || name.trim().isEmpty() || facultyIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên học phần và khoa không được để trống"));
            }

            // 2. Bad Words & Content Moderation Validation
            String validationError = contentModerationService.validateCourseName(name);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("message", validationError));
            }

            name = toTitleCase(name.trim());
            
            Long facultyId = Long.parseLong(facultyIdStr);
            Optional<Faculty> facultyOpt = facultyRepository.findById(facultyId);
            if (facultyOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Khoa không tồn tại"));
            }
            
            String slug = generateSlug(name);
            
            if (courseRepository.findBySlug(slug).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Học phần này đã tồn tại hoặc đang chờ phê duyệt trong hệ thống"));
            }
            
            Course course = new Course();
            course.setName(name);
            course.setSlug(slug);
            course.setFaculty(facultyOpt.get());
            course.setStatus("pending"); // Set status: 'pending' (Chờ duyệt bởi Admin)
            
            Course saved = courseRepository.save(course);
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", saved.getId());
            responseBody.put("name", saved.getName());
            responseBody.put("slug", saved.getSlug());
            responseBody.put("status", saved.getStatus());
            responseBody.put("createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : "");
            responseBody.put("message", "Đã đóng góp Học phần mới thành công! Vui lòng đợi duyệt...");

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}/approve")
    @CacheEvict(value = {"course", "university", "faculty"}, allEntries = true)
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        try {
            Optional<Course> courseOpt = courseRepository.findById(id);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Course course = courseOpt.get();
            course.setStatus("active");
            course.setCreatedAt(LocalDateTime.now()); // Set fresh timestamp so it has the [Mới] badge upon approval

            Course saved = courseRepository.save(course);
            return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "status", saved.getStatus(),
                "message", "Đã phê duyệt học phần thành công!"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}")
    @CacheEvict(value = {"course", "university", "faculty"}, allEntries = true)
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên học phần không được để trống"));
            }
            
            name = toTitleCase(name.trim());
            
            Optional<Course> courseOpt = courseRepository.findById(id);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Course course = courseOpt.get();
            course.setName(name);
            
            Course saved = courseRepository.save(course);
            
            return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "slug", saved.getSlug()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/admin/{id}")
    @CacheEvict(value = {"course", "university", "faculty"}, allEntries = true)
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            Optional<Course> courseOpt = courseRepository.findById(id);
            if (courseOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            courseRepository.delete(courseOpt.get());
            return ResponseEntity.ok(Map.of("message", "Đã xóa học phần thành công"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Không thể xóa học phần. Có thể học phần này đang chứa tài liệu."));
        }
    }

    @PostMapping("/admin/clean-spam")
    @CacheEvict(value = {"course", "university", "faculty"}, allEntries = true)
    public ResponseEntity<?> cleanSpamCourses() {
        try {
            int count = courseSpamCleanupService.purgeSpamCourses();
            return ResponseEntity.ok(Map.of(
                "message", "Dọn dẹp thành công " + count + " học phần spam",
                "deletedCount", count
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi dọn dẹp: " + e.getMessage()));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (cfConnectingIp != null && !cfConnectingIp.trim().isEmpty()) {
            return cfConnectingIp.trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.trim().isEmpty()) {
            return xRealIp.trim();
        }
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.trim().isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private String toTitleCase(String input) {
        return Arrays.stream(input.toLowerCase().split("\\s+"))
                .map(word -> {
                    if (word.isEmpty()) return word;
                    return Character.toUpperCase(word.charAt(0)) + word.substring(1);
                })
                .collect(Collectors.joining(" "));
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
