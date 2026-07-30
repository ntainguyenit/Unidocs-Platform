package com.unidocs.service;

import com.unidocs.dto.response.NotificationDto;
import jakarta.annotation.PostConstruct;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final AtomicReference<List<NotificationDto>> notificationsCache = new AtomicReference<>(new ArrayList<>());
    
    private static final String UMS_URL = "https://ums.husc.edu.vn/";

    @PostConstruct
    public void init() {
        // Run initial fetch asynchronously to avoid blocking startup
        new Thread(this::fetchNotifications).start();
    }

    @Scheduled(fixedRate = 3600000) // 1 hour
    public void fetchNotifications() {
        try {
            Document doc = Jsoup.connect(UMS_URL).get();
            Elements notificationDivs = doc.select("div[style=margin-bottom:15px]");
            List<NotificationDto> newNotifications = new ArrayList<>();
            
            for (Element div : notificationDivs) {
                if (newNotifications.size() >= 5) break;
                
                Element titleElement = div.select("p[style*=font-weight:bold] a").first();
                if (titleElement == null) continue;
                
                String title = titleElement.text();
                String link = titleElement.attr("href");
                if (!link.startsWith("http")) {
                    if (!link.startsWith("/")) link = "/" + link;
                    link = "https://ums.husc.edu.vn" + link;
                }
                
                // Get the next p element for content
                Element contentElement = titleElement.parent().nextElementSibling();
                String content = contentElement != null ? contentElement.text() : "";
                
                Element timeElement = titleElement.parent().select("small.text-muted").first();
                String timestamp = timeElement != null ? timeElement.text() : "";
                
                newNotifications.add(new NotificationDto(title, link, content, timestamp));
            }
            
            if (!newNotifications.isEmpty()) {
                notificationsCache.set(newNotifications);
                log.info("Successfully fetched {} notifications from UMS", newNotifications.size());
            }
        } catch (Exception e) {
            log.error("Failed to fetch notifications from UMS", e);
        }
    }

    public List<NotificationDto> getRecentNotifications() {
        return notificationsCache.get();
    }
}
