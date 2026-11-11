package com.unidocs.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.domain.DocumentType;
import com.unidocs.domain.Faculty;
import com.unidocs.domain.University;
import com.unidocs.dto.response.SeoMetadataDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

// Unit tests verifying SEO metadata templates, keyword clusters, GEO contextual copy, and JSON-LD validity
class SeoMetadataServiceTest {

    private final SeoMetadataService seoMetadataService = new SeoMetadataService("https://unidocs-husc.pages.dev");
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void buildFacultySeo_GeneratesExactMetaTagsClusterAndCollectionSchema() throws Exception {
        University husc = University.builder()
                .id(1L)
                .name("Trường Đại học Khoa học Huế")
                .slug("truong-dai-hoc-khoa-hoc")
                .shortName("HUSC")
                .build();

        Faculty cntt = Faculty.builder()
                .id(10L)
                .name("Khoa Công nghệ Thông tin")
                .slug("khoa-cong-nghe-thong-tin")
                .university(husc)
                .build();

        Course ctdl = Course.builder()
                .id(100L)
                .name("Cấu trúc Dữ liệu và Thuật Toán")
                .slug("cau-truc-du-lieu-va-thuat-toan")
                .faculty(cntt)
                .status("active")
                .build();

        SeoMetadataDto seo = seoMetadataService.buildFacultySeo(cntt, List.of(ctdl));

        assertEquals("Khoa Công nghệ Thông tin - Trường Đại học Khoa học Huế | HUSC UniDocs", seo.getTitle());
        assertEquals(
                "Tổng hợp tài liệu, đề thi, giáo trình chính thống của Khoa Công nghệ Thông tin tại Trường Khoa học Huế (ĐHKH Huế, HUSC). Chia sẻ học tập miễn phí trên UniDocs.",
                seo.getDescription()
        );
        assertEquals("https://unidocs-husc.pages.dev/faculty/khoa-cong-nghe-thong-tin", seo.getCanonicalUrl());
        assertKeywordClusterPresent(seo.getKeywords());

        JsonNode root = objectMapper.readTree(seo.getJsonLd());
        assertEquals("https://schema.org", root.get("@context").asText());
        String jsonText = seo.getJsonLd();
        assertTrue(jsonText.contains("CollectionPage"));
        assertTrue(jsonText.contains("EducationalOrganization"));
        assertTrue(jsonText.contains("Khoa Công nghệ Thông tin"));
        assertTrue(jsonText.contains("cau-truc-du-lieu-va-thuat-toan"));
    }

    @Test
    void buildCourseSeo_GeneratesExactMetaTagsContextualIntroAndEscapesHtmlInSchema() throws Exception {
        University husc = University.builder()
                .id(1L)
                .name("Trường Đại học Khoa học Huế")
                .slug("truong-dai-hoc-khoa-hoc")
                .build();

        Faculty faculty = Faculty.builder()
                .id(20L)
                .name("Khoa Công nghệ Thông tin")
                .slug("khoa-cong-nghe-thong-tin")
                .university(husc)
                .build();

        Course course = Course.builder()
                .id(200L)
                .name("Công Nghệ Phần Mềm")
                .slug("cong-nghe-phan-mem")
                .faculty(faculty)
                .status("active")
                .build();

        Document doc = new Document();
        doc.setId(300L);
        doc.setTitle("Đề thi giữa kỳ Công Nghệ Phần Mềm");
        doc.setSlug("de-thi-giua-ky-cnpm");
        doc.setFileType(DocumentType.PDF);
        doc.setFileSize(1024L);
        doc.setStatus(DocumentStatus.APPROVED);
        doc.setCourse(course);

        SeoMetadataDto seo = seoMetadataService.buildCourseSeo(course, List.of(doc));

        assertEquals("Học phần Công Nghệ Phần Mềm - Khoa Công nghệ Thông tin | ĐHKH Huế UniDocs", seo.getTitle());
        assertEquals(
                "Tải tài liệu, đề thi, bài tập và hướng dẫn học tập học phần Công Nghệ Phần Mềm thuộc Khoa Công nghệ Thông tin - Trường Đại học Khoa học Huế (HUSC). Miễn phí trên UniDocs.",
                seo.getDescription()
        );
        assertEquals("https://unidocs-husc.pages.dev/course/cong-nghe-phan-mem", seo.getCanonicalUrl());
        assertKeywordClusterPresent(seo.getKeywords());
        assertKeywordClusterPresent(seo.getContextualIntro());

        JsonNode root = objectMapper.readTree(seo.getJsonLd());
        assertTrue(root.get("@graph").isArray());
        assertTrue(seo.getJsonLd().contains("\"@type\":\"Course\""));
        assertTrue(seo.getJsonLd().contains("\"@type\":\"EducationalOrganization\""));

        // Verify XSS / script breakout characters are escaped cleanly inside JSON-LD
        Course malicious = Course.builder()
                .id(201L)
                .name("Test </script><script>alert(1)</script>")
                .slug("test-xss")
                .faculty(faculty)
                .build();
        SeoMetadataDto safeSeo = seoMetadataService.buildCourseSeo(malicious, List.of());
        assertFalse(safeSeo.getJsonLd().contains("</script>"));
        assertTrue(safeSeo.getJsonLd().contains("\\u003c/script\\u003e"));
    }

    @Test
    void buildHuscCampusSeo_GeneratesMetaTagsAuthorClusterAndGeoSchema() throws Exception {
        SeoMetadataDto seo = seoMetadataService.buildHuscCampusSeo();

        assertEquals("Khám phá Khuôn viên 3D - Trường Đại học Khoa học Huế (HUSC) | UniDocs", seo.getTitle());
        assertTrue(seo.getDescription().contains("Trường Đại học Khoa học Huế"));
        assertTrue(seo.getDescription().contains("UniDocs"));
        assertTrue(seo.getDescription().contains("77 Nguyễn Huệ"));
        assertEquals("Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyen.it@gmail.com)", seo.getAuthor());
        assertEquals("https://unidocs-husc.pages.dev/husc-campus", seo.getCanonicalUrl());
        assertEquals("https://unidocs-husc.pages.dev/images/campus-map.jpeg", seo.getOgImage());

        for (String requiredKeyword : List.of(
                "husc campus 3d",
                "sơ đồ 3d trường đại học khoa học huế",
                "đhkh huế",
                "husc",
                "unidocs",
                "tài nguyễn",
                "nguyễn ngọc thành tài",
                "ntainguyenit"
        )) {
            assertTrue(seo.getKeywords().contains(requiredKeyword), "Expected keyword: " + requiredKeyword);
        }

        // Parse JSON-LD graph cleanly and assert InteractiveModel, CollegeOrUniversity, and Person author nodes
        JsonNode root = objectMapper.readTree(seo.getJsonLd());
        assertEquals("https://schema.org", root.get("@context").asText());
        JsonNode graph = root.get("@graph");
        assertTrue(graph.isArray());

        JsonNode universityNode = null;
        JsonNode modelNode = null;
        for (JsonNode node : graph) {
            String type = node.get("@type").asText();
            if ("CollegeOrUniversity".equals(type)) {
                universityNode = node;
            } else if ("InteractiveModel".equals(type)) {
                modelNode = node;
            }
        }

        assertNotNull(universityNode, "Expected CollegeOrUniversity node in JSON-LD @graph");
        assertEquals("Trường Đại học Khoa học, Đại học Huế", universityNode.get("name").asText());
        assertEquals("77 Nguyễn Huệ", universityNode.get("address").get("streetAddress").asText());
        assertEquals("Thành phố Huế", universityNode.get("address").get("addressLocality").asText());

        assertNotNull(modelNode, "Expected InteractiveModel node in JSON-LD @graph");
        assertEquals("model/gltf-binary", modelNode.get("encodingFormat").asText());
        JsonNode authorNode = modelNode.get("author");
        assertNotNull(authorNode);
        assertEquals("Tài Nguyễn", authorNode.get("name").asText());
        assertTrue(authorNode.get("alternateName").toString().contains("Nguyễn Ngọc Thành Tài"));
        assertEquals("ntainguyen.it@gmail.com", authorNode.get("email").asText());
        assertEquals("https://github.com/ntainguyenit", authorNode.get("url").asText());
    }

    private void assertKeywordClusterPresent(String text) {
        assertNotNull(text);
        String lower = text.toLowerCase();
        for (String term : List.of(
                "trường đại học khoa học",
                "trường khoa học huế",
                "khoa học huế",
                "đhkh",
                "đhkh huế",
                "husc",
                "unidocs"
        )) {
            assertTrue(lower.contains(term), "Expected keyword cluster term: " + term);
        }
    }
}
