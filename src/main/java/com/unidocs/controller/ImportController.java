package com.unidocs.controller;

import com.unidocs.service.DataSeederService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/admin/import")
@ConditionalOnProperty(name = "feature.import.enabled", havingValue = "true")
public class ImportController {

    private final DataSeederService dataSeederService;

    public ImportController(DataSeederService dataSeederService) {
        this.dataSeederService = dataSeederService;
    }

    @GetMapping
    public String showImportPage() {
        return "admin/import";
    }

    @PostMapping("/start")
    public String startImport(@RequestParam("jsonFile") MultipartFile jsonFile, RedirectAttributes redirectAttributes) {
        try {
            if (jsonFile.isEmpty()) {
                redirectAttributes.addFlashAttribute("errorMessage", "Vui lòng chọn file JSON!");
                return "redirect:/admin/import";
            }
            
            String jsonContent = new String(jsonFile.getBytes(), StandardCharsets.UTF_8);
            dataSeederService.startImport(jsonContent);
            
            redirectAttributes.addFlashAttribute("successMessage", "Đã bắt đầu tiến trình Nhập liệu tự động chạy ngầm. Vui lòng kiểm tra màn hình console (Log) của Server để xem tiến độ!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra: " + e.getMessage());
        }
        return "redirect:/admin/import";
    }
}
