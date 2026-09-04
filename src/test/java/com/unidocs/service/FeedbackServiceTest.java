package com.unidocs.service;

import com.unidocs.domain.Feedback;
import com.unidocs.repository.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    private Feedback mockFeedback;

    @BeforeEach
    void setUp() {
        mockFeedback = new Feedback();
        mockFeedback.setId(1L);
        mockFeedback.setContent("Test Feedback");
    }

    @Test
    void submitFeedback_Success() {
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(mockFeedback);
        
        Feedback result = feedbackService.createFeedback("Test Feedback", "Người dùng thử nghiệm");
        assertNotNull(result);
        assertEquals("Test Feedback", result.getContent());
        verify(feedbackRepository).save(any(Feedback.class));
    }

    @Test
    void getRecentFeedbacks_ReturnsList() {
        when(feedbackRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Arrays.asList(mockFeedback));
        
        List<Feedback> result = feedbackService.getAllFeedbacks();
        assertFalse(result.isEmpty());
        assertEquals("Test Feedback", result.get(0).getContent());
        verify(feedbackRepository).findAllByOrderByCreatedAtDesc();
    }
}
