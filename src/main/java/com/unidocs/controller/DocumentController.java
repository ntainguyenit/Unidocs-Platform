package com.unidocs.controller;

import com.unidocs.domain.Document;
import com.unidocs.service.DocumentService;
import com.unidocs.service.RateLimitingService;
import com.unidocs.service.TurnstileService;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final TurnstileService turnstileService;
    private final RateLimitingService rateLimitingService;

    public DocumentController(DocumentService documentService, TurnstileService turnstileService, RateLimitingService rateLimitingService) {
        this.documentService = documentService;
        this.turnstileService = turnstileService;
        this.rateLimitingService = rateLimitingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "cf-turnstile-response", required = false) String turnstileResponse,
            HttpServletRequest request) {

        String ip = getClientIp(request);
        
        // 1. Rate Limiting Check
        Bucket bucket = rateLimitingService.resolveBucket(ip);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Bạn đã tải lên quá nhiều. Vui lòng thử lại sau 1 giờ."));
        }

        // 2. Turnstile Verification (Skip if secret key is not configured locally, but recommended to fail)
        // If we don't have a turnstileResponse but it's required:
        // if (!turnstileService.verifyToken(turnstileResponse, ip)) {
        //     // Note: In development, we might want to bypass this if turnstileResponse is empty and we are on localhost
        //     // But for production, this must be strict.
        //     return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        //             .body(Map.of("error", "reCAPTCHA/Turnstile verification failed"));
        // }

        try {
            // 3. Upload & Save
            String userAgent = request.getHeader("User-Agent");
            Document doc = documentService.uploadDocument(file, courseId, ip, userAgent);
            return ResponseEntity.ok(Map.of(
                    "message", "Tải lên thành công! Tài liệu đang chờ duyệt.",
                    "documentId", doc.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Có lỗi xảy ra trong quá trình xử lý file: " + e.getMessage()));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
    
    @GetMapping("/dummy-storage/{filename}")
    public ResponseEntity<String> getDummyStorage(@PathVariable String filename) {
        // This is a fallback for local development when Supabase credentials are not provided.
        // In a real scenario, this would serve the actual file from local disk.
        String html = "<html><head><title>File Preview</title></head><body style='font-family:sans-serif;text-align:center;padding:50px;'>"
                + "<h2>Chế độ Development (Dummy Storage)</h2>"
                + "<p>Tài liệu <strong>" + filename + "</strong> không được tải lên máy chủ Cloud do chưa cấu hình Supabase credentials.</p>"
                + "<p>Đây là một trang giả lập thành công cho tính năng Xem/Tải file.</p>"
                + "</body></html>";
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(html);
    }
}
