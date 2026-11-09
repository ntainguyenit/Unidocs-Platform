package com.unidocs.controller;

import com.unidocs.domain.*;
import com.unidocs.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Verify pale sky-blue canvas theme and white surfaces across rendered views
@SpringBootTest
@Transactional
class ThemeBackgroundIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UniversityRepository universityRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired(required = false)
    private CacheManager cacheManager;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        // Build MockMvc with the full Spring MVC and Thymeleaf context
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        clearAllCaches();
    }

    @AfterEach
    void tearDown() {
        // Clear caches after transaction rollback so rolled-back fixtures are never cached
        clearAllCaches();
    }

    private void clearAllCaches() {
        // Evict cached queries so newly seeded academic fixtures appear cleanly
        if (cacheManager != null) {
            cacheManager.getCacheNames().forEach(name -> {
                Cache cache = cacheManager.getCache(name);
                if (cache != null) {
                    cache.clear();
                }
            });
        }
    }

    @Test
    void corePublicPages_UsePaleBlueCanvasWhileKeepingHeaderFooterAndCardsWhite() throws Exception {
        // Verify homepage applies pale blue canvas while preserving header, white footer, and white cards
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("--unidocs-bg: #eaf2ff")))
                .andExpect(content().string(containsString("<body class=\"bg-[#eaf2ff]")))
                .andExpect(content().string(containsString("<header class=\"bg-primary")))
                .andExpect(content().string(containsString("<footer class=\"bg-white border-t border-divider")))
                .andExpect(content().string(containsString("bg-white rounded-lg shadow-sm border border-divider")))
                .andExpect(content().string(not(containsString("<footer class=\"bg-gray-100"))));

        // Verify standalone public pages apply pale blue canvas and keep white cards and footer
        for (String path : List.of("/feedback", "/terms", "/privacy", "/utilities/study-groups/create")) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("<body class=\"bg-[#eaf2ff]")))
                    .andExpect(content().string(containsString("<footer class=\"bg-white border-t border-divider")))
                    .andExpect(content().string(containsString("bg-white")));
        }

        // Verify maintenance and login pages use pale blue canvas with white card containers
        for (String path : List.of("/maintenance", "/maintenance.html", "/login")) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("<body class=\"bg-[#eaf2ff]")))
                    .andExpect(content().string(containsString("bg-white")));
        }
    }

    @Test
    void seededAcademicRoutes_ApplyPaleBlueCanvasAndStickyCanvasBreadcrumbWithWhiteCards() throws Exception {
        // Seed university, faculty, course, and approved document inside rollback transaction
        University university = universityRepository.save(University.builder()
                .name("Đại học Khoa học Huế Test")
                .slug("dhkh-hue-theme-test")
                .build());
        Faculty faculty = facultyRepository.save(Faculty.builder()
                .name("Khoa Công nghệ Thông tin Test")
                .slug("cntt-theme-test")
                .university(university)
                .build());
        university.getFaculties().add(faculty);

        Course course = courseRepository.save(Course.builder()
                .name("Lập Trình Web Test")
                .slug("lap-trinh-web-theme-test")
                .faculty(faculty)
                .status("active")
                .build());
        faculty.getCourses().add(course);

        Document document = new Document();
        document.setTitle("Đề thi mẫu Lập Trình Web");
        document.setSlug("de-thi-mau-lap-trinh-web-theme-test");
        document.setFileType(DocumentType.PDF);
        document.setFileSize(1024L);
        document.setStorageUrl("https://example.com/sample.pdf");
        document.setFolderName("2026");
        document.setSha256Hash("theme-test-sha256-hash");
        document.setStatus(DocumentStatus.APPROVED);
        document.setUploaderIp("127.0.0.1");
        document.setApprovedAt(LocalDateTime.now());
        document.setCourse(course);
        documentRepository.saveAndFlush(document);
        clearAllCaches();

        // Verify homepage university card renders .card while preserving pale blue body canvas
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<body class=\"bg-[#eaf2ff]")))
                .andExpect(content().string(containsString("class=\"card")));

        // Verify university, faculty, course, and document views use pale blue canvas and white panels
        for (String path : List.of(
                "/university/dhkh-hue-theme-test",
                "/faculty/cntt-theme-test",
                "/course/lap-trinh-web-theme-test",
                "/document/de-thi-mau-lap-trinh-web-theme-test/view"
        )) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("<body class=\"bg-[#eaf2ff]")))
                    .andExpect(content().string(containsString("bg-[#eaf2ff]/95")))
                    .andExpect(content().string(containsString("bg-white")))
                    .andExpect(content().string(containsString("<footer class=\"bg-white")));
        }
    }

    @Test
    void allUtilityPages_UsePaleBlueCanvasWhileKeepingCardsAndBackPillsWhite() throws Exception {
        // Verify representative utility groups plus standalone CDN tools all apply pale blue canvas
        List<String> utilityPaths = List.of(
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
                "/utilities/timetable",
                "/utilities/typing-test",
                "/utilities/typography-previewer"
        );

        for (String path : utilityPaths) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("<body class=\"bg-[#eaf2ff]")))
                    .andExpect(content().string(containsString("--unidocs-bg: #eaf2ff")))
                    .andExpect(content().string(containsString("bg-white")))
                    .andExpect(content().string(not(containsString("<body class=\"bg-gray-50"))));
        }
    }

    @Test
    void compiledCssAsset_ContainsCanvasVariablesAndColorSchemeDeclaration() throws Exception {
        // Verify static Tailwind output stylesheet includes root canvas variable and light/dark color-scheme
        mockMvc.perform(get("/css/output.css"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("--unidocs-bg:#eaf2ff")))
                .andExpect(content().string(containsString("color-scheme:light")))
                .andExpect(content().string(containsString(".bg-\\[\\#eaf2ff\\]")))
                .andExpect(content().string(containsString(".bg-white")));
    }
}
