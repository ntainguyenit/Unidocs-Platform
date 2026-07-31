package com.unidocs.controller;

import com.unidocs.service.StudyGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class StudyGroupWebController {

    @Autowired
    private StudyGroupService studyGroupService;

    @GetMapping("/utilities/study-groups/create")
    public String createStudyGroupPage(Model model) {
        model.addAttribute("groups", studyGroupService.getActiveGroups());
        model.addAttribute("pageTitle", "Tìm & Tạo nhóm học chung - Kết nối sinh viên");
        return "study-group-create";
    }

    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @GetMapping("/g/{token}")
    public String viewStudyGroup(@PathVariable String token, jakarta.servlet.http.HttpServletRequest request, Model model) {
        try {
            var group = studyGroupService.getGroupDetails(token);
            studyGroupService.incrementViews(token);
            
            String ip = getClientIp(request);
            boolean hasInterested = studyGroupService.hasInteracted(token, ip, com.unidocs.domain.InteractionType.INTERESTED);
            boolean hasRevealed = studyGroupService.hasInteracted(token, ip, com.unidocs.domain.InteractionType.REVEAL);
            
            model.addAttribute("group", group);
            model.addAttribute("hasInterested", hasInterested);
            model.addAttribute("hasRevealed", hasRevealed);
            model.addAttribute("pageTitle", "Nhóm học chung: " + group.getSubjectName());
            model.addAttribute("hideTools", true);
            return "study-group-view";
        } catch (IllegalArgumentException e) {
            return "error/404";
        }
    }
}
