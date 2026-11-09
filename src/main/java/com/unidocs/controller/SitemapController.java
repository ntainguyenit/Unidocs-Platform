package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Faculty;
import com.unidocs.domain.University;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.repository.UniversityRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

// Dynamic XML sitemap controller exposing all public routes, faculties, and active courses to crawlers
@RestController
public class SitemapController {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final List<String> UTILITY_PATHS = List.of(
            "/utilities/base-converter",
            "/utilities/bmi-calculator",
            "/utilities/code-formatter",
            "/utilities/color-contrast",
            "/utilities/color-converter",
            "/utilities/crypto-hash",
            "/utilities/currency-converter",
            "/utilities/data-converter",
            "/utilities/date-calculator",
            "/utilities/email-signature",
            "/utilities/exam-countdown",
            "/utilities/exam-simulation",
            "/utilities/flashcards",
            "/utilities/ip-checker",
            "/utilities/lucky-exam",
            "/utilities/lucky-wheel",
            "/utilities/markdown-editor",
            "/utilities/meta-tag-generator",
            "/utilities/mockup-generator",
            "/utilities/palette-extractor",
            "/utilities/password-generator",
            "/utilities/percentage-calculator",
            "/utilities/photo-booth",
            "/utilities/qr-generator",
            "/utilities/quick-mindmap",
            "/utilities/random-number",
            "/utilities/screenshot-beautifier",
            "/utilities/speed-test",
            "/utilities/stopwatch",
            "/utilities/study-groups/create",
            "/utilities/timetable",
            "/utilities/typing-test",
            "/utilities/typography-previewer"
    );

    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final String siteUrl;

    public SitemapController(UniversityRepository universityRepository,
                             FacultyRepository facultyRepository,
                             CourseRepository courseRepository,
                             @Value("${app.site-url:https://unidocs-husc.pages.dev}") String siteUrl) {
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.siteUrl = normalizeSiteUrl(siteUrl);
    }

    // Serve dynamically generated XML sitemap including universities, faculties, and active courses
    @GetMapping(value = "/sitemap.xml", produces = "application/xml;charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> getSitemap() {
        StringBuilder xml = new StringBuilder(4096);
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Core static landing and policy URLs
        appendUrl(xml, "/", null, "daily", "1.0");
        appendUrl(xml, "/feedback", null, "monthly", "0.7");
        appendUrl(xml, "/terms", null, "yearly", "0.4");
        appendUrl(xml, "/privacy", null, "yearly", "0.4");

        // Dynamic university faculty-directory URLs
        List<University> universities = universityRepository.findAll();
        for (University university : universities) {
            if (university != null && hasText(university.getSlug())) {
                appendUrl(xml, "/university/" + university.getSlug(), null, "weekly", "0.9");
            }
        }

        // Dynamic affiliated faculty URLs for rich snippet indexing
        List<Faculty> faculties = facultyRepository.findAll();
        for (Faculty faculty : faculties) {
            if (faculty != null && hasText(faculty.getSlug())) {
                appendUrl(xml, "/faculty/" + faculty.getSlug(), null, "daily", "0.9");
            }
        }

        // Dynamic approved/active course URLs excluding pending user submissions
        List<Course> courses = courseRepository.findActiveCoursesWithFaculty();
        for (Course course : courses) {
            if (course != null && hasText(course.getSlug())
                    && (course.getStatus() == null || "active".equalsIgnoreCase(course.getStatus()))) {
                String lastMod = course.getCreatedAt() != null ? ISO_DATE.format(course.getCreatedAt()) : null;
                appendUrl(xml, "/course/" + course.getSlug(), lastMod, "weekly", "0.8");
            }
        }

        // Student utility tool URLs
        for (String utilityPath : UTILITY_PATHS) {
            appendUrl(xml, utilityPath, null, "monthly", "0.6");
        }

        xml.append("</urlset>\n");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/xml;charset=UTF-8"))
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(xml.toString());
    }

    private void appendUrl(StringBuilder xml, String path, String lastMod, String changeFreq, String priority) {
        xml.append("    <url>\n");
        xml.append("        <loc>").append(escapeXml(siteUrl + path)).append("</loc>\n");
        if (hasText(lastMod)) {
            xml.append("        <lastmod>").append(escapeXml(lastMod)).append("</lastmod>\n");
        }
        xml.append("        <changefreq>").append(escapeXml(changeFreq)).append("</changefreq>\n");
        xml.append("        <priority>").append(escapeXml(priority)).append("</priority>\n");
        xml.append("    </url>\n");
    }

    private String escapeXml(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String normalizeSiteUrl(String url) {
        if (!hasText(url)) {
            return "https://unidocs-husc.pages.dev";
        }
        return url.trim().replaceAll("/+$", "");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
