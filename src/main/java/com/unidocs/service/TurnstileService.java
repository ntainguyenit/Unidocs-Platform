package com.unidocs.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TurnstileService {

    private static final Logger log = LoggerFactory.getLogger(TurnstileService.class);

    @Value("${cloudflare.turnstile.secret-key:}")
    private String secretKey;

    private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean verifyToken(String token, String remoteIp) {
        // In local development or automated CI environments where secret key is not set or mocked:
        if (secretKey == null || secretKey.trim().isEmpty() || "mock-secret-key".equals(secretKey)) {
            log.debug("Turnstile secret key is not configured or mock; bypassing verification in development.");
            return true;
        }

        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", secretKey);
        map.add("response", token);
        if (remoteIp != null) {
            map.add("remoteip", remoteIp);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(VERIFY_URL, request, Map.class);
            if (response.getBody() != null) {
                return Boolean.TRUE.equals(response.getBody().get("success"));
            }
        } catch (Exception e) {
            log.warn("Turnstile verification error: {}", e.getMessage());
            return false;
        }
        return false;
    }
}
