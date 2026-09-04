package com.unidocs.service;

import com.unidocs.domain.Feedback;
import com.unidocs.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    
    // Maintain a list of active SseEmitters for real-time updates
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public SseEmitter createEmitter() {
        // Timeout set to 0 (infinite) or a very large value to keep connection alive
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        return emitter;
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Feedback createFeedback(String content, String authorName) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung không được để trống");
        }
        if (content.length() > 500) {
            throw new IllegalArgumentException("Nội dung không được vượt quá 500 ký tự");
        }

        Feedback feedback = new Feedback();
        feedback.setAuthorName(authorName != null && !authorName.trim().isEmpty() ? authorName : "Người dùng");
        // Simple XSS prevention by replacing tags
        feedback.setContent(content.replace("<", "&lt;").replace(">", "&gt;"));

        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        // Broadcast new feedback to all connected clients
        broadcastEvent("NEW_FEEDBACK", savedFeedback);
        
        return savedFeedback;
    }

    @Transactional
    public Feedback replyToFeedback(Long id, String replyContent) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy góp ý"));

        if (replyContent == null || replyContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung phản hồi không được để trống");
        }

        feedback.setReplyContent(replyContent.replace("<", "&lt;").replace(">", "&gt;"));
        feedback.setRepliedAt(LocalDateTime.now());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        // Broadcast reply to all connected clients
        broadcastEvent("REPLY_FEEDBACK", savedFeedback);
        
        return savedFeedback;
    }

    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy góp ý");
        }
        feedbackRepository.deleteById(id);
        
        // We can broadcast a delete event so clients remove it from UI
        Feedback deletedFeedback = new Feedback();
        deletedFeedback.setId(id);
        broadcastEvent("DELETE_FEEDBACK", deletedFeedback);
    }

    @Transactional
    public Feedback deleteReply(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy góp ý"));
        
        feedback.setReplyContent(null);
        feedback.setRepliedAt(null);
        
        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        broadcastEvent("DELETE_REPLY", savedFeedback);
        
        return savedFeedback;
    }

    private void broadcastEvent(String eventName, Feedback feedback) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(feedback));
            } catch (Exception e) {
                try {
                    emitter.complete();
                } catch (Exception ignored) {}
                emitters.remove(emitter);
            }
        }
    }
}
