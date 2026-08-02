package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Faculty;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.FacultyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.CacheEvict;

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

    public CourseApiController(CourseRepository courseRepository, FacultyRepository facultyRepository) {
        this.courseRepository = courseRepository;
        this.facultyRepository = facultyRepository;
    }

    @PostMapping
    @CacheEvict(value = {"university", "faculty", "course"}, allEntries = true)
    public ResponseEntity<?> createCourse(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String facultyIdStr = payload.get("facultyId");
            
            if (name == null || name.trim().isEmpty() || facultyIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên học phần và khoa không được để trống"));
            }

            name = toTitleCase(name.trim());
            
            Long facultyId = Long.parseLong(facultyIdStr);
            Optional<Faculty> facultyOpt = facultyRepository.findById(facultyId);
            if (facultyOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Khoa không tồn tại"));
            }
            
            String slug = generateSlug(name);
            
            if (courseRepository.findBySlug(slug).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Học phần này đã tồn tại trong hệ thống"));
            }
            
            Course course = new Course();
            course.setName(name);
            course.setSlug(slug);
            course.setFaculty(facultyOpt.get());
            
            Course saved = courseRepository.save(course);
            
            return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "slug", saved.getSlug(),
                "createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : ""
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
