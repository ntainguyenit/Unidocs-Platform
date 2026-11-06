package com.unidocs.controller;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class HomeControllerTest {

    @Test
    void maintenance_ReturnsMaintenanceView() {
        HomeController controller = new HomeController(
            mock(com.unidocs.repository.UniversityRepository.class),
            mock(com.unidocs.repository.FacultyRepository.class),
            mock(com.unidocs.repository.CourseRepository.class),
            mock(com.unidocs.repository.DocumentRepository.class),
            mock(com.unidocs.service.DocumentService.class),
            mock(com.unidocs.service.NotificationService.class),
            mock(com.unidocs.service.FeedbackService.class)
        );

        String view = controller.maintenance();
        assertEquals("maintenance", view);
    }
}
