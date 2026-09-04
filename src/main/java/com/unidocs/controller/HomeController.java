package com.unidocs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.unidocs.domain.University;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.repository.UniversityRepository;
import java.util.List;

/**
 * Controller xử lý các yêu cầu trang chủ và giao diện chính.
 */
@Controller
public class HomeController {

    /**
     * Hiển thị trang chủ với danh sách tài liệu nổi bật/mới nhất.
     * 
     * @param model Đối tượng Model để truyền dữ liệu sang View
     * @return Tên template Thymeleaf (index)
     */
    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final com.unidocs.repository.CourseRepository courseRepository;
    private final com.unidocs.repository.DocumentRepository documentRepository;
    private final com.unidocs.service.DocumentService documentService;
    private final com.unidocs.service.NotificationService notificationService;
    private final com.unidocs.service.FeedbackService feedbackService;

    public HomeController(UniversityRepository universityRepository, FacultyRepository facultyRepository, 
                          com.unidocs.repository.CourseRepository courseRepository, com.unidocs.repository.DocumentRepository documentRepository,
                          com.unidocs.service.DocumentService documentService,
                          com.unidocs.service.NotificationService notificationService, com.unidocs.service.FeedbackService feedbackService) {
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.documentService = documentService;
        this.notificationService = notificationService;
        this.feedbackService = feedbackService;
    }

    @GetMapping("/")
    public String index(Model model) {
        java.util.List<University> unis = universityRepository.findAll();
        java.util.Map<Long, Long> uniViews = new java.util.HashMap<>();
        java.util.Map<Long, Long> uniDownloads = new java.util.HashMap<>();
        for (University u : unis) {
            uniViews.put(u.getId(), documentRepository.sumViewsByUniversity(u.getId()));
            uniDownloads.put(u.getId(), documentRepository.sumDownloadsByUniversity(u.getId()));
        }
        model.addAttribute("universities", unis);
        model.addAttribute("uniViews", uniViews);
        model.addAttribute("uniDownloads", uniDownloads);
        model.addAttribute("notifications", notificationService.getRecentNotifications());
        model.addAttribute("feedbacks", feedbackService.getAllFeedbacks());
        return "index";
    }

    @GetMapping("/university/{slug}")
    public String universityDetail(@org.springframework.web.bind.annotation.PathVariable String slug, Model model) {
        University uni = universityRepository.findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Invalid university slug:" + slug));
        
        java.util.List<com.unidocs.domain.Faculty> sortedFaculties = uni.getFaculties().stream()
                .sorted(java.util.Comparator.comparing(com.unidocs.domain.Faculty::getName))
                .toList();

        long totalViews = documentRepository.sumViewsByUniversity(uni.getId());
        long totalDownloads = documentRepository.sumDownloadsByUniversity(uni.getId());

        model.addAttribute("university", uni);
        model.addAttribute("faculties", sortedFaculties);
        model.addAttribute("totalViews", totalViews);
        model.addAttribute("totalDownloads", totalDownloads);
        return "university";
    }

    @GetMapping("/faculty/{slug}")
    public String facultyDetail(@org.springframework.web.bind.annotation.PathVariable String slug, Model model) {
        com.unidocs.domain.Faculty faculty = facultyRepository.findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Invalid faculty slug:" + slug));
        
        java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
        java.util.List<com.unidocs.domain.Course> sortedCourses = faculty.getCourses().stream()
                .sorted((c1, c2) -> {
                    boolean c1IsNew = c1.getCreatedAt() != null && c1.getCreatedAt().isAfter(sevenDaysAgo);
                    boolean c2IsNew = c2.getCreatedAt() != null && c2.getCreatedAt().isAfter(sevenDaysAgo);
                    
                    if (c1IsNew && c2IsNew) {
                        int dateCompare = c2.getCreatedAt().compareTo(c1.getCreatedAt()); // Descending
                        if (dateCompare != 0) return dateCompare;
                    } else if (c1IsNew) {
                        return -1;
                    } else if (c2IsNew) {
                        return 1;
                    }
                    
                    // Fallback to name ascending for all older or imported courses
                    if (c1.getName() == null) return 1;
                    if (c2.getName() == null) return -1;
                    return c1.getName().compareTo(c2.getName());
                })
                .toList();
        model.addAttribute("faculty", faculty);
        model.addAttribute("courses", sortedCourses);
        return "faculty";
    }

    @org.springframework.beans.factory.annotation.Value("${cloudflare.turnstile.site-key:}")
    private String turnstileSiteKey;

    @GetMapping("/course/{slug}")
    public String courseDetail(@org.springframework.web.bind.annotation.PathVariable String slug, 
                               @org.springframework.web.bind.annotation.RequestParam(required = false) String folder,
                               Model model) {
        com.unidocs.domain.Course course = courseRepository.findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Invalid course slug:" + slug));
        
        java.util.List<com.unidocs.domain.Document> allDocs = documentService.getApprovedDocumentsByCourse(course.getId());
            
        model.addAttribute("course", course);
        model.addAttribute("turnstileSiteKey", turnstileSiteKey);
        
        java.util.List<com.unidocs.domain.Document> trendingDocs = documentService.getTrendingDocumentsForCourse(course.getId(), 4);
        model.addAttribute("trendingDocs", trendingDocs);
        
        if (folder == null) {
            // Get unique folder names, optionally sort them
            java.util.List<String> folders = allDocs.stream()
                .map(d -> d.getFolderName() != null ? d.getFolderName() : "Khác (Tài liệu không xác định năm)")
                .distinct()
                .sorted(java.util.Comparator.reverseOrder()) // Sort descending so newer years are first
                .toList();
            model.addAttribute("folders", folders);
            model.addAttribute("documents", null);
        } else {
            java.util.List<com.unidocs.domain.Document> filteredDocs = allDocs.stream()
                .filter(d -> folder.equals(d.getFolderName()) || (folder.equals("Khác (Tài liệu không xác định năm)") && d.getFolderName() == null))
                .toList();
            model.addAttribute("currentFolder", folder);
            model.addAttribute("documents", filteredDocs);
        }
        
        return "course"; // Need to create this template
    }
}
