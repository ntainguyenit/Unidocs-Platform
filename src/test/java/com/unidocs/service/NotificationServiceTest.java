package com.unidocs.service;

import com.unidocs.dto.response.NotificationDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void getRecentNotifications_ReturnsList() {
        List<NotificationDto> notifications = notificationService.getRecentNotifications();
        assertNotNull(notifications);
    }
}
