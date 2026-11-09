package com.unidocs.controller.api;

import com.unidocs.domain.Feedback;
import com.unidocs.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackApiController {

    private final FeedbackService feedbackService;

    public FeedbackApiController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Single-line English comment: Persist user feedback and trigger admin real-time notification via service
    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> payload) {
        try {
            String content = payload.get("content");
            String authorName = payload.get("authorName");
            Feedback feedback = feedbackService.createFeedback(content, authorName);
            return ResponseEntity.ok(Map.of("message", "Góp ý đã được gửi thành công", "feedback", feedback));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Có lỗi xảy ra khi gửi góp ý"));
        }
    }
}
