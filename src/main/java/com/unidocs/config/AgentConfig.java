package com.unidocs.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.io.PrintWriter;

@Configuration
public class AgentConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                response.addHeader("Link", "</.well-known/api-catalog>; rel=\"api-catalog\"");
                return true;
            }
        }).addPathPatterns("/");
    }

    @Component
    public static class MarkdownNegotiationFilter implements Filter {

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;

            String acceptHeader = req.getHeader("Accept");
            if (acceptHeader != null && acceptHeader.contains("text/markdown")) {
                res.setContentType("text/markdown; charset=UTF-8");
                res.setHeader("x-markdown-tokens", "true");
                PrintWriter out = res.getWriter();
                out.println("# UniDocs - Chia sẻ tài liệu học tập");
                out.println("Chào mừng bạn đến với UniDocs, nền tảng chia sẻ tài liệu và đề thi dành cho sinh viên Đại học Khoa học Huế (HUSC).");
                out.println("## Tính năng chính");
                out.println("- Xem và tải tài liệu miễn phí.");
                out.println("- Lịch học, đếm ngược thi cử.");
                out.println("- Đóng góp và chia sẻ tài liệu dễ dàng.");
                return;
            }

            chain.doFilter(request, response);
        }
    }
}
