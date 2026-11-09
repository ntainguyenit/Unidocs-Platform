package com.unidocs.controller;

import org.junit.jupiter.api.Test;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Single-line English comment: Unit tests for HomeController view routing and model attributes
class HomeControllerTest {

    @Test
    void maintenance_ReturnsMaintenanceView() {
        HomeController controller = new HomeController(
            mock(com.unidocs.repository.UniversityRepository.class),
            mock(com.unidocs.repository.FacultyRepository.class),
            mock(com.unidocs.repository.CourseRepository.class),
            mock(com.unidocs.repository.DocumentRepository.class),
            mock(com.unidocs.service.DocumentService.class),
            mock(com.unidocs.service.NotificationService.class)
        );

        String view = controller.maintenance();
        assertEquals("maintenance", view);
    }

    @Test
    void index_DoesNotExposePublicFeedbackListInModel() {
        // Single-line English comment: Mock homepage dependencies
        com.unidocs.repository.UniversityRepository uniRepo = mock(com.unidocs.repository.UniversityRepository.class);
        com.unidocs.service.NotificationService notificationService = mock(com.unidocs.service.NotificationService.class);
        when(uniRepo.findAll()).thenReturn(Collections.emptyList());
        when(notificationService.getRecentNotifications()).thenReturn(Collections.emptyList());

        HomeController controller = new HomeController(
            uniRepo,
            mock(com.unidocs.repository.FacultyRepository.class),
            mock(com.unidocs.repository.CourseRepository.class),
            mock(com.unidocs.repository.DocumentRepository.class),
            mock(com.unidocs.service.DocumentService.class),
            notificationService
        );

        // Single-line English comment: Verify homepage renders without public feedbacks attribute
        Model model = new ConcurrentModel();
        String view = controller.index(model);
        assertEquals("index", view);
        assertFalse(model.containsAttribute("feedbacks"));
    }
}
