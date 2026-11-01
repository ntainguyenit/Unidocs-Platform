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
                map.put("id", d.getId());
                map.put("title", d.getTitle());
                map.put("slug", d.getSlug());
                map.put("courseName", d.getCourse() != null ? d.getCourse().getName() : "Học phần chung");
                map.put("facultyName", (d.getCourse() != null && d.getCourse().getFaculty() != null)
                        ? d.getCourse().getFaculty().getName() : "Đại học");
                map.put("folderName", d.getFolderName() != null ? d.getFolderName() : "Đề thi & Đề cương");
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
