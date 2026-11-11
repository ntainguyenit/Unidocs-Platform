package com.unidocs.controller;

import com.unidocs.domain.Course;
import com.unidocs.domain.Faculty;
import com.unidocs.domain.University;
import com.unidocs.dto.response.SeoMetadataDto;
import org.junit.jupiter.api.Test;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Single-line English comment: Unit tests for HomeController view routing and model attributes
class HomeControllerTest {

    @Test
    void maintenance_ReturnsMaintenanceView() {
        HomeController controller = new HomeController(
            mock(com.unidocs.repository.UniversityRepository.class),
            mock(com.unidocs.repository.FacultyRepository.class),
            mock(com.unidocs.repository.CourseRepository.class),
            mock(com.unidocs.repository.DocumentRepository.class),
            mock(com.unidocs.service.DocumentService.class),
            mock(com.unidocs.service.NotificationService.class)
        );

        String view = controller.maintenance();
        assertEquals("maintenance", view);
    }

    @Test
    void index_DoesNotExposePublicFeedbackListInModel() {
        // Single-line English comment: Mock homepage dependencies
        com.unidocs.repository.UniversityRepository uniRepo = mock(com.unidocs.repository.UniversityRepository.class);
        com.unidocs.service.NotificationService notificationService = mock(com.unidocs.service.NotificationService.class);
        when(uniRepo.findAll()).thenReturn(Collections.emptyList());
        when(notificationService.getRecentNotifications()).thenReturn(Collections.emptyList());

        HomeController controller = new HomeController(
            uniRepo,
            mock(com.unidocs.repository.FacultyRepository.class),
            mock(com.unidocs.repository.CourseRepository.class),
            mock(com.unidocs.repository.DocumentRepository.class),
            mock(com.unidocs.service.DocumentService.class),
            notificationService
        );

        // Verify homepage renders without public feedbacks attribute while exposing SEO metadata
        Model model = new ConcurrentModel();
        String view = controller.index(model);
        assertEquals("index", view);
        assertFalse(model.containsAttribute("feedbacks"));
        assertTrue(model.getAttribute("seo") instanceof SeoMetadataDto);
    }

    @Test
    void universityDetail_PopulatesDynamicSeoAndContextualIntro() {
        com.unidocs.repository.UniversityRepository uniRepo = mock(com.unidocs.repository.UniversityRepository.class);
        com.unidocs.repository.CourseRepository courseRepo = mock(com.unidocs.repository.CourseRepository.class);
        com.unidocs.repository.DocumentRepository docRepo = mock(com.unidocs.repository.DocumentRepository.class);

        Faculty itFaculty = Faculty.builder().id(10L).name("Khoa Công nghệ Thông tin").slug("khoa-cntt").build();
        University uni = University.builder()
                .id(1L)
                .name("Trường đại học Khoa học")
                .slug("truong-dai-hoc-khoa-hoc")
                .faculties(List.of(itFaculty))
                .build();
        when(uniRepo.findBySlug("truong-dai-hoc-khoa-hoc")).thenReturn(Optional.of(uni));
        when(docRepo.sumViewsByUniversity(1L)).thenReturn(120L);
        when(docRepo.sumDownloadsByUniversity(1L)).thenReturn(45L);
        when(courseRepo.countActiveCoursesGroupedByFaculty()).thenReturn(Collections.emptyList());

        HomeController controller = new HomeController(
                uniRepo,
                mock(com.unidocs.repository.FacultyRepository.class),
                courseRepo,
                docRepo,
                mock(com.unidocs.service.DocumentService.class),
                mock(com.unidocs.service.NotificationService.class)
        );

        Model model = new ConcurrentModel();
        String view = controller.universityDetail("truong-dai-hoc-khoa-hoc", model);
        assertEquals("university", view);

        SeoMetadataDto seo = (SeoMetadataDto) model.getAttribute("seo");
        assertNotNull(seo);
        assertTrue(seo.getTitle().contains("Trường đại học Khoa học"));
        assertTrue(seo.getDescription().contains("ĐHKH Huế"));
        assertTrue(seo.getJsonLd().contains("CollectionPage"));
        assertTrue(seo.getJsonLd().contains("EducationalOrganization"));
    }

    @Test
    void facultyDetail_PopulatesExactFacultySeoMetadataAndSchema() {
        com.unidocs.repository.FacultyRepository facultyRepo = mock(com.unidocs.repository.FacultyRepository.class);

        University uni = University.builder()
                .id(1L)
                .name("Trường đại học Khoa học")
                .slug("truong-dai-hoc-khoa-hoc")
                .faculties(Collections.emptyList())
                .build();
        Course c1 = Course.builder().id(100L).name("Cấu trúc Dữ liệu và Thuật Toán").slug("ctdl").status("active").build();
        Faculty faculty = Faculty.builder()
                .id(10L)
                .name("Khoa Công nghệ Thông tin")
                .slug("khoa-cntt")
                .university(uni)
                .courses(List.of(c1))
                .build();
        uni.setFaculties(List.of(faculty));

        when(facultyRepo.findBySlug("khoa-cntt")).thenReturn(Optional.of(faculty));

        HomeController controller = new HomeController(
                mock(com.unidocs.repository.UniversityRepository.class),
                facultyRepo,
                mock(com.unidocs.repository.CourseRepository.class),
                mock(com.unidocs.repository.DocumentRepository.class),
                mock(com.unidocs.service.DocumentService.class),
                mock(com.unidocs.service.NotificationService.class)
        );

        Model model = new ConcurrentModel();
        String view = controller.facultyDetail("khoa-cntt", model);
        assertEquals("faculty", view);

        SeoMetadataDto seo = (SeoMetadataDto) model.getAttribute("seo");
        assertNotNull(seo);
        assertEquals("Khoa Công nghệ Thông tin - Trường Đại học Khoa học Huế | HUSC UniDocs", seo.getTitle());
        assertEquals(
                "Tổng hợp tài liệu, đề thi, giáo trình chính thống của Khoa Công nghệ Thông tin tại Trường Khoa học Huế (ĐHKH Huế, HUSC). Chia sẻ học tập miễn phí trên UniDocs.",
                seo.getDescription()
        );
        assertTrue(seo.getJsonLd().contains("CollectionPage"));
        assertTrue(seo.getJsonLd().contains("EducationalOrganization"));
    }

    @Test
    void courseDetail_PopulatesExactCourseSeoAndGeoContextualIntro() {
        com.unidocs.repository.CourseRepository courseRepo = mock(com.unidocs.repository.CourseRepository.class);
        com.unidocs.service.DocumentService documentService = mock(com.unidocs.service.DocumentService.class);

        University uni = University.builder()
                .id(1L)
                .name("Trường đại học Khoa học")
                .slug("truong-dai-hoc-khoa-hoc")
                .build();
        Faculty faculty = Faculty.builder()
                .id(10L)
                .name("Khoa Lý luận chính trị")
                .slug("khoa-ly-luan-chinh-tri")
                .university(uni)
                .build();
        Course course = Course.builder()
                .id(200L)
                .name("Luật Hành Chính")
                .slug("luat-hanh-chinh")
                .faculty(faculty)
                .status("active")
                .build();
        faculty.setCourses(List.of(course));

        when(courseRepo.findBySlug("luat-hanh-chinh")).thenReturn(Optional.of(course));
        when(documentService.getApprovedDocumentsByCourse(200L)).thenReturn(Collections.emptyList());
        when(documentService.getTrendingDocumentsForCourse(200L, 4)).thenReturn(Collections.emptyList());

        HomeController controller = new HomeController(
                mock(com.unidocs.repository.UniversityRepository.class),
                mock(com.unidocs.repository.FacultyRepository.class),
                courseRepo,
                mock(com.unidocs.repository.DocumentRepository.class),
                documentService,
                mock(com.unidocs.service.NotificationService.class)
        );

        Model model = new ConcurrentModel();
        String view = controller.courseDetail("luat-hanh-chinh", null, model);
        assertEquals("course", view);

        SeoMetadataDto seo = (SeoMetadataDto) model.getAttribute("seo");
        assertNotNull(seo);
        assertEquals("Học phần Luật Hành Chính - Khoa Lý luận chính trị | ĐHKH Huế UniDocs", seo.getTitle());
        assertEquals(
                "Tải tài liệu, đề thi, bài tập và hướng dẫn học tập học phần Luật Hành Chính thuộc Khoa Lý luận chính trị - Trường Đại học Khoa học Huế (HUSC). Miễn phí trên UniDocs.",
                seo.getDescription()
        );
        assertTrue(seo.getContextualIntro().contains("ĐHKH Huế"));
        assertTrue(seo.getContextualIntro().contains("HUSC"));
        assertTrue(seo.getContextualIntro().contains("Khoa học Huế"));
        assertTrue(seo.getJsonLd().contains("\"@type\":\"Course\""));
    }

    @Test
    void huscCampus_PopulatesCampusSeoAndGeoMetadata() {
        HomeController controller = new HomeController(
                mock(com.unidocs.repository.UniversityRepository.class),
                mock(com.unidocs.repository.FacultyRepository.class),
                mock(com.unidocs.repository.CourseRepository.class),
                mock(com.unidocs.repository.DocumentRepository.class),
                mock(com.unidocs.service.DocumentService.class),
                mock(com.unidocs.service.NotificationService.class)
        );

        Model model = new ConcurrentModel();
        String view = controller.huscCampus(model);
        assertEquals("husc-campus", view);

        SeoMetadataDto seo = (SeoMetadataDto) model.getAttribute("seo");
        assertNotNull(seo);
        assertTrue(seo.getTitle().contains("Trường Đại học Khoa học Huế"));
        assertTrue(seo.getTitle().contains("HUSC"));
        assertEquals("Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyen.it@gmail.com)", seo.getAuthor());
        assertTrue(seo.getJsonLd().contains("\"@type\":\"InteractiveModel\""));
        assertTrue(seo.getJsonLd().contains("\"@type\":\"CollegeOrUniversity\""));
    }
}
