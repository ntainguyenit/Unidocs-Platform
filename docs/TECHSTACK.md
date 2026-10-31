# UniDocs Platform - Tech Stack / Danh sách Công nghệ

This document outlines the core technologies and frameworks used in the UniDocs platform.
*Tài liệu này liệt kê các công nghệ và bộ khung phần mềm cốt lõi được sử dụng trong nền tảng UniDocs.*

---

## 1. Database & Storage (Cơ sở dữ liệu & Lưu trữ)
- **[Supabase](https://supabase.com/):** Open-source Firebase alternative powered by **PostgreSQL** used as the primary database. *(Giải pháp mã nguồn mở thay thế Firebase, sử dụng PostgreSQL làm cơ sở dữ liệu chính).*
- **Supabase Storage:** S3-compatible storage service for managing documents, PDFs, and image uploads. *(Dịch vụ lưu trữ tương thích với S3 API dùng để quản lý tài liệu, file PDF và ảnh).*

## 2. Back-end (Xử lý máy chủ)
- **[Java Spring Boot](https://spring.io/projects/spring-boot):** The primary secure and robust framework for backend logic and API endpoints. *(Bộ khung (Framework) bảo mật và mạnh mẽ chính để xử lý logic backend và API).*
- **[Maven](https://maven.apache.org/):** Dependency management and build automation tool (`pom.xml`). *(Công cụ quản lý thư viện và tự động hóa quá trình đóng gói phần mềm).*
- **[Bucket4j](https://bucket4j.com/):** Rate limiting library to prevent spam, bot abuse, and DDoS attacks. *(Thư viện giới hạn tỷ lệ request để chặn spam, bot và chống tấn công DDoS).*

## 3. Front-end (Giao diện người dùng)
- **[Thymeleaf](https://www.thymeleaf.org/):** Server-side Java template engine used to render HTML views from Spring Boot. *(Template engine trên server dùng để nhúng dữ liệu từ Java vào mã HTML).*
- **[Tailwind CSS](https://tailwindcss.com/):** Utility-first CSS framework for rapid UI development and styling. *(Framework CSS siêu nhẹ giúp xây dựng giao diện nhanh chóng).*
- **Vanilla JavaScript:** Plain JS (no heavy frameworks like React/Vue) used for browser logic, timers, UI interactions, and anti-theft mechanisms. *(JS thuần túy không dùng framework để xử lý các logic tương tác như đồng hồ đếm ngược, chặn F12, sao chép).*

## 4. CI/CD & DevOps (Tự động hóa & Triển khai)
- **[Docker](https://www.docker.com/):** Containerization platform (`Dockerfile`) used to package the Java application and its environment for reliable deployment. *(Công cụ đóng gói toàn bộ code Java và môi trường chạy thành container).*
- **[GitHub Actions](https://github.com/features/actions):** CI/CD pipelines (`.github/workflows`) for automated testing and deployment upon code pushes. *(Công cụ tích hợp và triển khai liên tục, tự động chạy test/build khi đẩy code).*
- **[Cloudflare](https://www.cloudflare.com/):** Used for fast content delivery (CDN), DNS management, and **Cloudflare Turnstile** for seamless bot protection (CAPTCHA alternative). *(Được dùng làm CDN phân phối nội dung, và dùng Turnstile làm hệ thống chống bot không cần giải mã CAPTCHA).*
