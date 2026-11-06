package com.unidocs.security.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ContentModerationService {

    private static final List<String> PROFANITY_WORDS = Arrays.asList(
            "badword1", "badword2", "spamlink.com", "viagra", "casino", "bet88", "kubet",
            "fuck", "fucking", "fuckyou", "fuckingyou", "bitch", "shit", "dick", "pussy", "porn",
            "đụ", "địt", "lồn", "cặc", "buồi", "dâm", "chó đẻ", "đm", "dcm", "vcl"
    );

    private static final List<String> NONSENSE_OR_TROLL_PHRASES = Arrays.asList(
            "df", "fds", "fsdf", "asdf", "qwer", "zxcv",
            "haha", "hihi", "huhu", "hehe", "hello",
            "ko khoa luon a", "them la hien thi luon a",
            "ko khóa luôn à", "thêm là hiển thị luôn à"
    );

    private static final Pattern EMOTICON_PATTERN = Pattern.compile("[:;=xX8]-?[)D(\\[\\]/\\\\pP3]|:\\)+|:\\(+|\\^\\^");

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
            sanitized = sanitized.replaceAll("(?i)" + Pattern.quote(word), "***");
        }
        return sanitized;
    }

    /**
     * Validates course name for academic standards, anti-spam, and community guidelines.
     * Returns null if valid, or an error message string if invalid.
     */
    public String validateCourseName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "Tên học phần không được để trống.";
        }

        String trimmed = name.trim();
        if (trimmed.length() < 3) {
            return "Tên học phần quá ngắn (tối thiểu 3 ký tự).";
        }

        if (trimmed.length() > 100) {
            return "Tên học phần quá dài (tối đa 100 ký tự).";
        }

        // Check profanity
        if (!isContentClean(trimmed)) {
            return "Tên học phần chứa từ ngữ không phù hợp hoặc vi phạm tiêu chuẩn cộng đồng.";
        }

        // Check emoticons or chat smiley (:)), :D, ^^)
        if (EMOTICON_PATTERN.matcher(trimmed).find()) {
            return "Tên học phần không được chứa biểu cảm hoặc ký tự chat đùa cợt (:)), :D, ^^).";
        }

        // Check nonsense or troll phrases
        String lower = trimmed.toLowerCase();
        for (String troll : NONSENSE_OR_TROLL_PHRASES) {
            if (lower.equals(troll) || lower.startsWith(troll + " ") || lower.contains(troll)) {
                return "Tên học phần không hợp lệ hoặc mang tính chất đùa cợt/thử nghiệm.";
            }
        }

        // Must contain at least one meaningful alphanumeric word
        if (!trimmed.matches(".*[\\p{L}\\d]{2,}.*")) {
            return "Tên học phần phải chứa từ ngữ có nghĩa hợp lệ.";
        }

        return null;
    }

    public boolean isValidCourseName(String name) {
        return validateCourseName(name) == null;
    }
}
