package com.unidocs.service;

import com.unidocs.domain.Course;
import com.unidocs.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CourseSpamCleanupServiceTest {

    private CourseRepository courseRepository;
    private CourseSpamCleanupService cleanupService;

    @BeforeEach
    void setUp() {
        courseRepository = mock(CourseRepository.class);
        cleanupService = new CourseSpamCleanupService(courseRepository);
    }

    @Test
    void isSpamCourse_DetectsAllSpamTargetsFromRequest() {
        List<String> spamNames = List.of(
            "Fuck",
            "Fuckyou",
            "Fuckingyou",
            "Df",
            "Fds",
            "Fsdf",
            "Haha",
            "Hello",
            "Hihi",
            "Huhu",
            "Ko Khóa Luôn À",
            "Thêm Là Hiển Thị Luôn À :))",
            "Ứ"
        );

        for (String name : spamNames) {
            Course c = Course.builder().name(name).slug(name.toLowerCase().replace(" ", "-")).build();
            assertTrue(cleanupService.isSpamCourse(c), "Failed to detect spam course: " + name);
        }
    }

    @Test
    void isSpamCourse_PreservesLegitimateCourses() {
        List<String> legitNames = List.of(
            "Báo In",
            "Các Hệ Quản Trị CSDL",
            "Cấu Trúc Dữ Liệu và Thuật Toán",
            "Công Nghệ Phần Mềm",
            "Đồ Họa Máy Tính",
            "Font End",
            "Hệ CSDL Phân Tán",
            "Java Cơ Bản",
            "Lịch Sử Báo Chí Việt Nam",
            "Phương Thức Kể Trong Sản Phẩm Truyền Thông",
            "Quản Trị Truyền Thông Trong Khủng Hoảng",
            "Ứng Dụng Web Nâng Cao"
        );

        for (String name : legitNames) {
            Course c = Course.builder().name(name).slug(name.toLowerCase().replace(" ", "-")).build();
            assertFalse(cleanupService.isSpamCourse(c), "Wrongly flagged legitimate course as spam: " + name);
        }
    }

    @Test
    void purgeSpamCourses_DeletesOnlySpamRecords() {
        Course spam1 = Course.builder().id(1L).name("Fuck").slug("fuck").build();
        Course spam2 = Course.builder().id(2L).name("Ko Khóa Luôn À").slug("ko-khoa-luon-a").build();
        Course legit = Course.builder().id(3L).name("Báo In").slug("bao-in").build();

        when(courseRepository.findAll()).thenReturn(List.of(spam1, spam2, legit));

        int deleted = cleanupService.purgeSpamCourses();

        assertEquals(2, deleted);
        verify(courseRepository).delete(spam1);
        verify(courseRepository).delete(spam2);
        verify(courseRepository, never()).delete(legit);
    }
}
