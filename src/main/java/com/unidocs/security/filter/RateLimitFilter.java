package com.unidocs.security.filter;

import com.unidocs.security.service.IpBlacklistService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class RateLimitFilter implements Filter {

    private final IpBlacklistService ipBlacklistService;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(IpBlacklistService ipBlacklistService) {
        this.ipBlacklistService = ipBlacklistService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        
        String ip = req.getRemoteAddr();
        String uri = req.getRequestURI();
        
        if (ipBlacklistService.isBlacklisted(ip)) {
            res.setStatus(403);
            res.getWriter().write("Your IP is temporarily banned due to suspicious activity.");
            return;
        }

        if (uri.startsWith("/document/") && (uri.endsWith("/view") || uri.endsWith("/download"))) {
            Bucket docBucket = documentBuckets.computeIfAbsent(ip, this::createDocumentBucket);
            if (!docBucket.tryConsume(1)) {
                ipBlacklistService.blacklistIp(ip, 1);
                res.setStatus(429);
                res.setContentType("text/html;charset=UTF-8");
                res.getWriter().write("<h2>Há»‡ thá»‘ng phÃ¡t hiá»‡n hÃ nh vi cÃ o dá»¯ liá»‡u báº¥t thÆ°á»ng. IP cá»§a báº¡n Ä‘Ã£ bá»‹ khÃ³a táº¡m thá»i.</h2>");
                return;
            }
        }

        Bucket bucket = buckets.computeIfAbsent(ip, this::createNewBucket);
        
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            ipBlacklistService.blacklistIp(ip, 1); // Ban for 1 hour if limit exceeded heavily
            res.setStatus(429);
            res.getWriter().write("Too many requests. Please try again later.");
        }
    }

    private Bucket createDocumentBucket(String key) {
        Bandwidth limit = Bandwidth.classic(30, Refill.greedy(30, Duration.ofMinutes(5)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createNewBucket(String key) {
        Bandwidth limit = Bandwidth.classic(200, Refill.greedy(200, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}

