[English Below](#unidocs---academic-document-sharing-platform)

<div align="center">

# UniDocs - Nền tảng chia sẻ tài liệu học thuật
### Hệ sinh thái học tập và quản lý tài liệu dành cho sinh viên

[![CI/CD Pipeline](https://github.com/ntainguyenit/Unidocs-Platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ntainguyenit/Unidocs-Platform/actions/workflows/ci.yml)
[![Java 21](https://img.shields.io/badge/Java-21%20LTS-007396?logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase S3](https://img.shields.io/badge/Storage-Supabase%20S3-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Xem trực tiếp](https://unidocs-husc.pages.dev/)** • **[Báo lỗi](https://github.com/ntainguyenit/Unidocs-Platform/issues)** • **[Yêu cầu tính năng](https://github.com/ntainguyenit/Unidocs-Platform/issues)**

</div>

---

## Giới thiệu

**UniDocs** là nền tảng mã nguồn mở phục vụ việc lưu trữ, tìm kiếm và chia sẻ tài liệu học tập, đề thi và giáo trình dành cho sinh viên đại học. Được xây dựng trên nền tảng **Java 21 LTS** và framework **Spring Boot 3**, hệ thống đáp ứng các tiêu chuẩn bảo mật, phân quyền dữ liệu Row-Level Security (RLS), xử lý trích xuất ảnh xem trước tài liệu tự động và cung cấp bộ tiện ích học tập trực tiếp phía trình duyệt.

---

## Kiến trúc hệ thống

```text
+--------------------------------------------------------------------------+
|                     Thiết bị người dùng (Web / Mobile)                   |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                   Tầng biên & Phân phối CDN (Cloudflare)                 |
|  - Edge Caching: Lưu đệm tài nguyên tĩnh (CSS, JS) và bộ tiện ích học tập|
|  - Bảo mật: Cloudflare Turnstile chống Bot và chứng chỉ SSL/TLS          |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                 Tầng máy chủ ứng dụng (Spring Boot 3 / Docker)           |
|  - Rate Limiting: Thuật toán Token Bucket (Bucket4j) kiểm soát tần suất  |
|  - Controllers: Điều hướng MVC và các RESTful API endpoints              |
|  - Processing: Trích xuất ảnh bìa tài liệu PDF tự động (Apache PDFBox)   |
+--------------------------------------------------------------------------+
                      |                                  |
                      v                                  v
+-----------------------------------+  +-----------------------------------+
|      Cơ sở dữ liệu PostgreSQL     |  |       Supabase Object Storage     |
|  - Dữ liệu trường, khoa, học phần |  |  - Lưu trữ đám mây tương thích S3 |
|  - Bảo mật cấp dòng (Postgres RLS)|  |  - Tệp PDF giáo trình, đề thi, ảnh|
+-----------------------------------+  +-----------------------------------+
```

| Phân tầng | Thành phần | Trách nhiệm chính |
| :--- | :--- | :--- |
| **Edge & CDN** | Cloudflare Network | Phân phối tài nguyên tĩnh toàn cầu, lọc lưu lượng bất thường và chặn bot tự động |
| **Tầng ứng dụng** | Spring Boot 3 & Docker | Xử lý logic nghiệp vụ, quản lý phiên làm việc, giới hạn tải và trích xuất tài liệu |
| **Cơ sở dữ liệu** | PostgreSQL (Supabase) | Lưu trữ quan hệ thực thể, ràng buộc dữ liệu học thuật và thực thi chính sách RLS |
| **Lưu trữ đối tượng** | Supabase Storage (S3 API) | Lưu trữ an toàn các tệp tin tải lên (PDF, tài liệu, hình ảnh) với khả năng mở rộng cao |

---

## Tính năng chính

- **Phân cấp tài nguyên học thuật:** Phân loại dữ liệu theo Trường đại học, Khoa, Học phần và Học kỳ.
- **Xem trước tài liệu trực tuyến:** Hỗ trợ xem trực tiếp tài liệu PDF và hình ảnh ngay trên trình duyệt mà không bắt buộc tải về.
- **Tự động tạo ảnh thu nhỏ (Thumbnail):** Hệ thống tự động trích xuất trang đầu tiên của file PDF bằng thư viện Apache PDFBox để hiển thị trực quan.
- **Chống sao chép tài liệu:** Tích hợp cơ chế mã hóa ký tự vô hình (Zero-Width Watermark) vào nội dung sao chép nhằm hạn chế tình trạng thu thập dữ liệu tự động trái phép.
- **Bộ tiện ích học tập tức thì:** Hơn 15 công cụ học tập tương tác chạy hoàn toàn trên trình duyệt với độ trễ bằng 0 (Đồng hồ bấm giờ Pomodoro, Flashcard, Soạn thảo Markdown, Tính điểm GPA, Tạo mã QR, Thi thử trắc nghiệm).
- **Nhập liệu hàng loạt (Bulk Import):** Hỗ trợ quản trị viên tải lên file nén ZIP dung lượng lớn, hệ thống tự động giải nén, lập chỉ mục và phân loại cấu trúc thư mục.
- **Bảo mật cơ sở dữ liệu và chống DDoS:** Kích hoạt Row-Level Security (RLS) trên toàn bộ bảng dữ liệu PostgreSQL, áp dụng thuật toán Token Bucket (Bucket4j) và xác thực Cloudflare Turnstile để phòng ngừa bot và crawler.

---

## Công nghệ sử dụng

| Phân tầng | Công nghệ |
| :--- | :--- |
| **Xử lý máy chủ (Backend)** | Java 21 LTS, Spring Boot 3.x, Spring Data JPA, Spring Security |
| **Cơ sở dữ liệu** | PostgreSQL 17 (Supabase Managed), Row-Level Security (RLS) |
| **Lưu trữ đám mây** | Supabase Storage (Chuẩn giao thức AWS S3) |
| **Giao diện (Frontend)** | Thymeleaf, Tailwind CSS 3.4, Vanilla JavaScript (ES6+), Plus Jakarta Sans |
| **Xử lý tài liệu** | Apache PDFBox, ImageIO |
| **Bảo mật & Giới hạn tải** | Cloudflare Turnstile, Bucket4j, Steganographic Watermarking |
| **Đóng gói & CI/CD** | Docker Multi-Stage, GitHub Actions Workflow |

> Chi tiết các thư viện và phiên bản kỹ thuật được mô tả tại [Tài liệu đặc tả công nghệ (docs/TECHSTACK.md)](docs/TECHSTACK.md).

---

## Hướng dẫn cài đặt và khởi chạy

### Yêu cầu môi trường

- **Java Development Kit (JDK) 21** trở lên
- **Maven 3.9+** (hoặc sử dụng wrapper `./mvnw` đi kèm)
- **Git**
- **Docker** (tùy chọn, nếu chạy qua container)

### 1. Sao chép mã nguồn

```bash
git clone https://github.com/ntainguyenit/Unidocs-Platform.git
cd Unidocs-Platform
```

### 2. Cấu hình biến môi trường

Mặc định ứng dụng sẽ tự động kích hoạt cơ sở dữ liệu in-memory **H2 Database** cho môi trường phát triển nội bộ mà không cần thiết lập tài khoản đám mây.

Nếu kết nối đến cơ sở dữ liệu thực tế, tạo tệp `src/main/resources/application-secrets.properties`:

```properties
# Supabase PostgreSQL (Tùy chọn - nếu bỏ trống hệ thống tự chạy H2)
DB_URL=jdbc:postgresql://<host>:5432/<dbname>
DB_USER=<username>
DB_PASSWORD=<password>

# Supabase S3 Object Storage
SUPABASE_S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
SUPABASE_S3_ACCESS_KEY=<access-key>
SUPABASE_S3_SECRET_KEY=<secret-key>
SUPABASE_S3_BUCKET=documents
```

### 3. Khởi chạy ứng dụng

```bash
# Đối với hệ điều hành Windows
.\mvnw.cmd spring-boot:run

# Đối với hệ điều hành macOS / Linux
chmod +x ./mvnw
./mvnw spring-boot:run
```

Truy cập ứng dụng tại địa chỉ: `http://localhost:8080`

### 4. Chạy kiểm thử tự động

```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

### 5. Chạy bằng Docker

```bash
docker build -t unidocs:latest .
docker run -p 8080:8080 unidocs:latest
```

---

## Cấu trúc thư mục dự án

```text
unidocs/
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline tự động kiểm thử và build CI/CD
├── docs/                        # Tài liệu kỹ thuật và kiến trúc
│   └── TECHSTACK.md             # Đặc tả chi tiết công nghệ sử dụng
├── src/
│   ├── main/
│   │   ├── java/com/unidocs/
│   │   │   ├── aop/             # Aspect-oriented rate limiting và logging
│   │   │   ├── config/          # Cấu hình Security, Cache, WebMvc
│   │   │   ├── controller/      # Bộ điều hướng REST API và Web MVC
│   │   │   ├── domain/          # Các thực thể dữ liệu JPA Entity
│   │   │   ├── dto/             # Đối tượng truyền dữ liệu (DTO)
│   │   │   ├── repository/      # Giao diện truy vấn Spring Data JPA
│   │   │   ├── security/        # Bộ lọc phân quyền và xác thực Turnstile
│   │   │   ├── service/         # Xử lý logic nghiệp vụ
│   │   │   └── util/            # Tiện ích tạo thumbnail PDF và hỗ trợ
│   │   └── resources/
│   │       ├── static/          # Mã JavaScript tiện ích, CSS và tài nguyên tĩnh
│   │       └── templates/       # Giao diện Thymeleaf HTML (Người dùng, Quản trị)
│   └── test/                    # Bộ kiểm thử đơn vị JUnit 5 và Mockito
├── Dockerfile                   # Cấu hình đóng gói Docker nhiều tầng
├── LICENSE                      # Giấy phép mã nguồn mở MIT
├── package.json                 # Scripts và cấu hình Tailwind CSS
├── pom.xml                      # Cấu hình dependencies và plugins Maven
└── tailwind.config.js           # Cấu hình Tailwind CSS
```

---

## Đóng góp phát triển

Mọi đóng góp nhằm cải thiện hệ thống đều được hoan nghênh:

1. **Fork** dự án trên GitHub.
2. Tạo nhánh tính năng mới (`git checkout -b feature/tinh-nang-moi`).
3. Commit thay đổi tuân theo quy chuẩn [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat: them tinh nang moi'`).
4. Đảm bảo toàn bộ test suite vượt qua (`./mvnw test`).
5. Đẩy mã nguồn lên nhánh của bạn (`git push origin feature/tinh-nang-moi`).
6. Tạo **Pull Request** trên repository chính.

---

## Giấy phép

Dự án được phát hành theo giấy phép **MIT License** - xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.

---

# UniDocs - Academic Document Sharing Platform

<div align="center">

### Modern Academic Document Management & Student Study Ecosystem

**[Live Demonstration](https://unidocs-husc.pages.dev/)** • **[Report Bug](https://github.com/ntainguyenit/Unidocs-Platform/issues)** • **[Request Feature](https://github.com/ntainguyenit/Unidocs-Platform/issues)**

</div>

---

## Overview

**UniDocs Platform** is a production-grade, open-source academic document management system engineered to streamline academic resource discovery, exam preparation, and peer collaboration for university students. Built with **Spring Boot 3** on **Java 21 LTS**, it features high-throughput document streaming, multi-tier cloud storage, content moderation, and client-side utilities.

---

## System Architecture

```text
+--------------------------------------------------------------------------+
|                         Clients (Web & Mobile)                           |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                       Edge & CDN Layer (Cloudflare)                      |
|  - Edge Caching: Global caching for static assets (CSS, JS, utilities)   |
|  - Edge Security: Cloudflare Turnstile bot defense & SSL/TLS termination |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                 Application Backend (Spring Boot 3 / Docker)             |
|  - Rate Limiting: Token Bucket algorithm (Bucket4j) for traffic control  |
|  - Controllers: MVC view dispatching & RESTful API endpoints             |
|  - Processing: Automated PDF thumbnail synthesis via Apache PDFBox       |
+--------------------------------------------------------------------------+
                      |                                  |
                      v                                  v
+-----------------------------------+  +-----------------------------------+
|      PostgreSQL 17 (Supabase)     |  |       Supabase Object Storage     |
|  - Academic taxonomy & metadata   |  |  - S3-compatible cloud storage    |
|  - Row-Level Security (RLS)       |  |  - Document PDFs, exams & images  |
+-----------------------------------+  +-----------------------------------+
```

| Layer | Component | Core Responsibility |
| :--- | :--- | :--- |
| **Edge & CDN** | Cloudflare Network | Global static asset delivery, traffic caching, and bot mitigation |
| **Application Layer** | Spring Boot 3 & Docker | Business logic execution, session management, rate limiting, and PDF processing |
| **Database Layer** | PostgreSQL (Supabase) | Relational data persistence, academic taxonomy, and Row-Level Security (RLS) |
| **Object Storage** | Supabase Storage (S3 API) | Highly scalable S3-compatible cloud storage for PDFs and media files |

---

## Key Features

- **Hierarchical Academic Taxonomy:** Intuitive categorization organizing materials by Universities, Faculties, Courses, and Academic Semesters.
- **Inline Document & Exam Viewer:** Direct in-browser PDF rendering and image preview without forcing file downloads.
- **Automated Thumbnail Synthesis:** Background extraction of the first page of PDF documents via Apache PDFBox for instant visual card previews.
- **Steganographic Anti-Scraping Protection:** Integrated client-side anti-theft scripts embedding invisible zero-width watermarks into copied text, preventing automated bulk scraping.
- **Zero-Delay Client-Side Student Utilities:** 15+ interactive educational tools running with zero server latency (Stopwatch, Flashcards, Markdown Editor, GPA Calculator, QR Generator, Exam Simulation).
- **Administrative Bulk ZIP Ingestion:** Asynchronous processing of bulk ZIP archives with automatic directory parsing and deduplication.
- **Row-Level Security (RLS) & Rate Limiting:** Enforced PostgreSQL RLS across all tables and token bucket rate-limiting (Bucket4j) guarding against DDoS and crawler attacks.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Core** | Java 21 LTS, Spring Boot 3.x, Spring Data JPA, Spring Security |
| **Database** | PostgreSQL 17 (Supabase Managed), Row-Level Security (RLS) |
| **Object Storage** | Supabase Storage (AWS S3-compatible protocol) |
| **Frontend & UI** | Thymeleaf, Tailwind CSS 3.4, Vanilla JavaScript (ES6+), Plus Jakarta Sans |
| **Document Processing** | Apache PDFBox, ImageIO |
| **Security & Protection** | Cloudflare Turnstile, Bucket4j, Steganographic Watermarking |
| **Container & CI/CD** | Docker Multi-Stage, GitHub Actions Workflow |

> For an in-depth breakdown of dependencies, frameworks, and architecture decisions, see the [Technology Stack Specification](docs/TECHSTACK.md).

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local environment:
- **Java Development Kit (JDK) 21** or later
- **Maven 3.9+** (or use the included `./mvnw` wrapper)
- **Git**
- **Docker** *(optional, for containerized execution)*

### 1. Clone the Repository

```bash
git clone https://github.com/ntainguyenit/Unidocs-Platform.git
cd Unidocs-Platform
```

### 2. Environment Configuration

The application uses an optional `src/main/resources/application-secrets.properties` for production secrets, while gracefully falling back to an in-memory **H2 Database** for local development.

To configure local or cloud credentials, copy or create `src/main/resources/application-secrets.properties`:

```properties
# Supabase PostgreSQL (Optional - falls back to H2 if omitted)
DB_URL=jdbc:postgresql://<host>:5432/<dbname>
DB_USER=<username>
DB_PASSWORD=<password>

# Supabase S3 Object Storage
SUPABASE_S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
SUPABASE_S3_ACCESS_KEY=<access-key>
SUPABASE_S3_SECRET_KEY=<secret-key>
SUPABASE_S3_BUCKET=documents
```

### 3. Run the Application

```bash
# Using Maven Wrapper (Windows)
.\mvnw.cmd spring-boot:run

# Using Maven Wrapper (macOS / Linux)
chmod +x ./mvnw
./mvnw spring-boot:run
```

Access the local server at: `http://localhost:8080`

### 4. Run Test Suite

```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

### 5. Run with Docker

```bash
docker build -t unidocs:latest .
docker run -p 8080:8080 unidocs:latest
```

---

## Project Structure

```text
unidocs/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI build & test pipeline
├── docs/                        # Architecture & technical specifications
│   └── TECHSTACK.md             # Detailed technology stack document
├── src/
│   ├── main/
│   │   ├── java/com/unidocs/
│   │   │   ├── aop/             # Aspect-oriented rate limiting & logging
│   │   │   ├── config/          # Security, Cache, and WebMVC configuration
│   │   │   ├── controller/      # REST API & Web MVC controllers
│   │   │   ├── domain/          # JPA database entities
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── repository/      # Spring Data JPA repositories
│   │   │   ├── security/        # Auth filters, Turnstile verification
│   │   │   ├── service/         # Business services (Storage, Document, Audit)
│   │   │   └── util/            # PDF thumbnail generation & helpers
│   │   └── resources/
│   │       ├── static/          # JavaScript utilities, CSS, and brand assets
│   │       └── templates/       # Thymeleaf HTML views (User, Admin, Utilities)
│   └── test/                    # JUnit 5 & Mockito test suites
├── Dockerfile                   # Production multi-stage Dockerfile
├── LICENSE                      # MIT Open Source License
├── package.json                 # Tailwind CSS build scripts & dependencies
├── pom.xml                      # Maven project dependencies & plugins
└── tailwind.config.js           # Tailwind CSS configuration
```

---

## Contribution & Standards

Contributions are welcome! Please follow these steps:

1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes adhering to [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat: add amazing feature'`).
4. Ensure all tests pass (`./mvnw test`).
5. Push to your branch (`git push origin feature/amazing-feature`).
6. Open a **Pull Request**.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Developed by <a href="https://github.com/ntainguyenit">Tai Nguyen</a>
</div>
