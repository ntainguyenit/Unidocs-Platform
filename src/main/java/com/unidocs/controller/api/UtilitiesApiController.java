package com.unidocs.controller.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.domain.Faculty;
import com.unidocs.repository.DocumentRepository;
import com.unidocs.repository.FacultyRepository;
import com.unidocs.service.TimetablePdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilities")
public class UtilitiesApiController {

    @Autowired
    private TimetablePdfService timetablePdfService;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private DocumentRepository documentRepository;

    // Fetch faculties list for lucky exam draw
    @GetMapping("/lucky-draw/faculties")
    public ResponseEntity<?> getLuckyDrawFaculties() {
        try {
            List<Faculty> faculties = facultyRepository.findAll();
            List<Map<String, Object>> result = faculties.stream().map(f -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", f.getId());
                map.put("name", f.getName());
                map.put("slug", f.getSlug());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Fetch candidate documents for lucky exam draw
    @GetMapping("/lucky-draw/documents")
    public ResponseEntity<?> getLuckyDrawDocuments(@RequestParam(value = "facultyId", required = false) Long facultyId) {
        try {
            Long queryFacultyId = (facultyId != null && facultyId > 0) ? facultyId : null;
            List<Document> docs = documentRepository.findLuckyDrawDocuments(
                    queryFacultyId,
                    DocumentStatus.APPROVED,
                    PageRequest.of(0, 100)
            );

            List<Map<String, Object>> result = docs.stream().map(d -> {
                Map<String, Object> map = new HashMap<>();
                String courseName = d.getCourse() != null ? d.getCourse().getName() : "Học phần chung";
                String rawFolder = d.getFolderName();
                String folderName = (rawFolder == null || rawFolder.trim().equals("0") || rawFolder.isBlank())
                        ? "Đề thi" : rawFolder.trim();
                String cleanTitle = formatLuckyTitle(d.getTitle(), courseName, folderName);

                map.put("id", d.getId());
                map.put("title", cleanTitle);
                map.put("rawTitle", d.getTitle());
                map.put("slug", d.getSlug());
                map.put("courseName", courseName);
                map.put("facultyName", (d.getCourse() != null && d.getCourse().getFaculty() != null)
                        ? d.getCourse().getFaculty().getName() : "Đại học");
                map.put("folderName", folderName);
                map.put("fileType", d.getFileType() != null ? d.getFileType().name() : "PDF");
                map.put("views", d.getViews());
                map.put("downloads", d.getDownloads());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Clean and standardize lucky draw titles for student display
    private String formatLuckyTitle(String title, String courseName, String folderName) {
        if (title == null || title.isBlank()) {
            return "Đề thi môn " + (courseName != null ? courseName : "học phần");
        }
        String t = title.trim();
        boolean isCode = false;

        String lower = t.toLowerCase();
        if (lower.contains("com.") || lower.contains("activity") || lower.contains("edit") || lower.contains("quicksearchbox")) {
            isCode = true;
        } else if (t.matches("^\\d+$")) {
            isCode = true;
        } else if (t.matches("^[A-Z0-9]{4,}.*") || t.matches("^[0-9A-Z]{3,}[A-Z0-9\\s._-]+$")) {
            boolean hasVietWord = lower.contains("đề") || lower.contains("thi") || lower.contains("tài")
                    || lower.contains("liệu") || lower.contains("bài") || lower.contains("tập")
                    || lower.contains("giáo") || lower.contains("trình") || lower.contains("ôn")
                    || lower.contains("kỳ") || lower.contains("học") || lower.contains("cuối") || lower.contains("giữa");
            if (!hasVietWord) {
                isCode = true;
            }
        }

        if (isCode) {
            String f = (folderName != null && !folderName.equals("0")) ? folderName.trim() : "";
            if (f.matches(".*\\d{4}.*")) {
                return "Đề thi học phần (" + f + ")";
            } else if (f.toLowerCase().contains("giữa kỳ")) {
                return "Đề thi giữa kỳ";
            } else if (f.toLowerCase().contains("cuối kỳ")) {
                return "Đề thi cuối kỳ";
            } else if (f.toLowerCase().contains("đề cương")) {
                return "Đề cương ôn tập " + (courseName != null ? courseName : "");
            } else {
                return "Đề thi môn " + (courseName != null ? courseName : "học phần");
            }
        }

        return t;
    }

    @PostMapping("/timetable/export")
    public ResponseEntity<byte[]> exportTimetable(@RequestParam("data") String dataJson) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> data = objectMapper.readValue(dataJson, new TypeReference<List<String>>(){});
            byte[] pdfBytes = timetablePdfService.generateTimetablePdf(data);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ThoiKhoaBieu.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
