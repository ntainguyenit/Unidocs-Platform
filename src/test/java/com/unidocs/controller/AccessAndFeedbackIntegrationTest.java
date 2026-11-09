package com.unidocs.controller;

import com.unidocs.domain.AccessLog;
import com.unidocs.domain.Feedback;
import com.unidocs.repository.AccessLogRepository;
import com.unidocs.repository.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Single-line English comment: Integration tests for footer access tracking and hidden public feedback list
@SpringBootTest
class AccessAndFeedbackIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private AccessLogRepository accessLogRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        // Single-line English comment: Build standalone MockMvc on full application context and reset test tables
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        accessLogRepository.deleteAll();
        feedbackRepository.deleteAll();
    }

    @Test
    void accessLogsEndpoint_PersistsIpInDatabaseAndHidesIpInResponse() throws Exception {
        // Single-line English comment: Post access payload carrying Cloudflare client IP header
        MvcResult result = mockMvc.perform(post("/api/access-logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("CF-Connecting-IP", "203.0.113.99")
                        .header("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1")
                        .content("{\"path\":\"/\",\"mobile\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deviceName").value("iPhone - Safari"))
                .andReturn();

        // Single-line English comment: Verify API response never includes client IP address or braces
        String body = result.getResponse().getContentAsString();
        assertFalse(body.contains("203.0.113.99"));
        assertFalse(body.contains("ipAddress"));
        assertTrue(body.contains("Lần truy cập cuối: lúc "));

        // Single-line English comment: Verify IP address was persisted silently in access_logs table
        List<AccessLog> logs = accessLogRepository.findAll();
        assertEquals(1, logs.size());
        assertEquals("203.0.113.99", logs.get(0).getIpAddress());
        assertEquals("iPhone - Safari", logs.get(0).getDeviceName());
    }

    @Test
    void homeAndFeedbackPages_RenderFooterAccessHookWithoutPublicFeedbackList() throws Exception {
        // Single-line English comment: Seed confidential feedback item to confirm it never appears on public pages
        Feedback privateFeedback = new Feedback();
        privateFeedback.setAuthorName("Sinh viên ẩn danh");
        privateFeedback.setContent("CONFIDENTIAL_FEEDBACK_SECRET_TEXT");
        feedbackRepository.save(privateFeedback);

        // Single-line English comment: Verify homepage renders form and footer hook while hiding public feedback list
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("id=\"lastAccessInfo\"")))
                .andExpect(content().string(containsString("Điều khoản sử dụng")))
                .andExpect(content().string(containsString("Chính sách bảo mật")))
                .andExpect(content().string(containsString("Gửi Góp Ý")))
                .andExpect(content().string(not(containsString("Danh sách Góp ý"))))
                .andExpect(content().string(not(containsString("id=\"feedbackList\""))))
                .andExpect(content().string(not(containsString("CONFIDENTIAL_FEEDBACK_SECRET_TEXT"))));

        // Single-line English comment: Verify standalone feedback page keeps submission form and hides list
        mockMvc.perform(get("/feedback"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("id=\"lastAccessInfo\"")))
                .andExpect(content().string(containsString("Gửi Góp Ý")))
                .andExpect(content().string(not(containsString("Danh sách Góp ý"))))
                .andExpect(content().string(not(containsString("id=\"feedbackList\""))))
                .andExpect(content().string(not(containsString("CONFIDENTIAL_FEEDBACK_SECRET_TEXT"))));
    }

    @Test
    void submitFeedbackEndpoint_StillSavesFeedbackForAdminManagement() throws Exception {
        // Single-line English comment: Verify submitting feedback via POST still stores entry in database
        mockMvc.perform(post("/api/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"authorName\":\"Sinh viên chăm chỉ\",\"content\":\"Góp ý gửi riêng cho Admin kiểm tra\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Góp ý đã được gửi thành công"));

        List<Feedback> saved = feedbackRepository.findAll();
        assertEquals(1, saved.size());
        assertEquals("Góp ý gửi riêng cho Admin kiểm tra", saved.get(0).getContent());
    }
}
