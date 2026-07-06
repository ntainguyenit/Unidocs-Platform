package com.unidocs.config;

import com.unidocs.security.interceptor.SpamPreventionInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebSecurityInterceptorConfig implements WebMvcConfigurer {

    private final SpamPreventionInterceptor spamPreventionInterceptor;

    public WebSecurityInterceptorConfig(SpamPreventionInterceptor spamPreventionInterceptor) {
        this.spamPreventionInterceptor = spamPreventionInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(spamPreventionInterceptor)
                .addPathPatterns("/feedback/**", "/report/**", "/api/feedback/**", "/api/report/**");
    }
}
