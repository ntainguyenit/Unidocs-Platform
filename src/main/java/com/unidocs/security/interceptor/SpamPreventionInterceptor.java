package com.unidocs.security.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Component
public class SpamPreventionInterceptor implements HandlerInterceptor {
    
    private final Map<String, LocalDateTime> lastSubmissionMap = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            String ip = request.getRemoteAddr();
            String uri = request.getRequestURI();
            
            if (uri.contains("/feedback") || uri.contains("/report")) {
                LocalDateTime lastSubmission = lastSubmissionMap.get(ip);
                if (lastSubmission != null && LocalDateTime.now().isBefore(lastSubmission.plusMinutes(1))) {
                    response.setStatus(429);
                    response.getWriter().write("Please wait 1 minute before submitting again.");
                    return false;
                }
                lastSubmissionMap.put(ip, LocalDateTime.now());
            }
        }
        return true;
    }
}
