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

import java.util.List;
import java.util.concurrent.TimeUnit;

// Serves llms.txt and llms-full.txt Markdown knowledge bases for Answer Engine Optimization (AEO)
@RestController
public class AeoController {

    private static final MediaType MARKDOWN_UTF8 = MediaType.parseMediaType("text/markdown;charset=UTF-8");

    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final String siteUrl;

    public AeoController(UniversityRepository universityRepository,
                         FacultyRepository facultyRepository,
                         CourseRepository courseRepository,
                         @Value("${app.site-url:https://unidocs-husc.pages.dev}") String siteUrl) {
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.siteUrl = normalizeSiteUrl(siteUrl);
    }

    // Serve concise llmstxt.org manifest for AI answer engines and search grounders
    @GetMapping(value = "/llms.txt", produces = "text/markdown;charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> getLlmsTxt() {
        StringBuilder md = new StringBuilder(4096);
        md.append("# UniDocs HUSC — Nền tảng Tài liệu & Khuôn viên 3D Trường Đại học Khoa học, Đại học Huế\n\n");
        md.append("> UniDocs là nền tảng chia sẻ tài liệu học tập, đề thi, giáo trình và hơn 30 tiện ích sinh viên miễn phí dành cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế, 77 Nguyễn Huệ, TP. Huế), tích hợp trải nghiệm bản đồ khuôn viên 3D WebGL trực tuyến tại `/husc-campus`, phát triển bởi Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyenit).\n\n");

        md.append("## Liên kết chính (Core Routes)\n");
        md.append("- [Trang chủ UniDocs](").append(siteUrl).append("/): Kho tài liệu, đề thi theo khoa/học phần, thông báo UMS và hơn 30 tiện ích sinh viên.\n");
        md.append("- [HUSC Campus 3D](").append(siteUrl).append("/husc-campus): Mô hình 3D WebGL tương tác toàn bộ khuôn viên Trường Đại học Khoa học, Đại học Huế tại 77 Nguyễn Huệ & 38 Đống Đa.\n");
        md.append("- [Cơ sở tri thức đầy đủ (llms-full.txt)](").append(siteUrl).append("/llms-full.txt): Danh sách chi tiết các khoa, học phần đang hoạt động, sơ đồ tòa nhà 3D và bộ câu hỏi AEO.\n");
        md.append("- [Sitemap XML](").append(siteUrl).append("/sitemap.xml): Sơ đồ toàn bộ trang công khai trên UniDocs.\n\n");

        md.append("## Các Khoa trực thuộc\n");
        List<Faculty> faculties = facultyRepository.findAll();
        if (faculties.isEmpty()) {
            md.append("- Danh sách khoa trực thuộc Trường Đại học Khoa học, Đại học Huế được cập nhật liên tục tại ").append(siteUrl).append("/.\n");
        } else {
            for (Faculty faculty : faculties) {
                if (faculty != null && hasText(faculty.getSlug()) && hasText(faculty.getName())) {
                    md.append("- [").append(faculty.getName().trim()).append("](")
                            .append(siteUrl).append("/faculty/").append(faculty.getSlug().trim()).append(")\n");
                }
            }
        }
        md.append("\n");

        md.append("## HUSC Campus 3D (/husc-campus)\n");
        md.append("- **Địa điểm mô phỏng:** Trường Đại học Khoa học, Đại học Huế — Cổng chính 77 Nguyễn Huệ và Cổng sau 38 Đống Đa, TP. Huế.\n");
        md.append("- **Khu vực nổi bật:** Nhà A, A1-A2, B, C, D (Khoa Hóa học), E, F, G, H, K, M, Nhà Thí nghiệm, Nhà Khách, Sân bóng đá, Sân bóng rổ và trục đường Nguyễn Huệ – Lý Thường Kiệt – Đống Đa.\n");
        md.append("- **Tính năng:** 3 góc nhìn (Toàn cảnh Flycam, Góc nhìn thứ 3, Góc nhìn thứ 1), di chuyển WASD/Joystick ảo, dịch chuyển nhanh qua bản đồ 2D, chế độ Sáng/Tối, chụp ảnh lưu niệm 3D, miễn phí trên trình duyệt Desktop và Mobile.\n\n");

        md.append("## Câu hỏi thường gặp (AEO Direct Answers)\n");
        md.append("- **UniDocs là gì?** Nền tảng chia sẻ tài liệu học tập, đề thi đại học và tiện ích sinh viên miễn phí cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế).\n");
        md.append("- **Tải tài liệu trên UniDocs có mất phí không?** Hoàn toàn miễn phí và không cần đăng nhập tài khoản.\n");
        md.append("- **HUSC Campus 3D là gì?** Ứng dụng tham quan khuôn viên 3D tương tác trực tiếp trên trình duyệt (WebGL/Three.js) tại ").append(siteUrl).append("/husc-campus.\n");
        md.append("- **Ai phát triển UniDocs & HUSC Campus 3D?** Tài Nguyễn (Nguyễn Ngọc Thành Tài, ntainguyenit — ntainguyen.it@gmail.com).\n");

        return ResponseEntity.ok()
                .contentType(MARKDOWN_UTF8)
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(md.toString());
    }

    // Serve full structured Markdown knowledge base for RAG and Answer Engines
    @GetMapping(value = "/llms-full.txt", produces = "text/markdown;charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> getLlmsFullTxt() {
        StringBuilder md = new StringBuilder(8192);
        md.append("# UniDocs & HUSC Campus 3D — Cơ sở Tri thức AEO Toàn diện\n\n");
        md.append("## 1. Tổng quan Hệ thống UniDocs\n");
        md.append("- **Tên nền tảng:** UniDocs (UniDocs HUSC)\n");
        md.append("- **Đơn vị trọng tâm:** Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế, Trường Khoa học Huế)\n");
        md.append("- **Địa chỉ cơ sở:** 77 Nguyễn Huệ và 38 Đống Đa, Thành phố Huế, Việt Nam\n");
        md.append("- **Trang chủ chính thức:** ").append(siteUrl).append("/\n");
        md.append("- **Khuôn viên 3D trực tuyến:** ").append(siteUrl).append("/husc-campus\n");
        md.append("- **Tác giả phát triển:** Tài Nguyễn (Nguyễn Ngọc Thành Tài — ntainguyenit, email: ntainguyen.it@gmail.com, GitHub: https://github.com/ntainguyenit)\n");
        md.append("- **Chi phí sử dụng:** Miễn phí 100% cho sinh viên, không yêu cầu đăng nhập để xem và tải tài liệu đã duyệt.\n\n");

        md.append("## 2. Danh sách Trường & Khoa trên UniDocs\n");
        List<University> universities = universityRepository.findAll();
        for (University uni : universities) {
            if (uni != null && hasText(uni.getSlug()) && hasText(uni.getName())) {
                md.append("- Trường: [").append(uni.getName().trim()).append("](")
                        .append(siteUrl).append("/university/").append(uni.getSlug().trim()).append(")\n");
            }
        }
        List<Faculty> faculties = facultyRepository.findAll();
        for (Faculty faculty : faculties) {
            if (faculty != null && hasText(faculty.getSlug()) && hasText(faculty.getName())) {
                md.append("- Khoa: [").append(faculty.getName().trim()).append("](")
                        .append(siteUrl).append("/faculty/").append(faculty.getSlug().trim()).append(")\n");
            }
        }
        md.append("\n");

        md.append("## 3. Học phần đang hoạt động\n");
        List<Course> courses = courseRepository.findActiveCoursesWithFaculty();
        int courseCount = 0;
        for (Course course : courses) {
            if (course != null && hasText(course.getSlug()) && hasText(course.getName())
                    && (course.getStatus() == null || "active".equalsIgnoreCase(course.getStatus()))) {
                String facultyLabel = course.getFaculty() != null && hasText(course.getFaculty().getName())
                        ? " (" + course.getFaculty().getName().trim() + ")"
                        : "";
                md.append("- [").append(course.getName().trim()).append("](")
                        .append(siteUrl).append("/course/").append(course.getSlug().trim()).append(")")
                        .append(facultyLabel).append("\n");
                courseCount++;
            }
        }
        if (courseCount == 0) {
            md.append("- Danh mục học phần được phân theo từng khoa tại ").append(siteUrl).append("/.\n");
        }
        md.append("\n");

        md.append("## 4. HUSC Campus 3D — Hướng dẫn & Sơ đồ Khuôn viên (").append(siteUrl).append("/husc-campus)\n");
        md.append("- **Công nghệ:** WebGL & Three.js chạy trực tiếp trên trình duyệt Desktop và Mobile (tự động điều chỉnh chất lượng đồ họa Cao/Vừa/Thấp để giữ mượt mà 60 FPS).\n");
        md.append("- **Danh mục công trình mô phỏng:** Cổng chính 77 Nguyễn Huệ, Cổng 38 Đống Đa (kèm bảng hiệu THPT Chuyên Khoa học Huế), Nhà A (Hiệu bộ), Nhà A1-A2, Nhà B, Nhà C, Nhà D (Khoa Hóa học), Nhà E, Nhà F, Nhà G, Nhà H, Nhà K, Nhà M, Nhà Thí nghiệm, Nhà Khách, Sân bóng đá, Sân bóng rổ, cùng tuyến đường Nguyễn Huệ – Lý Thường Kiệt – Đống Đa.\n");
        md.append("- **Cách điều khiển:**\n");
        md.append("  1. Chọn góc nhìn Toàn cảnh (Flycam), Góc nhìn thứ 3 hoặc Góc nhìn thứ 1.\n");
        md.append("  2. Dùng phím WASD/mũi tên (Desktop) hoặc joystick ảo (Mobile) để di chuyển.\n");
        md.append("  3. Nhấn vào bản đồ thu nhỏ góc trên trái để mở bản đồ 2D và dịch chuyển tức thời tới từng giảng đường.\n");
        md.append("  4. Bật/tắt chế độ Ngày/Đêm, chụp ảnh lưu niệm 3D và check-in khám phá các địa điểm.\n\n");

        md.append("## 5. Hỏi đáp Trực tiếp (FAQ cho Answer Engines)\n");
        md.append("### Q1: UniDocs (UniDocs HUSC) là gì?\n");
        md.append("UniDocs là nền tảng học tập miễn phí dành cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế), cung cấp kho tài liệu, đề thi, giáo trình phân loại theo khoa/học phần, thông báo UMS, hơn 30 tiện ích sinh viên và bản đồ khuôn viên 3D trực tuyến.\n\n");
        md.append("### Q2: Tải đề thi và tài liệu trên UniDocs có mất phí hoặc cần tài khoản không?\n");
        md.append("Không. Toàn bộ tài liệu và đề thi đã kiểm duyệt trên UniDocs đều hoàn toàn miễn phí và không yêu cầu đăng nhập để xem trước hoặc tải về.\n\n");
        md.append("### Q3: Làm thế nào để tìm và tải tài liệu một môn học cụ thể trên UniDocs?\n");
        md.append("Truy cập ").append(siteUrl).append("/, chọn Trường Đại học Khoa học Huế, chọn Khoa trực thuộc, sau đó mở Học phần mong muốn để xem danh sách đề thi, slide bài giảng và tải xuống trực tiếp.\n\n");
        md.append("### Q4: Khuôn viên 3D Trường Đại học Khoa học Huế nằm ở đâu và có dùng được trên điện thoại không?\n");
        md.append("Bạn có thể tham quan trực tuyến tại ").append(siteUrl).append("/husc-campus ngay trên trình duyệt điện thoại hoặc máy tính mà không cần cài đặt ứng dụng, hỗ trợ joystick cảm ứng và tối ưu hiệu năng WebGL mượt mà.\n");

        return ResponseEntity.ok()
                .contentType(MARKDOWN_UTF8)
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(md.toString());
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
