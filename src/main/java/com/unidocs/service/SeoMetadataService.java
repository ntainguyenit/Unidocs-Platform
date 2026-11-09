package com.unidocs.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unidocs.domain.Course;
import com.unidocs.domain.Document;
import com.unidocs.domain.Faculty;
import com.unidocs.domain.University;
import com.unidocs.dto.response.SeoMetadataDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

// Builds dynamic SEO meta tags, Open Graph attributes, GEO contextual copy, and JSON-LD Schema.org payloads
@Service
public class SeoMetadataService {

    private static final String DEFAULT_SITE_URL = "https://unidocs-husc.pages.dev";
    private static final String HUSC_OFFICIAL_NAME = "Trường Đại học Khoa học, Đại học Huế";
    private static final List<String> BRAND_CLUSTER_KEYWORDS = List.of(
            "Trường Đại học Khoa học",
            "Trường Đại học Khoa học Huế",
            "Trường Khoa học Huế",
            "Khoa học Huế",
            "ĐHKH",
            "ĐHKH Huế",
            "HUSC",
            "unidocs",
            "UniDocs",
            "tài liệu đại học",
            "đề thi đại học",
            "chia sẻ tài liệu",
            "ntainguyenit",
            "Tai Nguyen",
            "Tài Nguyễn"
    );

    private final String siteUrl;
    private final ObjectMapper objectMapper;

    @Autowired
    public SeoMetadataService(@Value("${app.site-url:https://unidocs-husc.pages.dev}") String siteUrl) {
        this.siteUrl = normalizeSiteUrl(siteUrl);
        this.objectMapper = new ObjectMapper();
    }

    // Build homepage SEO and GEO metadata preserving brand keyword cluster
    public SeoMetadataDto buildHomepageSeo(List<University> universities) {
        String title = "Trang chủ | UniDocs";
        String description = "Nền tảng chia sẻ tài liệu học tập, đề thi đại học hàng đầu dành cho sinh viên Trường Đại học Khoa học Huế "
                + "(Trường Khoa học Huế, Khoa học Huế, ĐHKH, ĐHKH Huế, HUSC). Miễn phí trên UniDocs.";

        Set<String> keywordSet = new LinkedHashSet<>();
        keywordSet.add("uni doc");
        keywordSet.add("unidoc");
        keywordSet.add("uni docs");
        keywordSet.addAll(BRAND_CLUSTER_KEYWORDS);
        if (universities != null) {
            for (University uni : universities) {
                if (uni != null && hasText(uni.getName())) {
                    keywordSet.add(uni.getName().trim());
                }
            }
        }

        List<Map<String, Object>> graph = new ArrayList<>();
        graph.add(buildWebsiteNode());
        graph.add(buildHuscOrganizationNode(null));

        if (universities != null && !universities.isEmpty()) {
            List<Map<String, Object>> itemList = new ArrayList<>();
            int pos = 1;
            for (University uni : universities) {
                if (uni != null && hasText(uni.getSlug()) && hasText(uni.getName())) {
                    itemList.add(buildListItem(pos++, uni.getName(), siteUrl + "/university/" + uni.getSlug()));
                }
            }
            if (!itemList.isEmpty()) {
                Map<String, Object> itemListNode = new LinkedHashMap<>();
                itemListNode.put("@type", "ItemList");
                itemListNode.put("name", "Danh sách trường đại học trên UniDocs HUSC");
                itemListNode.put("numberOfItems", itemList.size());
                itemListNode.put("itemListElement", itemList);
                graph.add(itemListNode);
            }
        }

        return SeoMetadataDto.builder()
                .title(title)
                .description(description)
                .keywords(String.join(", ", keywordSet))
                .canonicalUrl(siteUrl + "/")
                .ogType("website")
                .ogImage(siteUrl + "/favicon.svg")
                .robots("index, follow")
                .jsonLd(serializeGraph(graph))
                .build();
    }

    // Build dynamic SEO, Open Graph, and JSON-LD metadata for a university faculty directory page
    public SeoMetadataDto buildUniversitySeo(University university, List<Faculty> faculties) {
        String uniName = university != null && hasText(university.getName()) ? university.getName().trim() : HUSC_OFFICIAL_NAME;
        String uniSlug = university != null && hasText(university.getSlug()) ? university.getSlug().trim() : "";
        String canonicalUrl = siteUrl + "/university/" + uniSlug;
        int facultyCount = faculties != null ? faculties.size() : 0;

        String title = uniName + " - Trường Đại học Khoa học Huế (ĐHKH Huế, HUSC) | UniDocs";
        String description = "Danh sách " + facultyCount + " khoa trực thuộc và kho tài liệu, đề thi miễn phí của " + uniName
                + " — Trường Khoa học Huế (Khoa học Huế, ĐHKH, ĐHKH Huế, HUSC) trên UniDocs.";

        Set<String> keywordSet = new LinkedHashSet<>();
        keywordSet.add(uniName);
        keywordSet.add("Danh sách khoa " + uniName);
        keywordSet.add("Các khoa trực thuộc HUSC");
        if (faculties != null) {
            for (int i = 0; i < faculties.size() && i < 15; i++) {
                Faculty f = faculties.get(i);
                if (f != null && hasText(f.getName())) {
                    keywordSet.add(f.getName().trim());
                }
            }
        }
        keywordSet.addAll(BRAND_CLUSTER_KEYWORDS);

        List<Map<String, Object>> departmentNodes = new ArrayList<>();
        List<Map<String, Object>> itemListElements = new ArrayList<>();
        if (faculties != null) {
            int pos = 1;
            for (Faculty faculty : faculties) {
                if (faculty != null && hasText(faculty.getSlug()) && hasText(faculty.getName())) {
                    String facultyUrl = siteUrl + "/faculty/" + faculty.getSlug();
                    departmentNodes.add(buildDepartmentNode(faculty, facultyUrl));
                    itemListElements.add(buildListItem(pos++, faculty.getName(), facultyUrl));
                }
            }
        }

        List<Map<String, Object>> graph = new ArrayList<>();
        graph.add(buildWebsiteNode());
        graph.add(buildHuscOrganizationNode(departmentNodes.isEmpty() ? null : departmentNodes));

        Map<String, Object> collectionPage = new LinkedHashMap<>();
        collectionPage.put("@type", "CollectionPage");
        collectionPage.put("@id", canonicalUrl + "#webpage");
        collectionPage.put("url", canonicalUrl);
        collectionPage.put("name", title);
        collectionPage.put("description", description);
        collectionPage.put("inLanguage", "vi");
        collectionPage.put("keywords", String.join(", ", keywordSet));
        collectionPage.put("about", Map.of("@id", siteUrl + "/#husc"));
        collectionPage.put("sourceOrganization", Map.of("@id", siteUrl + "/#husc"));
        collectionPage.put("isPartOf", Map.of("@id", siteUrl + "/#website"));
        collectionPage.put("publisher", buildPublisherNode());
        collectionPage.put("author", buildAuthorNode());
        if (!itemListElements.isEmpty()) {
            Map<String, Object> mainEntity = new LinkedHashMap<>();
            mainEntity.put("@type", "ItemList");
            mainEntity.put("name", "Danh sách các khoa trực thuộc Trường Đại học Khoa học Huế (HUSC)");
            mainEntity.put("numberOfItems", itemListElements.size());
            mainEntity.put("itemListElement", itemListElements);
            collectionPage.put("mainEntity", mainEntity);
        }
        graph.add(collectionPage);

        graph.add(buildBreadcrumbList(List.of(
                new BreadcrumbItem("Trang chủ", siteUrl + "/"),
                new BreadcrumbItem(uniName, canonicalUrl)
        )));

        String contextualIntro = "Cổng thông tin các khoa trực thuộc " + uniName
                + " — Trường Đại học Khoa học, Đại học Huế (Trường Khoa học Huế, Khoa học Huế, ĐHKH, ĐHKH Huế, HUSC tại TP. Huế). "
                + "Hiện tổng hợp " + facultyCount + " khoa với tài liệu, đề thi và giáo trình học tập miễn phí trên UniDocs (unidocs).";

        return SeoMetadataDto.builder()
                .title(title)
                .description(description)
                .keywords(String.join(", ", keywordSet))
                .canonicalUrl(canonicalUrl)
                .ogType("website")
                .ogImage(resolveAbsoluteImageUrl(university != null ? university.getLogoUrl() : null))
                .robots("index, follow")
                .jsonLd(serializeGraph(graph))
                .contextualIntro(contextualIntro)
                .build();
    }

    // Build dynamic SEO, Open Graph, CollectionPage/EducationalOrganization JSON-LD, and GEO intro for a faculty page
    public SeoMetadataDto buildFacultySeo(Faculty faculty, List<Course> courses) {
        String facultyName = faculty != null && hasText(faculty.getName()) ? faculty.getName().trim() : "Khoa trực thuộc";
        String facultySlug = faculty != null && hasText(faculty.getSlug()) ? faculty.getSlug().trim() : "";
        University university = faculty != null ? faculty.getUniversity() : null;
        String uniName = university != null && hasText(university.getName()) ? university.getName().trim() : HUSC_OFFICIAL_NAME;
        String canonicalUrl = siteUrl + "/faculty/" + facultySlug;
        int courseCount = courses != null ? courses.size() : 0;

        // Apply required faculty title and description formats strictly for Google & AI Search snippets
        String title = facultyName + " - Trường Đại học Khoa học Huế | HUSC UniDocs";
        String description = "Tổng hợp tài liệu, đề thi, giáo trình chính thống của " + facultyName
                + " tại Trường Khoa học Huế (ĐHKH Huế, HUSC). Chia sẻ học tập miễn phí trên UniDocs.";

        Set<String> keywordSet = new LinkedHashSet<>();
        keywordSet.add(facultyName);
        keywordSet.add(facultyName + " HUSC");
        keywordSet.add(facultyName + " ĐHKH Huế");
        keywordSet.add(facultyName + " Khoa học Huế");
        keywordSet.add("tài liệu " + facultyName);
        keywordSet.add("đề thi " + facultyName);
        keywordSet.add("giáo trình " + facultyName);
        keywordSet.add("học phần " + facultyName);
        if (courses != null) {
            for (int i = 0; i < courses.size() && i < 10; i++) {
                Course course = courses.get(i);
                if (course != null && hasText(course.getName())) {
                    keywordSet.add(course.getName().trim());
                }
            }
        }
        keywordSet.addAll(BRAND_CLUSTER_KEYWORDS);

        Map<String, Object> departmentNode = buildDepartmentNode(faculty, canonicalUrl);
        List<Map<String, Object>> graph = new ArrayList<>();
        graph.add(buildWebsiteNode());
        graph.add(buildHuscOrganizationNode(List.of(departmentNode)));

        Map<String, Object> collectionPage = new LinkedHashMap<>();
        collectionPage.put("@type", "CollectionPage");
        collectionPage.put("@id", canonicalUrl + "#webpage");
        collectionPage.put("url", canonicalUrl);
        collectionPage.put("name", title);
        collectionPage.put("description", description);
        collectionPage.put("inLanguage", "vi");
        collectionPage.put("keywords", String.join(", ", keywordSet));
        collectionPage.put("about", Map.of("@id", canonicalUrl + "#department"));
        collectionPage.put("sourceOrganization", Map.of("@id", siteUrl + "/#husc"));
        collectionPage.put("provider", Map.of("@id", siteUrl + "/#husc"));
        collectionPage.put("isPartOf", Map.of("@id", siteUrl + "/#website"));
        collectionPage.put("publisher", buildPublisherNode());
        collectionPage.put("author", buildAuthorNode());

        if (courses != null && !courses.isEmpty()) {
            List<Map<String, Object>> courseItems = new ArrayList<>();
            int pos = 1;
            for (Course course : courses) {
                if (course != null && hasText(course.getSlug()) && hasText(course.getName())) {
                    courseItems.add(buildListItem(pos++, course.getName(), siteUrl + "/course/" + course.getSlug()));
                    if (courseItems.size() >= 50) {
                        break;
                    }
                }
            }
            if (!courseItems.isEmpty()) {
                Map<String, Object> mainEntity = new LinkedHashMap<>();
                mainEntity.put("@type", "ItemList");
                mainEntity.put("name", "Danh sách học phần " + facultyName + " - ĐHKH Huế");
                mainEntity.put("numberOfItems", courses.size());
                mainEntity.put("itemListElement", courseItems);
                collectionPage.put("mainEntity", mainEntity);
            }
        }
        graph.add(collectionPage);

        List<BreadcrumbItem> crumbs = new ArrayList<>();
        crumbs.add(new BreadcrumbItem("Trang chủ", siteUrl + "/"));
        if (university != null && hasText(university.getSlug())) {
            crumbs.add(new BreadcrumbItem(uniName, siteUrl + "/university/" + university.getSlug()));
        }
        crumbs.add(new BreadcrumbItem(facultyName, canonicalUrl));
        graph.add(buildBreadcrumbList(crumbs));

        String contextualIntro = "Kho tài liệu học tập, đề thi và giáo trình chính thống của " + facultyName
                + " trực thuộc Trường Đại học Khoa học, Đại học Huế (Trường Khoa học Huế, Khoa học Huế, ĐHKH, ĐHKH Huế, HUSC tại TP. Huế). "
                + "Hiện có " + courseCount + " học phần được tổng hợp và chia sẻ miễn phí trên UniDocs (unidocs).";

        return SeoMetadataDto.builder()
                .title(title)
                .description(description)
                .keywords(String.join(", ", keywordSet))
                .canonicalUrl(canonicalUrl)
                .ogType("website")
                .ogImage(siteUrl + "/favicon.svg")
                .robots("index, follow")
                .jsonLd(serializeGraph(graph))
                .contextualIntro(contextualIntro)
                .build();
    }

    // Build dynamic SEO, GEO contextual intro, Course/CollectionPage Schema.org markup for a course page
    public SeoMetadataDto buildCourseSeo(Course course, List<Document> approvedDocs) {
        String courseName = course != null && hasText(course.getName()) ? course.getName().trim() : "Học phần";
        String courseSlug = course != null && hasText(course.getSlug()) ? course.getSlug().trim() : "";
        Faculty faculty = course != null ? course.getFaculty() : null;
        String facultyName = faculty != null && hasText(faculty.getName()) ? faculty.getName().trim() : "Trường Đại học Khoa học Huế";
        University university = faculty != null ? faculty.getUniversity() : null;
        String uniName = university != null && hasText(university.getName()) ? university.getName().trim() : HUSC_OFFICIAL_NAME;

        String canonicalUrl = siteUrl + "/course/" + courseSlug;
        int docCount = approvedDocs != null ? approvedDocs.size() : 0;

        // Apply required course title and description formats strictly for Google & AI Search snippets
        String title = "Học phần " + courseName + " - " + facultyName + " | ĐHKH Huế UniDocs";
        String description = "Tải tài liệu, đề thi, bài tập và hướng dẫn học tập học phần " + courseName
                + " thuộc " + facultyName + " - Trường Đại học Khoa học Huế (HUSC). Miễn phí trên UniDocs.";

        Set<String> keywordSet = new LinkedHashSet<>();
        keywordSet.add(courseName);
        keywordSet.add("Học phần " + courseName);
        keywordSet.add(courseName + " HUSC");
        keywordSet.add(courseName + " ĐHKH Huế");
        keywordSet.add(courseName + " Khoa học Huế");
        keywordSet.add("tài liệu " + courseName);
        keywordSet.add("đề thi " + courseName);
        keywordSet.add("giáo trình " + courseName);
        keywordSet.add("bài tập " + courseName);
        keywordSet.add(facultyName);
        keywordSet.addAll(BRAND_CLUSTER_KEYWORDS);

        List<Map<String, Object>> departments = new ArrayList<>();
        if (faculty != null && hasText(faculty.getSlug())) {
            departments.add(buildDepartmentNode(faculty, siteUrl + "/faculty/" + faculty.getSlug()));
        }

        List<Map<String, Object>> graph = new ArrayList<>();
        graph.add(buildWebsiteNode());
        graph.add(buildHuscOrganizationNode(departments.isEmpty() ? null : departments));

        Map<String, Object> courseNode = new LinkedHashMap<>();
        courseNode.put("@type", "Course");
        courseNode.put("@id", canonicalUrl + "#course");
        courseNode.put("name", courseName);
        courseNode.put("alternateName", List.of(
                "Học phần " + courseName,
                courseName + " - " + facultyName,
                courseName + " HUSC",
                courseName + " ĐHKH Huế"
        ));
        courseNode.put("description", description);
        courseNode.put("url", canonicalUrl);
        courseNode.put("inLanguage", "vi");
        courseNode.put("isAccessibleForFree", true);
        courseNode.put("provider", Map.of("@id", siteUrl + "/#husc"));
        if (faculty != null && hasText(faculty.getSlug())) {
            courseNode.put("about", Map.of("@id", siteUrl + "/faculty/" + faculty.getSlug() + "#department"));
            courseNode.put("isPartOf", Map.of(
                    "@type", "CollectionPage",
                    "name", facultyName,
                    "url", siteUrl + "/faculty/" + faculty.getSlug()
            ));
        } else {
            courseNode.put("about", Map.of("@type", "Thing", "name", facultyName));
        }
        graph.add(courseNode);

        Map<String, Object> collectionPage = new LinkedHashMap<>();
        collectionPage.put("@type", "CollectionPage");
        collectionPage.put("@id", canonicalUrl + "#webpage");
        collectionPage.put("url", canonicalUrl);
        collectionPage.put("name", title);
        collectionPage.put("description", description);
        collectionPage.put("inLanguage", "vi");
        collectionPage.put("keywords", String.join(", ", keywordSet));
        collectionPage.put("about", Map.of("@id", canonicalUrl + "#course"));
        collectionPage.put("sourceOrganization", Map.of("@id", siteUrl + "/#husc"));
        collectionPage.put("isPartOf", Map.of("@id", siteUrl + "/#website"));
        collectionPage.put("publisher", buildPublisherNode());
        collectionPage.put("author", buildAuthorNode());

        if (approvedDocs != null && !approvedDocs.isEmpty()) {
            List<Map<String, Object>> docItems = new ArrayList<>();
            int pos = 1;
            for (Document doc : approvedDocs) {
                if (doc != null && hasText(doc.getSlug()) && hasText(doc.getTitle())) {
                    docItems.add(buildListItem(pos++, doc.getTitle(), siteUrl + "/document/" + doc.getSlug() + "/view"));
                    if (docItems.size() >= 25) {
                        break;
                    }
                }
            }
            if (!docItems.isEmpty()) {
                Map<String, Object> mainEntity = new LinkedHashMap<>();
                mainEntity.put("@type", "ItemList");
                mainEntity.put("name", "Tài liệu & đề thi học phần " + courseName + " - HUSC");
                mainEntity.put("numberOfItems", approvedDocs.size());
                mainEntity.put("itemListElement", docItems);
                collectionPage.put("mainEntity", mainEntity);
            }
        }
        graph.add(collectionPage);

        List<BreadcrumbItem> crumbs = new ArrayList<>();
        crumbs.add(new BreadcrumbItem("Trang chủ", siteUrl + "/"));
        if (university != null && hasText(university.getSlug())) {
            crumbs.add(new BreadcrumbItem(uniName, siteUrl + "/university/" + university.getSlug()));
        }
        if (faculty != null && hasText(faculty.getSlug())) {
            crumbs.add(new BreadcrumbItem(facultyName, siteUrl + "/faculty/" + faculty.getSlug()));
        }
        crumbs.add(new BreadcrumbItem(courseName, canonicalUrl));
        graph.add(buildBreadcrumbList(crumbs));

        // Craft natural-language GEO AI contextual intro embedding all school aliases and location markers
        String contextualIntro = "Học phần " + courseName + " thuộc " + facultyName
                + " — Trường Đại học Khoa học, Đại học Huế (Trường Khoa học Huế, Khoa học Huế, ĐHKH, ĐHKH Huế, HUSC tại TP. Huế). "
                + "Trang cung cấp tài liệu học tập, đề thi, giáo trình, bài tập và hướng dẫn ôn thi học phần " + courseName
                + " được cộng đồng sinh viên chia sẻ miễn phí trên UniDocs (unidocs).";
        String contextualSummary = docCount > 0
                ? "Hiện học phần đang lưu trữ " + docCount + " tài liệu và đề thi đã được kiểm duyệt, hỗ trợ xem trực tuyến và tải xuống miễn phí không cần đăng nhập."
                : "Sinh viên HUSC có thể xem, ôn tập và đóng góp thêm tài liệu mới cho học phần này hoàn toàn miễn phí không cần đăng nhập.";

        return SeoMetadataDto.builder()
                .title(title)
                .description(description)
                .keywords(String.join(", ", keywordSet))
                .canonicalUrl(canonicalUrl)
                .ogType("website")
                .ogImage(siteUrl + "/favicon.svg")
                .robots("index, follow")
                .jsonLd(serializeGraph(graph))
                .contextualIntro(contextualIntro)
                .contextualSummary(contextualSummary)
                .build();
    }

    // Build dynamic SEO and LearningResource JSON-LD metadata for an individual document viewer page
    public SeoMetadataDto buildDocumentSeo(Document document) {
        String docTitle = document != null && hasText(document.getTitle()) ? document.getTitle().trim() : "Tài liệu học tập";
        String docSlug = document != null && hasText(document.getSlug()) ? document.getSlug().trim() : "";
        Course course = document != null ? document.getCourse() : null;
        Faculty faculty = course != null ? course.getFaculty() : null;
        String courseName = course != null && hasText(course.getName()) ? course.getName().trim() : "Học phần HUSC";
        String facultyName = faculty != null && hasText(faculty.getName()) ? faculty.getName().trim() : "Trường Đại học Khoa học Huế";
        String canonicalUrl = siteUrl + "/document/" + docSlug + "/view";

        String title = docTitle + " - Học phần " + courseName + " | ĐHKH Huế UniDocs";
        String description = "Xem và tải miễn phí tài liệu \"" + docTitle + "\" thuộc học phần " + courseName
                + ", " + facultyName + " - Trường Đại học Khoa học Huế (Trường Khoa học Huế, Khoa học Huế, ĐHKH Huế, HUSC) trên UniDocs.";

        Set<String> keywordSet = new LinkedHashSet<>();
        keywordSet.add(docTitle);
        keywordSet.add(courseName);
        keywordSet.add(facultyName);
        keywordSet.addAll(BRAND_CLUSTER_KEYWORDS);

        List<Map<String, Object>> graph = new ArrayList<>();
        graph.add(buildWebsiteNode());
        graph.add(buildHuscOrganizationNode(null));

        Map<String, Object> learningResource = new LinkedHashMap<>();
        learningResource.put("@type", "LearningResource");
        learningResource.put("@id", canonicalUrl + "#resource");
        learningResource.put("name", docTitle);
        learningResource.put("description", description);
        learningResource.put("url", canonicalUrl);
        learningResource.put("inLanguage", "vi");
        learningResource.put("isAccessibleForFree", true);
        learningResource.put("provider", Map.of("@id", siteUrl + "/#husc"));
        if (course != null && hasText(course.getSlug())) {
            learningResource.put("isPartOf", Map.of(
                    "@type", "Course",
                    "name", courseName,
                    "url", siteUrl + "/course/" + course.getSlug()
            ));
        }
        graph.add(learningResource);

        return SeoMetadataDto.builder()
                .title(title)
                .description(description)
                .keywords(String.join(", ", keywordSet))
                .canonicalUrl(canonicalUrl)
                .ogType("article")
                .ogImage(siteUrl + "/favicon.svg")
                .robots("index, follow")
                .jsonLd(serializeGraph(graph))
                .build();
    }

    // Build shared WebSite Schema.org node inheriting historical UniDocs attribution
    private Map<String, Object> buildWebsiteNode() {
        Map<String, Object> website = new LinkedHashMap<>();
        website.put("@type", "WebSite");
        website.put("@id", siteUrl + "/#website");
        website.put("name", "UniDocs");
        website.put("alternateName", List.of("uni doc", "unidoc", "uni docs", "unidocs", "UniDocs HUSC", "HUSC", "ĐHKH Huế"));
        website.put("url", siteUrl);
        website.put("description", "Nền tảng chia sẻ tài liệu học tập, đề thi đại học dành cho sinh viên Trường Đại học Khoa học Huế (HUSC, ĐHKH Huế)");
        website.put("author", buildAuthorNode());
        website.put("creator", buildPersonSummaryNode());
        website.put("publisher", buildPublisherNode());
        return website;
    }

    // Build EducationalOrganization Schema.org node for HUSC with optional affiliated faculty departments
    private Map<String, Object> buildHuscOrganizationNode(List<Map<String, Object>> departments) {
        Map<String, Object> org = new LinkedHashMap<>();
        org.put("@type", "EducationalOrganization");
        org.put("@id", siteUrl + "/#husc");
        org.put("name", HUSC_OFFICIAL_NAME);
        org.put("alternateName", List.of(
                "Trường Đại học Khoa học",
                "Trường Đại học Khoa học Huế",
                "Trường Khoa học Huế",
                "Khoa học Huế",
                "ĐHKH",
                "ĐHKH Huế",
                "HUSC",
                "unidocs"
        ));
        org.put("url", siteUrl);

        Map<String, Object> address = new LinkedHashMap<>();
        address.put("@type", "PostalAddress");
        address.put("streetAddress", "77 Nguyễn Huệ");
        address.put("addressLocality", "Thành phố Huế");
        address.put("addressCountry", "VN");
        org.put("address", address);

        if (departments != null && !departments.isEmpty()) {
            org.put("department", departments.size() == 1 ? departments.get(0) : departments);
        }
        return org;
    }

    // Build department node linked to a specific faculty page and parent HUSC organization
    private Map<String, Object> buildDepartmentNode(Faculty faculty, String facultyUrl) {
        String name = faculty != null && hasText(faculty.getName()) ? faculty.getName().trim() : "Khoa trực thuộc";
        Map<String, Object> dept = new LinkedHashMap<>();
        dept.put("@type", "EducationalOrganization");
        dept.put("@id", facultyUrl + "#department");
        dept.put("name", name);
        dept.put("alternateName", List.of(
                name + " HUSC",
                name + " ĐHKH Huế",
                name + " Khoa học Huế",
                name + " - Trường Đại học Khoa học Huế"
        ));
        dept.put("url", facultyUrl);
        dept.put("parentOrganization", Map.of("@id", siteUrl + "/#husc"));
        return dept;
    }

    // Build ListItem Schema.org entry for ItemList collections
    private Map<String, Object> buildListItem(int position, String name, String url) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("@type", "ListItem");
        item.put("position", position);
        item.put("name", name);
        item.put("url", url);
        return item;
    }

    // Build BreadcrumbList Schema.org node for search engine sitelink clarity
    private Map<String, Object> buildBreadcrumbList(List<BreadcrumbItem> items) {
        List<Map<String, Object>> elements = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            BreadcrumbItem crumb = items.get(i);
            Map<String, Object> el = new LinkedHashMap<>();
            el.put("@type", "ListItem");
            el.put("position", i + 1);
            el.put("name", crumb.name);
            el.put("item", crumb.url);
            elements.add(el);
        }
        Map<String, Object> list = new LinkedHashMap<>();
        list.put("@type", "BreadcrumbList");
        list.put("itemListElement", elements);
        return list;
    }

    private Map<String, Object> buildAuthorNode() {
        Map<String, Object> author = new LinkedHashMap<>();
        author.put("@type", "Person");
        author.put("name", "Tài Nguyễn (ntainguyenit)");
        author.put("alternateName", "Tai Nguyen");
        author.put("url", "https://github.com/ntainguyenit");
        return author;
    }

    private Map<String, Object> buildPersonSummaryNode() {
        Map<String, Object> creator = new LinkedHashMap<>();
        creator.put("@type", "Person");
        creator.put("name", "Tài Nguyễn (ntainguyenit)");
        return creator;
    }

    private Map<String, Object> buildPublisherNode() {
        Map<String, Object> logo = new LinkedHashMap<>();
        logo.put("@type", "ImageObject");
        logo.put("url", siteUrl + "/favicon.svg");

        Map<String, Object> publisher = new LinkedHashMap<>();
        publisher.put("@type", "Organization");
        publisher.put("name", "UniDocs HUSC");
        publisher.put("alternateName", List.of("unidocs", "UniDocs", "HUSC UniDocs"));
        publisher.put("url", siteUrl);
        publisher.put("logo", logo);
        return publisher;
    }

    // Serialize JSON-LD graph while escaping HTML angle brackets to prevent script tag breakout
    private String serializeGraph(List<Map<String, Object>> graph) {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("@context", "https://schema.org");
        root.put("@graph", graph);
        try {
            String rawJson = objectMapper.writeValueAsString(root);
            return rawJson.replace("<", "\\u003c").replace(">", "\\u003e");
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String resolveAbsoluteImageUrl(String pathOrUrl) {
        if (!hasText(pathOrUrl)) {
            return siteUrl + "/favicon.svg";
        }
        String trimmed = pathOrUrl.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        if (trimmed.startsWith("/")) {
            return siteUrl + trimmed;
        }
        return siteUrl + "/" + trimmed;
    }

    private String normalizeSiteUrl(String url) {
        if (!hasText(url)) {
            return DEFAULT_SITE_URL;
        }
        return url.trim().replaceAll("/+$", "");
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static class BreadcrumbItem {
        final String name;
        final String url;

        BreadcrumbItem(String name, String url) {
            this.name = name;
            this.url = url;
        }
    }
}
