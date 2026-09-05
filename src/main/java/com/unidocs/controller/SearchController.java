package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.DocumentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class SearchController {

    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final com.unidocs.repository.FacultyRepository facultyRepository;

    public SearchController(CourseRepository courseRepository, DocumentRepository documentRepository, com.unidocs.repository.FacultyRepository facultyRepository) {
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.facultyRepository = facultyRepository;
    }

    @GetMapping("/api/search")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<SearchResult> search() {
        List<SearchResult> results = new ArrayList<>();

        // Get all courses
        List<Course> courses = courseRepository.findAllWithFaculty();
        for (Course c : courses) {
            results.add(new SearchResult(
                    c.getName(),
                    "/course/" + c.getSlug(),
                    c.getFaculty() != null ? c.getFaculty().getName() : ""
            ));
        }

        // Get all faculties
        List<com.unidocs.domain.Faculty> faculties = facultyRepository.findAll();
        for (com.unidocs.domain.Faculty f : faculties) {
            results.add(new SearchResult(
                    f.getName(),
                    "/faculty/" + f.getSlug(),
                    "Khoa trực thuộc - " + (f.getUniversity() != null ? f.getUniversity().getName() : "")
            ));
        }

        return results;
    }

    public static class SearchResult {
        public String title;
        public String url;
        public String subtitle;

        public SearchResult(String title, String url, String subtitle) {
            this.title = title;
            this.url = url;
            this.subtitle = subtitle;
        }
    }
}
