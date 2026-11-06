package com.unidocs.service;

import com.unidocs.domain.Course;
import com.unidocs.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class CourseSpamCleanupService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CourseSpamCleanupService.class);

    private final CourseRepository courseRepository;

    // Exact list of 12 spam items identified from the screenshots
    private static final List<String> SPAM_COURSE_NAMES = Arrays.asList(
            "fuck",
            "fuckyou",
            "fuckingyou",
            "df",
            "fds",
            "fsdf",
            "haha",
            "hello",
            "hihi",
            "huhu",
            "ko khóa luôn à",
            "thêm là hiển thị luôn à :))",
            "thêm là hiển thị luôn à",
            "thêm là hiển thị luôn",
            "ko khoa luon a",
            "ứng", // Keep legitimate courses like "Ứng dụng...", but single "Ứ" will be caught below
            "ứ"
    );

    public CourseSpamCleanupService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            int cleaned = purgeSpamCourses();
            if (cleaned > 0) {
                log.info("[UniDocs Security] Tự động quét và dọn dẹp thành công {} học phần spam khi khởi động.", cleaned);
            }
        } catch (Exception e) {
            log.error("[UniDocs Security] Lỗi trong quá trình quét dọn học phần spam: {}", e.getMessage());
        }
    }

    @Transactional
    @CacheEvict(value = {"university", "faculty", "course"}, allEntries = true)
    public int purgeSpamCourses() {
        List<Course> allCourses = courseRepository.findAll();
        int deletedCount = 0;

        for (Course course : allCourses) {
            if (isSpamCourse(course)) {
                log.warn("[UniDocs Cleanup] Xóa bỏ học phần spam: ID={} - Tên='{}' (Khoa={})",
                        course.getId(), course.getName(), course.getFaculty() != null ? course.getFaculty().getName() : "N/A");
                courseRepository.delete(course);
                deletedCount++;
            }
        }

        return deletedCount;
    }

    public boolean isSpamCourse(Course course) {
        if (course == null || course.getName() == null) return false;
        String name = course.getName().trim().toLowerCase();
        String slug = course.getSlug() != null ? course.getSlug().toLowerCase() : "";

        // 1. Single character cut-off (e.g. "Ứ")
        if (name.length() <= 1) {
            return true;
        }

        // 2. Direct match against identified spam targets
        for (String spam : SPAM_COURSE_NAMES) {
            if (spam.equals("ứng")) continue; // Avoid matching valid words starting with "Ứng"
            if (name.equalsIgnoreCase(spam) || slug.equalsIgnoreCase(spam)) {
                return true;
            }
        }

        // 3. Match normalized versions (without accents)
        String normalized = removeAccents(name);
        if (normalized.equals("u") || normalized.equals("df") || normalized.equals("fds") || normalized.equals("fsdf")
                || normalized.equals("fuck") || normalized.equals("fuckyou") || normalized.equals("fuckingyou")
                || normalized.equals("haha") || normalized.equals("hihi") || normalized.equals("huhu") || normalized.equals("hello")
                || normalized.contains("ko khoa luon a") || normalized.contains("them la hien thi luon a")) {
            return true;
        }

        return false;
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String nfd = Normalizer.normalize(text.toLowerCase(), Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(nfd).replaceAll("").replace("đ", "d");
    }
}
