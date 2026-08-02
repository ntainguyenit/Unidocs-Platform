package com.unidocs.controller;

import com.unidocs.domain.Document;
import com.unidocs.service.DocumentService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.unidocs.repository.CourseRepository;
import com.unidocs.repository.DocumentRepository;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.repository.DocumentReportRepository;
import com.unidocs.repository.StudyGroupInteractionRepository;
import com.unidocs.repository.StudyGroupReportRepository;
import com.unidocs.repository.StudyGroupRepository;
import com.unidocs.service.FeedbackService;
import org.springframework.cache.CacheManager;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final DocumentService documentService;
    private final com.unidocs.service.ReportService reportService;
    private final com.unidocs.service.DeduplicationService deduplicationService;
    private final com.unidocs.service.BulkImportService bulkImportService;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final DocumentReportRepository reportRepository;
    private final FeedbackService feedbackService;
    private final StudyGroupInteractionRepository studyGroupInteractionRepository;
    private final StudyGroupReportRepository studyGroupReportRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final CacheManager cacheManager;

    public AdminController(DocumentService documentService, 
                           com.unidocs.service.ReportService reportService,
                           com.unidocs.service.DeduplicationService deduplicationService,
                           com.unidocs.service.BulkImportService bulkImportService,
                           FacultyRepository facultyRepository,
                           CourseRepository courseRepository,
                           DocumentRepository documentRepository,
                           DocumentReportRepository reportRepository,
                           FeedbackService feedbackService,
                           StudyGroupInteractionRepository studyGroupInteractionRepository,
                           StudyGroupReportRepository studyGroupReportRepository,
                           StudyGroupRepository studyGroupRepository,
                           CacheManager cacheManager) {
        this.documentService = documentService;
        this.reportService = reportService;
        this.deduplicationService = deduplicationService;
        this.bulkImportService = bulkImportService;
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.reportRepository = reportRepository;
        this.feedbackService = feedbackService;
        this.studyGroupInteractionRepository = studyGroupInteractionRepository;
        this.studyGroupReportRepository = studyGroupReportRepository;
        this.studyGroupRepository = studyGroupRepository;
        this.cacheManager = cacheManager;
    }

    @GetMapping("/documents")
    public String viewDocuments(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "newest") String sort,
            Model model) {
        
        Page<Document> documentPage = documentService.getAllDocumentsPaginated(page, size, status, sort);
        
        model.addAttribute("documentPage", documentPage);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", documentPage.getTotalPages());
        model.addAttribute("currentStatus", status);
        model.addAttribute("currentSort", sort);
        
        return "admin/documents";
    }

    @GetMapping("/courses")
    public String viewCourses(Model model) {
        java.util.List<com.unidocs.domain.Course> newCourses = courseRepository.findByCreatedAtIsNotNullOrderByCreatedAtDesc();
        model.addAttribute("newCourses", newCourses);
        return "admin/courses";
    }

    @PostMapping("/documents/{id}/rename")
    public String renameDocument(@PathVariable Long id, @RequestParam("newName") String newName, @RequestParam(value = "fromReports", required = false) Boolean fromReports, RedirectAttributes redirectAttributes) {
        try {
            documentService.renameDocument(id, newName);
            redirectAttributes.addFlashAttribute("successMessage", "Đổi tên tài liệu thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        if (Boolean.TRUE.equals(fromReports)) {
            return "redirect:/admin/reports";
        }
        return "redirect:/admin/documents";
    }

    @PostMapping("/documents/{id}/approve")
    public String approveDocument(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            documentService.approveDocument(id);
            redirectAttributes.addFlashAttribute("successMessage", "Duyệt tài liệu thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @PostMapping("/documents/bulk-approve")
    public String bulkApproveDocuments(@RequestParam(value="ids", required=false) java.util.List<Long> ids, RedirectAttributes redirectAttributes) {
        if (ids == null || ids.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Vui lòng chọn ít nhất 1 tài liệu để duyệt.");
            return "redirect:/admin/documents";
        }
        try {
            int count = 0;
            for (Long id : ids) {
                documentService.approveDocument(id);
                count++;
            }
            redirectAttributes.addFlashAttribute("successMessage", "Đã duyệt hàng loạt " + count + " tài liệu thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi duyệt hàng loạt: " + e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @PostMapping("/documents/{id}/reject")
    public String rejectDocument(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            documentService.rejectDocument(id);
            redirectAttributes.addFlashAttribute("successMessage", "Đã xóa/từ chối tài liệu!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @GetMapping("/reports")
    public String viewReports(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            Model model) {
        
        Page<com.unidocs.domain.DocumentReport> reportPage = reportService.getAllReportsPaginated(page, size, status);
        
        model.addAttribute("reportPage", reportPage);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", reportPage.getTotalPages());
        
        return "admin/reports";
    }

    @PostMapping("/reports/{id}/resolve")
    public String resolveReport(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            reportService.resolveReport(id);
            redirectAttributes.addFlashAttribute("successMessage", "Đã đánh dấu báo cáo là đã xử lý.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/reports";
    }

    @PostMapping("/reports/{id}/delete-document")
    public String deleteReportedDocument(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            reportService.deleteReportedDocument(id);
            redirectAttributes.addFlashAttribute("successMessage", "Đã xóa tài liệu vi phạm thành công.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/reports";
    }



    @PostMapping("/system/import-zip")
    public String importZip(@RequestParam("zipFile") org.springframework.web.multipart.MultipartFile zipFile, RedirectAttributes redirectAttributes) {
        try {
            java.io.File tempFile = java.io.File.createTempFile("import-", ".zip");
            zipFile.transferTo(tempFile);
            bulkImportService.importFromZipAsync(tempFile);
            redirectAttributes.addFlashAttribute("successMessage", "Tiến trình tải lên đang được chạy ngầm. Vui lòng chờ ít phút để các file xuất hiện trên hệ thống!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi hệ thống: " + e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @GetMapping("/system/import-status")
    @ResponseBody
    public org.springframework.http.ResponseEntity<com.unidocs.service.BulkImportService.ImportProgress> getImportStatus() {
        return org.springframework.http.ResponseEntity.ok(com.unidocs.service.BulkImportService.currentProgress);
    }

    @PostMapping("/system/clear-database")
    public String clearDatabase(RedirectAttributes redirectAttributes) {
        try {
            studyGroupInteractionRepository.deleteAll();
            studyGroupReportRepository.deleteAll();
            studyGroupRepository.deleteAll();
            reportRepository.deleteAll();
            documentRepository.deleteAll();
            courseRepository.deleteAll();
            facultyRepository.deleteAll();
            
            // Clear caches so the frontend doesn't show old deleted entities
            if (cacheManager != null) {
                cacheManager.getCacheNames().forEach(cacheName -> {
                    org.springframework.cache.Cache cache = cacheManager.getCache(cacheName);
                    if (cache != null) {
                        cache.clear();
                    }
                });
            }
            
            redirectAttributes.addFlashAttribute("successMessage", "Đã xóa sạch toàn bộ dữ liệu hệ thống (Tài liệu, Môn học, Khoa, Nhóm học) thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi xóa dữ liệu: " + e.getMessage());
        }
        return "redirect:/admin/documents";
    }

    @GetMapping("/duplicates")
    public String viewDuplicates(@RequestParam(defaultValue = "0") int page, 
                                 @RequestParam(defaultValue = "10") int size, 
                                 Model model) {
        List<List<Document>> allDuplicates = deduplicationService.findDuplicateDocuments();
        
        int start = Math.min((int)org.springframework.data.domain.PageRequest.of(page, size).getOffset(), allDuplicates.size());
        int end = Math.min((start + size), allDuplicates.size());
        List<List<Document>> pageContent = allDuplicates.subList(start, end);
        
        org.springframework.data.domain.Page<List<Document>> duplicatePage = new org.springframework.data.domain.PageImpl<>(pageContent, org.springframework.data.domain.PageRequest.of(page, size), allDuplicates.size());
        
        model.addAttribute("duplicatePage", duplicatePage);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", duplicatePage.getTotalPages());
        return "admin/duplicates";
    }

    @PostMapping("/duplicates/delete")
    public String deleteDuplicates(@RequestParam(value = "duplicateIds", required = false) List<Long> ids, RedirectAttributes redirectAttributes) {
        if (ids == null || ids.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Vui lòng chọn ít nhất 1 tài liệu để xóa.");
            return "redirect:/admin/duplicates";
        }
        try {
            int count = 0;
            for (Long id : ids) {
                documentService.rejectDocument(id);
                count++;
            }
            redirectAttributes.addFlashAttribute("successMessage", "Đã gỡ bỏ " + count + " bản sao thành công.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi xóa tài liệu: " + e.getMessage());
        }
        return "redirect:/admin/duplicates";
    }

    @GetMapping("/statistics")
    public String viewStatistics(Model model) {
        long facultyCount = facultyRepository.count();
        long courseCount = courseRepository.count();
        long documentCount = documentRepository.count();
        long reportCount = reportRepository.count();
        
        List<List<Document>> duplicates = deduplicationService.findDuplicateDocuments();
        long duplicateCount = duplicates.stream().mapToLong(group -> group.size() - 1).sum();

        model.addAttribute("facultyCount", facultyCount);
        model.addAttribute("courseCount", courseCount);
        model.addAttribute("documentCount", documentCount);
        model.addAttribute("reportCount", reportCount);
        model.addAttribute("duplicateCount", duplicateCount);
        
        // For chart data (documents per faculty could be useful, but let's just pass simple stats for now)
        
        return "admin/statistics";
    }

    @GetMapping("/feedback")
    public String viewFeedback(Model model) {
        model.addAttribute("feedbacks", feedbackService.getAllFeedbacks());
        return "admin/feedback";
    }
}