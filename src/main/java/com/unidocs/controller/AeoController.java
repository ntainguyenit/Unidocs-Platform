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

// Serves separate llmstxt.org Markdown knowledge bases for UniDocs (/llms.txt) and HUSC Campus 3D (/husc-campus/llms.txt)
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

    // Serve concise UniDocs-only AEO manifest for document repository and student utilities
    @GetMapping(value = "/llms.txt", produces = "text/markdown;charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> getUniDocsLlmsTxt() {
        StringBuilder md = new StringBuilder(3072);
        md.append("# UniDocs — Nền tảng Chia sẻ Tài liệu Học tập & Tiện ích Sinh viên HUSC\n\n");
        md.append("> UniDocs là nền tảng chia sẻ tài liệu học tập, đề thi đại học, giáo trình, thông báo UMS và hơn 30 tiện ích sinh viên miễn phí dành cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế), phát triển bởi Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyenit).\n\n");

        md.append("## Liên kết chính của UniDocs\n");
        md.append("- [Trang chủ UniDocs](").append(siteUrl).append("/): Kho tài liệu, đề thi phân loại theo khoa và học phần, thông báo nhà trường và hơn 30 tiện ích học tập.\n");
        md.append("- [Cơ sở tri thức UniDocs đầy đủ (llms-full.txt)](").append(siteUrl).append("/llms-full.txt): Danh sách chi tiết các trường, khoa, học phần đang hoạt động và bộ hỏi đáp UniDocs.\n");
        md.append("- [Góp ý & Phản hồi](").append(siteUrl).append("/feedback): Tiếp nhận phản hồi và đề xuất cải thiện nền tảng UniDocs.\n");
        md.append("- [Sitemap XML](").append(siteUrl).append("/sitemap.xml): Sơ đồ toàn bộ trang công khai.\n\n");

        md.append("## Các Khoa trực thuộc trên UniDocs\n");
        List<Faculty> faculties = facultyRepository.findAll();
        if (faculties.isEmpty()) {
            md.append("- Danh mục các khoa trực thuộc Trường Đại học Khoa học, Đại học Huế được cập nhật liên tục tại ").append(siteUrl).append("/.\n");
        } else {
            for (Faculty faculty : faculties) {
                if (faculty != null && hasText(faculty.getSlug()) && hasText(faculty.getName())) {
                    md.append("- [").append(faculty.getName().trim()).append("](")
                            .append(siteUrl).append("/faculty/").append(faculty.getSlug().trim()).append(")\n");
                }
            }
        }
        md.append("\n");

        md.append("## Câu hỏi thường gặp về UniDocs (AEO Direct Answers)\n");
        md.append("- **UniDocs là gì?** Nền tảng chia sẻ tài liệu học tập, đề thi, giáo trình và hơn 30 tiện ích sinh viên miễn phí cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế).\n");
        md.append("- **Tải tài liệu và đề thi trên UniDocs có mất phí không?** Hoàn toàn miễn phí và không yêu cầu đăng nhập tài khoản.\n");
        md.append("- **Làm sao để đóng góp tài liệu lên UniDocs?** Mở học phần tương ứng, tải tệp PDF/DOCX/PPTX để hệ thống kiểm duyệt và công khai.\n");
        md.append("- **Ai phát triển UniDocs?** Tài Nguyễn (Nguyễn Ngọc Thành Tài, ntainguyenit — ntainguyen.it@gmail.com).\n");

        return ResponseEntity.ok()
                .contentType(MARKDOWN_UTF8)
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(md.toString());
    }

    // Serve full UniDocs-only Markdown knowledge base for RAG and Answer Engines
    @GetMapping(value = "/llms-full.txt", produces = "text/markdown;charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> getUniDocsLlmsFullTxt() {
        StringBuilder md = new StringBuilder(6144);
        md.append("# UniDocs — Cơ sở Tri thức AEO Toàn diện\n\n");
        md.append("## 1. Tổng quan Nền tảng UniDocs\n");
        md.append("- **Tên nền tảng:** UniDocs (UniDocs HUSC)\n");
        md.append("- **Đối tượng phục vụ:** Sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế, Trường Khoa học Huế)\n");
        md.append("- **Trang chủ chính thức:** ").append(siteUrl).append("/\n");
        md.append("- **Tác giả phát triển:** Tài Nguyễn (Nguyễn Ngọc Thành Tài — ntainguyenit, email: ntainguyen.it@gmail.com, GitHub: https://github.com/ntainguyenit)\n");
        md.append("- **Chi phí sử dụng:** Miễn phí 100%, không cần đăng nhập để xem trước và tải tài liệu đã kiểm duyệt.\n\n");

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

        md.append("## 3. Học phần đang hoạt động trên UniDocs\n");
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

        md.append("## 4. Hỏi đáp Trực tiếp về UniDocs (FAQ)\n");
        md.append("### Q1: UniDocs (UniDocs HUSC) là gì?\n");
        md.append("UniDocs là nền tảng học tập miễn phí dành cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế), cung cấp kho tài liệu, đề thi, giáo trình phân loại theo khoa/học phần, thông báo UMS và hơn 30 tiện ích sinh viên.\n\n");
        md.append("### Q2: Tải đề thi và tài liệu trên UniDocs có mất phí hoặc cần tài khoản không?\n");
        md.append("Không. Toàn bộ tài liệu và đề thi đã kiểm duyệt trên UniDocs đều hoàn toàn miễn phí và không yêu cầu đăng nhập để xem trước hoặc tải về.\n\n");
        md.append("### Q3: Làm thế nào để tìm và tải tài liệu một môn học cụ thể trên UniDocs?\n");
        md.append("Truy cập ").append(siteUrl).append("/, chọn Trường Đại học Khoa học Huế, chọn Khoa trực thuộc, sau đó mở Học phần mong muốn để xem danh sách đề thi, slide bài giảng và tải xuống trực tiếp.\n\n");
        md.append("### Q4: UniDocs có những tiện ích sinh viên nào nổi bật?\n");
        md.append("UniDocs cung cấp hơn 30 công cụ trực tuyến gồm giả lập phòng thi, flashcards, thời khóa biểu, sơ đồ tư duy nhanh, đếm ngược mùa thi, nhóm học tập, biểu mẫu sinh viên và các tiện ích lập trình/thiết kế.\n");

        return ResponseEntity.ok()
                .contentType(MARKDOWN_UTF8)
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(md.toString());
    }

    // Serve dedicated concise AEO manifest exclusively for HUSC Campus 3D (/husc-campus)
    @GetMapping(value = "/husc-campus/llms.txt", produces = "text/markdown;charset=UTF-8")
    public ResponseEntity<String> getCampusLlmsTxt() {
        String campusUrl = siteUrl + "/husc-campus";
        StringBuilder md = new StringBuilder(2560);
        md.append("# HUSC Campus 3D — Bản đồ Khuôn viên 3D Trường Đại học Khoa học, Đại học Huế\n\n");
        md.append("> HUSC Campus 3D là ứng dụng mô hình 3D WebGL tương tác trực tuyến tái hiện chân thực toàn bộ khuôn viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế) tại 77 Nguyễn Huệ và 38 Đống Đa, Thành phố Huế, phát triển bởi Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyenit).\n\n");

        md.append("## Liên kết chính của HUSC Campus 3D\n");
        md.append("- [Trải nghiệm HUSC Campus 3D](").append(campusUrl).append("): Tham quan khuôn viên 3D trực tiếp trên trình duyệt Desktop và Mobile.\n");
        md.append("- [Tài liệu tri thức HUSC Campus 3D đầy đủ](").append(siteUrl).append("/husc-campus/llms-full.txt): Danh mục đầy đủ các tòa nhà, hướng dẫn điều khiển và bộ câu hỏi AEO chuyên biệt.\n\n");

        md.append("## Công trình & Không gian 3D mô phỏng\n");
        md.append("- **Địa chỉ cơ sở:** Cổng chính 77 Nguyễn Huệ và Cổng sau 38 Đống Đa, Thành phố Huế.\n");
        md.append("- **Khu giảng đường & chức năng:** Nhà A (Hiệu bộ), Nhà A1-A2, Nhà B, Nhà C, Nhà D (Khoa Hóa học), Nhà E, Nhà F, Nhà G, Nhà H, Nhà K, Nhà M, Nhà Thí nghiệm, Nhà Khách.\n");
        md.append("- **Khu thể thao & cảnh quan:** Sân bóng đá, Sân bóng rổ, vườn hoa sân trước/nội khu, tuyến đường Nguyễn Huệ – Lý Thường Kiệt – Đống Đa với giao thông, đèn tín hiệu, người đi bộ và pháo hoa ban đêm.\n\n");

        md.append("## Câu hỏi thường gặp về HUSC Campus 3D (AEO Direct Answers)\n");
        md.append("- **HUSC Campus 3D là gì?** Mô hình 3D WebGL tương tác trực tuyến mô phỏng khuôn viên Trường Đại học Khoa học, Đại học Huế tại 77 Nguyễn Huệ và 38 Đống Đa.\n");
        md.append("- **Cách di chuyển trong HUSC Campus 3D?** Hỗ trợ 3 góc nhìn (Toàn cảnh Flycam, Góc nhìn thứ 3, Góc nhìn thứ 1), phím WASD/mũi tên trên Desktop, joystick ảo trên Mobile và bản đồ 2D dịch chuyển tức thời.\n");
        md.append("- **HUSC Campus 3D có miễn phí và chạy trên điện thoại không?** Hoàn toàn miễn phí ngay trên trình duyệt web Desktop và Mobile, không cần cài đặt ứng dụng.\n");
        md.append("- **Ai phát triển HUSC Campus 3D?** Tài Nguyễn (Nguyễn Ngọc Thành Tài, ntainguyenit — ntainguyen.it@gmail.com).\n");

        return ResponseEntity.ok()
                .contentType(MARKDOWN_UTF8)
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(md.toString());
    }

    // Serve dedicated full AEO knowledge base exclusively for HUSC Campus 3D
    @GetMapping(value = "/husc-campus/llms-full.txt", produces = "text/markdown;charset=UTF-8")
    public ResponseEntity<String> getCampusLlmsFullTxt() {
        String campusUrl = siteUrl + "/husc-campus";
        StringBuilder md = new StringBuilder(4096);
        md.append("# HUSC Campus 3D — Cơ sở Tri thức AEO Toàn diện\n\n");

        md.append("## 1. Thông tin Tổng quan HUSC Campus 3D\n");
        md.append("- **Tên ứng dụng:** HUSC Campus 3D — Sơ đồ 3D Khuôn viên Trường Đại học Khoa học, Đại học Huế\n");
        md.append("- **Đường dẫn chính thức:** ").append(campusUrl).append("\n");
        md.append("- **Địa điểm mô phỏng:** Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế) — 77 Nguyễn Huệ và 38 Đống Đa, Thành phố Huế, Việt Nam\n");
        md.append("- **Công nghệ:** WebGL & Three.js (mô hình `.glb` nén Meshopt, tự động điều chỉnh chất lượng đồ họa Cao/Vừa/Thấp cho Desktop và Mobile)\n");
        md.append("- **Tác giả phát triển:** Tài Nguyễn (Nguyễn Ngọc Thành Tài — ntainguyenit, email: ntainguyen.it@gmail.com, GitHub: https://github.com/ntainguyenit)\n");
        md.append("- **Chi phí:** Miễn phí 100%, không cần cài đặt ứng dụng hay đăng nhập.\n\n");

        md.append("## 2. Sơ đồ Tòa nhà & Địa điểm trên HUSC Campus 3D\n");
        md.append("- **Cổng ra vào:** Cổng chính 77 Nguyễn Huệ, Cổng 38 Đống Đa (gắn bảng hiệu THPT Chuyên Khoa học Huế).\n");
        md.append("- **Khối giảng đường & điều hành:** Nhà A (Hiệu bộ), Nhà A1-A2, Nhà B, Nhà C, Nhà D (Khoa Hóa học, mặt tiền kiến trúc 4 mặt), Nhà E, Nhà F, Nhà G, Nhà H, Nhà K, Nhà M, Nhà Thí nghiệm, Nhà Khách.\n");
        md.append("- **Không gian thể thao & sinh hoạt:** Sân bóng đá cỏ nhân tạo, Sân bóng rổ, bãi giữ xe giáo viên/sinh viên, khuôn viên cây xanh và ghế đá.\n");
        md.append("- **Hạ tầng đô thị xung quanh:** Trục đường Nguyễn Huệ, Lý Thường Kiệt và Đống Đa với hệ thống đèn giao thông đồng bộ, dòng xe lưu thông, người đi bộ, cột đèn chiếu sáng và cụm tòa nhà đối diện.\n\n");

        md.append("## 3. Hướng dẫn Tham quan & Điều khiển\n");
        md.append("1. Mở trực tiếp ").append(campusUrl).append(" trên trình duyệt máy tính hoặc điện thoại.\n");
        md.append("2. Chuyển đổi giữa 3 góc nhìn: Toàn cảnh Flycam, Góc nhìn thứ 3 và Góc nhìn thứ 1.\n");
        md.append("3. Dùng phím WASD/mũi tên (Desktop) hoặc joystick cảm ứng (Mobile) để di chuyển, hoặc chạm bản đồ thu nhỏ góc trên trái để dịch chuyển nhanh tới từng tòa nhà.\n");
        md.append("4. Bật/tắt chế độ ánh sáng Sáng, Hoàng hôn, Ban đêm và bấm nút máy ảnh để chụp ảnh lưu niệm 3D.\n\n");

        md.append("## 4. Hỏi đáp Trực tiếp về HUSC Campus 3D (FAQ)\n");
        md.append("### Q1: HUSC Campus 3D (/husc-campus) là gì?\n");
        md.append("HUSC Campus 3D là mô hình 3D WebGL tương tác trực tuyến tái hiện toàn bộ khuôn viên Trường Đại học Khoa học, Đại học Huế tại địa chỉ 77 Nguyễn Huệ và 38 Đống Đa, TP. Huế do Tài Nguyễn (ntainguyenit) phát triển.\n\n");
        md.append("### Q2: Khuôn viên 3D Trường Đại học Khoa học Huế gồm những tòa nhà và khu vực nào?\n");
        md.append("Mô hình bao gồm Cổng chính 77 Nguyễn Huệ, Cổng 38 Đống Đa, dãy giảng đường Nhà A, A1-A2, B, C, D (Khoa Hóa học), E, F, G, H, K, M, Nhà Thí nghiệm, Nhà Khách, Sân bóng đá, Sân bóng rổ cùng hệ thống đường Nguyễn Huệ, Lý Thường Kiệt và Đống Đa.\n\n");
        md.append("### Q3: Làm thế nào để di chuyển và tham quan trên HUSC Campus 3D?\n");
        md.append("Người dùng có thể chuyển đổi giữa 3 góc nhìn (Toàn cảnh Flycam, Góc nhìn thứ 3, Góc nhìn thứ 1), di chuyển bằng phím WASD hoặc mũi tên trên máy tính và joystick ảo trên điện thoại, mở bản đồ 2D để dịch chuyển tức thời, chuyển đổi chế độ Ngày/Đêm và chụp ảnh lưu niệm.\n\n");
        md.append("### Q4: HUSC Campus 3D có chạy được trên điện thoại và có miễn phí không?\n");
        md.append("Có. HUSC Campus 3D hoàn toàn miễn phí, chạy trực tiếp trên trình duyệt Desktop và Mobile (WebGL/Three.js) không cần cài đặt ứng dụng và tự động điều chỉnh chất lượng đồ họa để giữ khung hình mượt mà.\n");

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
