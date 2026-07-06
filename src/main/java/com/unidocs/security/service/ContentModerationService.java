package com.unidocs.security.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class ContentModerationService {
    private static final List<String> PROFANITY_WORDS = Arrays.asList(
            "badword1", "badword2", "spamlink.com", "viagra", "casino"
    );

    public boolean isContentClean(String content) {
        if (content == null || content.isEmpty()) return true;
        String lowerContent = content.toLowerCase();
        
        // Check for too many links (spam characteristic)
        int linkCount = content.split("http").length - 1;
        if (linkCount > 3) return false;

        // Check for profanity
        for (String word : PROFANITY_WORDS) {
            if (lowerContent.contains(word)) {
                return false;
            }
        }
        return true;
    }
    
    public String sanitizeContent(String content) {
        if (content == null) return "";
        String sanitized = content;
        for (String word : PROFANITY_WORDS) {
            sanitized = sanitized.replaceAll("(?i)" + word, "***");
        }
        return sanitized;
    }
}
