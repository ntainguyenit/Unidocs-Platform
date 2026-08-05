package com.unidocs.controller.publicapi;

import com.unidocs.service.UtilityLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilities")
public class UtilityApiController {

    @Autowired
    private UtilityLikeService utilityLikeService;

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @GetMapping("/likes")
    public ResponseEntity<Map<String, Object>> getLikesData(HttpServletRequest request) {
        String ip = getClientIp(request);
        Map<String, Integer> counts = utilityLikeService.getAllLikeCounts();
        List<String> likedByMe = utilityLikeService.getLikedUtilitiesByIp(ip);
        
        Map<String, Object> response = new HashMap<>();
        response.put("counts", counts);
        response.put("likedByMe", likedByMe);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{utilityId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable String utilityId, 
            HttpServletRequest request) {
        String ip = getClientIp(request);
        Map<String, Object> result = utilityLikeService.toggleLike(utilityId, ip);
        return ResponseEntity.ok(result);
    }
}
