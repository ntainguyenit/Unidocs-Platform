package com.unidocs.controller.api;

import com.unidocs.domain.InteractionType;
import com.unidocs.dto.StudyGroupRequest;
import com.unidocs.service.StudyGroupService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/study-groups")
public class StudyGroupApiController {

    @Autowired
    private StudyGroupService studyGroupService;

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @PostMapping
    public ResponseEntity<?> createGroup(@Valid @RequestBody StudyGroupRequest groupRequest, HttpServletRequest request) {
        try {
            String ip = getClientIp(request);
            var response = studyGroupService.createGroup(groupRequest, ip);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Có lỗi xảy ra, vui lòng thử lại sau."));
        }
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", errorMsg));
    }

    @PostMapping("/{token}/interact")
    public ResponseEntity<?> interact(@PathVariable String token, @RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            String actionStr = body.get("action");
            if (actionStr == null) return ResponseEntity.badRequest().build();
            
            InteractionType type = InteractionType.valueOf(actionStr);
            String ip = getClientIp(request);
            studyGroupService.interact(token, ip, type);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{token}/reveal")
    public ResponseEntity<?> revealLink(@PathVariable String token, HttpServletRequest request) {
        try {
            String ip = getClientIp(request);
            String link = studyGroupService.revealLink(token, ip);
            return ResponseEntity.ok(Map.of("success", true, "link", link));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{token}/report")
    public ResponseEntity<?> reportGroup(@PathVariable String token, @RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Lý do báo cáo không được để trống."));
            }
            String ip = getClientIp(request);
            studyGroupService.reportGroup(token, reason, ip);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xử lý sớm."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
