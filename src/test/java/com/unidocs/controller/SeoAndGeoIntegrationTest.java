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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// End-to-end integration tests verifying dynamic SEO meta tags, Open Graph, Schema.org JSON-LD, GEO intros, and sitemap.xml
@SpringBootTest
@Transactional
class SeoAndGeoIntegrationTest {

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
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        clearAllCaches();
    }

    @AfterEach
    void tearDown() {
        clearAllCaches();
    }

    private void clearAllCaches() {
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
    void facultyCourseUniversityAndSitemapRoutes_RenderDynamicSeoAndGeoMetadata() throws Exception {
        University university = universityRepository.save(University.builder()
                .name("Trường đại học Khoa học")
                .slug("truong-dai-hoc-khoa-hoc-seo")
                .shortName("HUSC")
                .build());

        Faculty itFaculty = facultyRepository.save(Faculty.builder()
                .name("Khoa Công nghệ Thông tin")
                .slug("khoa-cntt-seo")
                .university(university)
                .build());
        Faculty journalismFaculty = facultyRepository.save(Faculty.builder()
                .name("Khoa Báo chí - Truyền thông")
                .slug("khoa-bao-chi-seo")
                .university(university)
                .build());
        university.getFaculties().add(itFaculty);
        university.getFaculties().add(journalismFaculty);

        Course activeCourse = courseRepository.save(Course.builder()
                .name("Cấu trúc Dữ liệu và Thuật Toán")
                .slug("cau-truc-du-lieu-seo")
                .faculty(itFaculty)
                .status("active")
                .build());
        Course pendingCourse = courseRepository.save(Course.builder()
                .name("Học phần Chờ Duyệt")
                .slug("hoc-phan-cho-duyet-seo")
                .faculty(itFaculty)
                .status("pending")
                .build());
        itFaculty.getCourses().add(activeCourse);
        itFaculty.getCourses().add(pendingCourse);

        Document doc = new Document();
        doc.setTitle("Đề thi cuối kỳ CTDL HUSC");
        doc.setSlug("de-thi-cuoi-ky-ctdl-seo");
        doc.setFileType(DocumentType.PDF);
        doc.setFileSize(2048L);
        doc.setStorageUrl("https://example.com/ctdl.pdf");
        doc.setFolderName("2026");
        doc.setSha256Hash("seo-test-sha256");
        doc.setStatus(DocumentStatus.APPROVED);
        doc.setUploaderIp("127.0.0.1");
        doc.setApprovedAt(LocalDateTime.now());
        doc.setCourse(activeCourse);
        documentRepository.saveAndFlush(doc);
        clearAllCaches();

        // 1. Verify University directory page SEO + Schema + GEO intro
        mockMvc.perform(get("/university/truong-dai-hoc-khoa-hoc-seo"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Trường đại học Khoa học - Trường Đại học Khoa học Huế (ĐHKH Huế, HUSC) | UniDocs")))
                .andExpect(content().string(containsString("Khoa Công nghệ Thông tin")))
                .andExpect(content().string(containsString("Khoa Báo chí - Truyền thông")))
                .andExpect(content().string(containsString("<link rel=\"canonical\" href=\"https://unidocs-husc.pages.dev/university/truong-dai-hoc-khoa-hoc-seo\">")))
                .andExpect(content().string(containsString("\"@type\":\"CollectionPage\"")))
                .andExpect(content().string(containsString("\"@type\":\"EducationalOrganization\"")));

        // 2. Verify Faculty page exact Title, Description, Canonical, Open Graph, CollectionPage/EducationalOrganization JSON-LD
        mockMvc.perform(get("/faculty/khoa-cntt-seo"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<title>Khoa Công nghệ Thông tin - Trường Đại học Khoa học Huế | HUSC UniDocs</title>")))
                .andExpect(content().string(containsString("<meta name=\"description\" content=\"Tổng hợp tài liệu, đề thi, giáo trình chính thống của Khoa Công nghệ Thông tin tại Trường Khoa học Huế (ĐHKH Huế, HUSC). Chia sẻ học tập miễn phí trên UniDocs.\">")))
                .andExpect(content().string(containsString("<link rel=\"canonical\" href=\"https://unidocs-husc.pages.dev/faculty/khoa-cntt-seo\">")))
                .andExpect(content().string(containsString("<meta property=\"og:url\" content=\"https://unidocs-husc.pages.dev/faculty/khoa-cntt-seo\">")))
                .andExpect(content().string(containsString("<meta property=\"og:site_name\" content=\"UniDocs HUSC\">")))
                .andExpect(content().string(containsString("<meta property=\"og:locale\" content=\"vi_VN\">")))
                .andExpect(content().string(containsString("<meta name=\"twitter:card\" content=\"summary\">")))
                .andExpect(content().string(containsString("\"@type\":\"CollectionPage\"")))
                .andExpect(content().string(containsString("\"@type\":\"EducationalOrganization\"")))
                .andExpect(content().string(containsString("ĐHKH Huế")))
                .andExpect(content().string(containsString("Trường Khoa học Huế")));

        // 3. Verify Course page exact Title, Description, GEO Contextual Intro, single <head>, and canonical ignoring query param
        mockMvc.perform(get("/course/cau-truc-du-lieu-seo").param("folder", "2026"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("<head><head"))))
                .andExpect(content().string(containsString("<title>Học phần Cấu trúc Dữ liệu và Thuật Toán - Khoa Công nghệ Thông tin | ĐHKH Huế UniDocs</title>")))
                .andExpect(content().string(containsString("<meta name=\"description\" content=\"Tải tài liệu, đề thi, bài tập và hướng dẫn học tập học phần Cấu trúc Dữ liệu và Thuật Toán thuộc Khoa Công nghệ Thông tin - Trường Đại học Khoa học Huế (HUSC). Miễn phí trên UniDocs.\">")))
                .andExpect(content().string(containsString("<link rel=\"canonical\" href=\"https://unidocs-husc.pages.dev/course/cau-truc-du-lieu-seo\">")))
                .andExpect(content().string(containsString("aria-label=\"Giới thiệu ngữ cảnh học phần\"")))
                .andExpect(content().string(containsString("Trường Đại học Khoa học")))
                .andExpect(content().string(containsString("Trường Khoa học Huế")))
                .andExpect(content().string(containsString("Khoa học Huế")))
                .andExpect(content().string(containsString("ĐHKH Huế")))
                .andExpect(content().string(containsString("HUSC")))
                .andExpect(content().string(containsString("unidocs")))
                .andExpect(content().string(containsString("\"@type\":\"Course\"")));

        // 4. Verify dynamic sitemap.xml exposes public faculties & active courses while excluding pending ones
        mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/xml")))
                .andExpect(content().string(containsString("https://unidocs-husc.pages.dev/university/truong-dai-hoc-khoa-hoc-seo")))
                .andExpect(content().string(containsString("https://unidocs-husc.pages.dev/faculty/khoa-cntt-seo")))
                .andExpect(content().string(containsString("https://unidocs-husc.pages.dev/faculty/khoa-bao-chi-seo")))
                .andExpect(content().string(containsString("https://unidocs-husc.pages.dev/course/cau-truc-du-lieu-seo")))
                .andExpect(content().string(not(containsString("hoc-phan-cho-duyet-seo"))));
        // 5. Verify document view page renders LearningResource schema, canonical URL, and article og:type
        mockMvc.perform(get("/document/de-thi-cuoi-ky-ctdl-seo/view"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<link rel=\"canonical\" href=\"https://unidocs-husc.pages.dev/document/de-thi-cuoi-ky-ctdl-seo/view\">")))
                .andExpect(content().string(containsString("<meta property=\"og:type\" content=\"article\">")))
                .andExpect(content().string(containsString("\"@type\":\"LearningResource\"")));
    }
}
