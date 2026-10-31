[English Below]

# UniDocs - Nền tảng chia sẻ tài liệu học thuật
### Giới thiệu
UniDocs là một nền tảng mã nguồn mở được phát triển nhằm mục đích chia sẻ và lưu trữ các tài liệu học tập, đề thi và giáo trình dành cho sinh viên đại học. Dự án cung cấp một hệ thống quản lý tài liệu tập trung, cho phép người dùng dễ dàng tìm kiếm, xem trực tuyến và tải xuống các tài liệu học thuật một cách nhanh chóng.

### Tính năng chính
- Quản lý tài nguyên học thuật: Phân loại tài liệu theo trường đại học, khoa và học phần.
- Xem trước tài liệu trực tuyến: Hỗ trợ hiển thị trực tiếp các tệp PDF và hình ảnh trên trình duyệt mà không cần tải xuống.
- Tự động tạo ảnh thu nhỏ (Thumbnail): Hệ thống tự động trích xuất trang đầu tiên của tệp PDF để tối ưu hóa hiệu suất hiển thị.
- Nhập liệu hàng loạt (Bulk Import): Hỗ trợ quản trị viên nhập hàng loạt tài liệu thông qua tệp nén ZIP, tự động nhận diện và phân loại cấu trúc.
- Quản lý bộ nhớ đám mây: Tích hợp với dịch vụ lưu trữ Supabase S3 để đảm bảo khả năng mở rộng và bảo mật dữ liệu.
- Quản trị viên và kiểm duyệt: Cung cấp bảng điều khiển để xét duyệt tài liệu, theo dõi hoạt động và xử lý báo cáo từ người dùng.

### Công nghệ sử dụng
- Ngôn ngữ lập trình: Java 21
- Khung ứng dụng (Framework): Spring Boot 3
- Cơ sở dữ liệu: PostgreSQL
- Giao diện người dùng: Thymeleaf, Tailwind CSS
- Lưu trữ tệp tin: Supabase (S3 Compatible Storage)
- Xử lý tài liệu: Apache PDFBox

---

# UniDocs - Academic Document Sharing Platform
### Introduction
UniDocs is an open-source platform developed for sharing and archiving academic documents, past examinations, and course materials for university students. The project provides a centralized document management system, allowing users to easily search, view online, and download academic resources efficiently.

### Core Features
- Academic Resource Management: Categorizes documents by university, faculty, and course.
- Inline Document Viewer: Supports direct rendering of PDF files and images in the browser without requiring a download.
- Automated Thumbnail Generation: The system automatically extracts the first page of PDF files to optimize display performance.
- Bulk Import: Enables administrators to batch import documents via ZIP archives, with automated recognition and structural categorization.
- Cloud Storage Management: Integrated with Supabase S3 storage to ensure data scalability and security.
- Administration and Moderation: Provides a dashboard for document approval, activity tracking, and handling user reports.

### Technologies Used
- Programming Language: Java 21
- Application Framework: Spring Boot 3
- Database: PostgreSQL
- User Interface: Thymeleaf, Tailwind CSS
- File Storage: Supabase (S3 Compatible Storage)
- Document Processing: Apache PDFBox
