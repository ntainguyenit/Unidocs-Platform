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

// Builds dynamic SEO meta tags, Open Graph attributes, GEO copy, and AEO Schema.org JSON-LD payloads
@Service
public class SeoMetadataService {

    private static final String DEFAULT_SITE_URL = "https://unidocs-husc.pages.dev";
    private static final String AEO_ROBOTS_DIRECTIVE = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
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
        graph.add(buildSpeakableWebPageNode(
                siteUrl + "/#webpage",
                siteUrl + "/",
                title,
                description,
                List.of(".aeo-speakable", "#section-faq"),
                siteUrl + "/#faq"
        ));
        graph.add(buildFaqPageNode(siteUrl + "/#faq", List.of(
                new FaqItem(
                        "UniDocs (UniDocs HUSC) là gì?",
                        "UniDocs là nền tảng chia sẻ tài liệu học tập, đề thi đại học, giáo trình, thông báo UMS và hơn 30 tiện ích sinh viên miễn phí dành cho sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC, ĐHKH Huế)."
                ),
                new FaqItem(
                        "Tải tài liệu và đề thi trên UniDocs có mất phí hoặc cần đăng nhập không?",
                        "Không. Toàn bộ tài liệu, slide bài giảng và đề thi đã kiểm duyệt trên UniDocs đều hoàn toàn miễn phí và sinh viên có thể xem trực tuyến hoặc tải xuống ngay mà không cần tạo tài khoản."
                ),
                new FaqItem(
                        "Làm thế nào để đóng góp tài liệu, đề thi lên UniDocs?",
                        "Sinh viên chỉ cần mở đúng học phần hoặc nhấn nút tải lên tài liệu trên trang học phần, chọn tệp PDF/DOCX/PPTX và gửi duyệt. Tài liệu sẽ được kiểm duyệt tự động và phê duyệt nhanh trước khi công khai."
                ),
                new FaqItem(
                        "UniDocs có những tiện ích học tập nào nổi bật cho sinh viên HUSC?",
                        "Ngoài kho tài liệu và đề thi theo khoa, UniDocs cung cấp hơn 30 công cụ sinh viên như giả lập phòng thi, flashcards ôn tập, thời khóa biểu, sơ đồ tư duy nhanh, đếm ngược mùa thi, nhóm học tập và thông báo UMS."
                ),
                new FaqItem(
                        "Ai là người phát triển nền tảng UniDocs HUSC?",
                        "UniDocs được phát triển bởi Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyenit) nhằm hỗ trợ cộng đồng sinh viên Trường Đại học Khoa học, Đại học Huế tra cứu và chia sẻ tài liệu học tập miễn phí."
                )
        )));
        graph.add(buildHowToNode(
                siteUrl + "/#howto",
                "Cách tìm và tải tài liệu, đề thi Trường Đại học Khoa học Huế trên UniDocs",
                "Hướng dẫn 3 bước nhanh giúp sinh viên HUSC tìm kiếm và tải xuống đề thi, giáo trình miễn phí trên UniDocs.",
                List.of(
                        new HowToStepItem("Chọn Trường và Khoa trực thuộc", "Truy cập trang chủ UniDocs và chọn Trường Đại học Khoa học, Đại học Huế cùng Khoa tương ứng."),
                        new HowToStepItem("Mở Học phần cần ôn tập", "Chọn đúng học phần trong danh sách môn học của khoa hoặc tìm trực tiếp theo tên học phần."),
                        new HowToStepItem("Xem trực tuyến hoặc tải xuống miễn phí", "Nhấn vào tài liệu hoặc đề thi đã kiểm duyệt để đọc trực tiếp trên trình duyệt hoặc tải về máy không cần đăng nhập.")
                )
        ));

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
                .robots(AEO_ROBOTS_DIRECTIVE)
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
        collectionPage.put("speakable", buildSpeakableSpec(List.of("section[aria-label='Giới thiệu tổng quan các khoa trực thuộc']")));
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
                .robots(AEO_ROBOTS_DIRECTIVE)
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
        collectionPage.put("speakable", buildSpeakableSpec(List.of("section[aria-label='Giới thiệu tài liệu và học phần của khoa']")));

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
        graph.add(buildFaqPageNode(canonicalUrl + "#faq", List.of(
                new FaqItem(
                        facultyName + " tại Trường Đại học Khoa học Huế có những tài liệu gì trên UniDocs?",
                        "Trang " + facultyName + " trên UniDocs hiện tổng hợp " + courseCount
                                + " học phần với kho đề thi, giáo trình, slide bài giảng và bài tập ôn thi của sinh viên Trường Đại học Khoa học, Đại học Huế (HUSC)."
                ),
                new FaqItem(
                        "Tải đề thi và giáo trình " + facultyName + " trên UniDocs có miễn phí không?",
                        "Hoàn toàn miễn phí. Sinh viên có thể mở trực tiếp từng học phần thuộc " + facultyName + " để xem và tải tài liệu đã kiểm duyệt mà không cần đăng nhập."
                )
        )));

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
                .robots(AEO_ROBOTS_DIRECTIVE)
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
        collectionPage.put("speakable", buildSpeakableSpec(List.of("section[aria-label='Giới thiệu ngữ cảnh học phần']")));

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
        graph.add(buildFaqPageNode(canonicalUrl + "#faq", List.of(
                new FaqItem(
                        "Tài liệu và đề thi học phần " + courseName + " (" + facultyName + " - HUSC) gồm những gì?",
                        "Học phần " + courseName + " thuộc " + facultyName + " — Trường Đại học Khoa học, Đại học Huế hiện có " + docCount
                                + " tài liệu đã kiểm duyệt gồm đề thi, giáo trình, bài tập và tài liệu ôn tập chia sẻ miễn phí trên UniDocs."
                ),
                new FaqItem(
                        "Tải tài liệu học phần " + courseName + " trên UniDocs có cần đăng nhập không?",
                        "Không cần đăng nhập. Sinh viên HUSC có thể xem trước trực tuyến và tải xuống miễn phí toàn bộ tài liệu đã duyệt của học phần " + courseName + "."
                )
        )));

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
                .robots(AEO_ROBOTS_DIRECTIVE)
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
                .robots(AEO_ROBOTS_DIRECTIVE)
                .jsonLd(serializeGraph(graph))
                .build();
    }

    // Build SEO, GEO, and AEO (InteractiveModel, FAQPage, HowTo, Speakable WebPage) metadata for /husc-campus
    public SeoMetadataDto buildHuscCampusSeo() {
        String title = "Khám phá Khuôn viên 3D - Trường Đại học Khoa học Huế (HUSC) | UniDocs";
        String description = "Khám phá khuôn viên 3D Trường Đại học Khoa học Huế (HUSC, ĐHKH Huế) trực tuyến trên UniDocs với sơ đồ giảng đường, góc quay flycam và trải nghiệm WebGL tại 77 Nguyễn Huệ.";
        String canonicalUrl = siteUrl + "/husc-campus";
        String author = "Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyen.it@gmail.com)";

        // Include all required lowercase keyword variants plus institutional brand cluster terms
        Set<String> keywordSet = new LinkedHashSet<>();
        keywordSet.add("husc campus 3d");
        keywordSet.add("sơ đồ 3d trường đại học khoa học huế");
        keywordSet.add("đhkh huế");
        keywordSet.add("husc");
        keywordSet.add("unidocs");
        keywordSet.add("tài nguyễn");
        keywordSet.add("nguyễn ngọc thành tài");
        keywordSet.add("ntainguyenit");
        keywordSet.add("HUSC Campus 3D");
        keywordSet.add("Khám phá Trường 3D HUSC");
        keywordSet.add("77 Nguyễn Huệ");
        keywordSet.addAll(BRAND_CLUSTER_KEYWORDS);
        String keywords = String.join(", ", keywordSet);

        Map<String, Object> authorNode = buildCampusAuthorNode();
        Map<String, Object> universityNode = buildHuscCollegeOrUniversityNode();

        Map<String, Object> interactiveModel = new LinkedHashMap<>();
        interactiveModel.put("@type", "InteractiveModel");
        interactiveModel.put("@id", canonicalUrl + "#model");
        interactiveModel.put("additionalType", "https://schema.org/3DModel");
        interactiveModel.put("name", "Sơ đồ 3D Khuôn viên Trường Đại học Khoa học Huế (HUSC Campus 3D)");
        interactiveModel.put("alternateName", List.of(
                "HUSC Campus 3D",
                "Sơ đồ 3D Trường Đại học Khoa học Huế",
                "Bản đồ 3D ĐHKH Huế",
                "Khám phá Khuôn viên 3D HUSC"
        ));
        interactiveModel.put("description", description);
        interactiveModel.put("url", canonicalUrl);
        interactiveModel.put("contentUrl", siteUrl + "/models/husc-campus.glb");
        interactiveModel.put("encodingFormat", "model/gltf-binary");
        interactiveModel.put("thumbnailUrl", siteUrl + "/images/campus-map.jpeg");
        interactiveModel.put("inLanguage", "vi");
        interactiveModel.put("isAccessibleForFree", true);
        interactiveModel.put("keywords", keywords);
        interactiveModel.put("about", Map.of("@id", siteUrl + "/#husc-university"));
        interactiveModel.put("spatialCoverage", Map.of("@id", siteUrl + "/#husc-university"));
        interactiveModel.put("featureList", List.of(
                "Mô hình 3D WebGL toàn bộ khuôn viên Trường Đại học Khoa học, Đại học Huế tại 77 Nguyễn Huệ và 38 Đống Đa",
                "3 góc nhìn tương tác: Toàn cảnh Flycam, Góc nhìn thứ 3 và Góc nhìn thứ 1",
                "Bản đồ 2D tích hợp dịch chuyển nhanh tới Nhà A, A1-A2, B, C, D, E, F, G, H, K, M, Sân bóng đá, Sân bóng rổ",
                "Chế độ Sáng, Hoàng hôn, Ban đêm sống động cùng giao thông, người đi bộ và chụp ảnh lưu niệm 3D"
        ));
        interactiveModel.put("author", authorNode);
        interactiveModel.put("creator", Map.of("@id", siteUrl + "/#author"));
        interactiveModel.put("publisher", buildPublisherNode());
        interactiveModel.put("isPartOf", Map.of("@id", siteUrl + "/#website"));

        List<Map<String, Object>> graph = new ArrayList<>();
        graph.add(buildWebsiteNode(authorNode));
        graph.add(universityNode);
        graph.add(interactiveModel);
        graph.add(buildSpeakableWebPageNode(
                canonicalUrl + "#webpage",
                canonicalUrl,
                title,
                description,
                List.of(".aeo-campus-summary"),
                canonicalUrl + "#model"
        ));
        graph.add(buildFaqPageNode(canonicalUrl + "#faq", List.of(
                new FaqItem(
                        "HUSC Campus 3D (/husc-campus) là gì?",
                        "HUSC Campus 3D là mô hình 3D WebGL tương tác trực tuyến trên UniDocs tái hiện toàn bộ khuôn viên Trường Đại học Khoa học, Đại học Huế tại địa chỉ 77 Nguyễn Huệ và 38 Đống Đa, TP. Huế do Tài Nguyễn (ntainguyenit) phát triển."
                ),
                new FaqItem(
                        "Khuôn viên 3D Trường Đại học Khoa học Huế gồm những tòa nhà và khu vực nào?",
                        "Mô hình bao gồm Cổng chính 77 Nguyễn Huệ, Cổng 38 Đống Đa, dãy giảng đường Nhà A, A1-A2, B, C, D (Khoa Hóa học), E, F, G, H, K, M, Nhà Thí nghiệm, Nhà Khách, Sân bóng đá, Sân bóng rổ cùng hệ thống đường Nguyễn Huệ, Lý Thường Kiệt và Đống Đa."
                ),
                new FaqItem(
                        "Làm thế nào để di chuyển và tham quan trên HUSC Campus 3D?",
                        "Người dùng có thể chuyển đổi giữa 3 góc nhìn (Toàn cảnh Flycam, Góc nhìn thứ 3, Góc nhìn thứ 1), di chuyển bằng phím WASD hoặc mũi tên trên máy tính và joystick ảo trên điện thoại, mở bản đồ 2D để dịch chuyển tức thời, chuyển đổi chế độ Ngày/Đêm và chụp ảnh lưu niệm."
                ),
                new FaqItem(
                        "HUSC Campus 3D có chạy được trên điện thoại và có miễn phí không?",
                        "Có. HUSC Campus 3D hoàn toàn miễn phí, chạy trực tiếp trên trình duyệt Desktop và Mobile (WebGL/Three.js) không cần cài đặt ứng dụng và tự động điều chỉnh chất lượng đồ họa để giữ khung hình mượt mà."
                )
        )));
        graph.add(buildHowToNode(
                canonicalUrl + "#howto",
                "Cách tham quan khuôn viên 3D Trường Đại học Khoa học Huế trực tuyến",
                "Hướng dẫn 4 bước khám phá toàn bộ giảng đường, sân thể thao và khung cảnh 3D của HUSC trực tiếp trên trình duyệt.",
                List.of(
                        new HowToStepItem("Mở đường dẫn /husc-campus", "Truy cập trang HUSC Campus 3D trên trình duyệt máy tính hoặc điện thoại để tải mô hình WebGL."),
                        new HowToStepItem("Chọn góc nhìn phù hợp", "Dùng nút chuyển góc nhìn để quan sát Toàn cảnh Flycam, đi bộ ở Góc nhìn thứ 3 hoặc trải nghiệm Góc nhìn thứ 1."),
                        new HowToStepItem("Di chuyển hoặc dịch chuyển nhanh qua Bản đồ 2D", "Điều khiển bằng phím WASD/joystick ảo hoặc chạm vào bản đồ góc trên trái để dịch chuyển ngay tới từng giảng đường Nhà A đến Nhà M."),
                        new HowToStepItem("Chuyển Ngày/Đêm và chụp ảnh lưu niệm", "Bấm biểu tượng Mặt trời/Mặt trăng để đổi ánh sáng Ngày, Hoàng hôn, Đêm và bấm nút máy ảnh để lưu lại khoảnh khắc 3D.")
                )
        ));
        graph.add(buildBreadcrumbList(List.of(
                new BreadcrumbItem("Trang chủ", siteUrl + "/"),
                new BreadcrumbItem("Khám phá Trường 3D HUSC", canonicalUrl)
        )));

        String contextualIntro = "Sơ đồ mô hình 3D tương tác khuôn viên Trường Đại học Khoa học, Đại học Huế "
                + "(HUSC, ĐHKH Huế) tại địa chỉ 77 Nguyễn Huệ, Thành phố Huế, phát triển bởi Tài Nguyễn "
                + "(Nguyễn Ngọc Thành Tài - ntainguyenit) trên hệ thống UniDocs.";

        return SeoMetadataDto.builder()
                .title(title)
                .description(description)
                .keywords(keywords)
                .author(author)
                .canonicalUrl(canonicalUrl)
                .ogType("website")
                .ogImage(siteUrl + "/images/campus-map.jpeg")
                .robots(AEO_ROBOTS_DIRECTIVE)
                .jsonLd(serializeGraph(graph))
                .contextualIntro(contextualIntro)
                .build();
    }

    // Build shared WebSite Schema.org node inheriting historical UniDocs attribution
    private Map<String, Object> buildWebsiteNode() {
        return buildWebsiteNode(buildAuthorNode());
    }

    // Build shared WebSite Schema.org node with explicit author node attribution
    private Map<String, Object> buildWebsiteNode(Map<String, Object> authorNode) {
        Map<String, Object> website = new LinkedHashMap<>();
        website.put("@type", "WebSite");
        website.put("@id", siteUrl + "/#website");
        website.put("name", "UniDocs");
        website.put("alternateName", List.of("uni doc", "unidoc", "uni docs", "unidocs", "UniDocs HUSC", "HUSC", "ĐHKH Huế"));
        website.put("url", siteUrl);
        website.put("description", "Nền tảng chia sẻ tài liệu học tập, đề thi đại học dành cho sinh viên Trường Đại học Khoa học Huế (HUSC, ĐHKH Huế)");
        website.put("author", authorNode);
        website.put("creator", buildPersonSummaryNode());
        website.put("publisher", buildPublisherNode());
        website.put("inLanguage", "vi");

        // Declare SearchAction so Answer Engines and Google sitelinks understand site query routing
        Map<String, Object> searchTarget = new LinkedHashMap<>();
        searchTarget.put("@type", "EntryPoint");
        searchTarget.put("urlTemplate", siteUrl + "/?q={search_term_string}");
        Map<String, Object> searchAction = new LinkedHashMap<>();
        searchAction.put("@type", "SearchAction");
        searchAction.put("target", searchTarget);
        searchAction.put("query-input", "required name=search_term_string");
        website.put("potentialAction", searchAction);
        return website;
    }

    // Build SpeakableSpecification for voice assistants and Answer Engine direct extraction
    private Map<String, Object> buildSpeakableSpec(List<String> cssSelectors) {
        Map<String, Object> speakable = new LinkedHashMap<>();
        speakable.put("@type", "SpeakableSpecification");
        speakable.put("cssSelector", cssSelectors);
        return speakable;
    }

    // Build WebPage node carrying SpeakableSpecification and primary entity links for AEO
    private Map<String, Object> buildSpeakableWebPageNode(String id,
                                                          String url,
                                                          String name,
                                                          String description,
                                                          List<String> cssSelectors,
                                                          String mainEntityId) {
        Map<String, Object> page = new LinkedHashMap<>();
        page.put("@type", "WebPage");
        page.put("@id", id);
        page.put("url", url);
        page.put("name", name);
        page.put("description", description);
        page.put("inLanguage", "vi");
        page.put("isPartOf", Map.of("@id", siteUrl + "/#website"));
        if (hasText(mainEntityId)) {
            page.put("mainEntity", Map.of("@id", mainEntityId));
        }
        page.put("speakable", buildSpeakableSpec(cssSelectors));
        return page;
    }

    // Build FAQPage Schema.org node providing direct Q&A citations for Answer Engines
    private Map<String, Object> buildFaqPageNode(String id, List<FaqItem> items) {
        List<Map<String, Object>> mainEntity = new ArrayList<>();
        for (FaqItem item : items) {
            Map<String, Object> answer = new LinkedHashMap<>();
            answer.put("@type", "Answer");
            answer.put("text", item.answer);

            Map<String, Object> question = new LinkedHashMap<>();
            question.put("@type", "Question");
            question.put("name", item.question);
            question.put("acceptedAnswer", answer);
            mainEntity.add(question);
        }
        Map<String, Object> faq = new LinkedHashMap<>();
        faq.put("@type", "FAQPage");
        faq.put("@id", id);
        faq.put("inLanguage", "vi");
        faq.put("mainEntity", mainEntity);
        return faq;
    }

    // Build HowTo Schema.org node guiding users and AI assistants step-by-step
    private Map<String, Object> buildHowToNode(String id, String name, String description, List<HowToStepItem> steps) {
        List<Map<String, Object>> stepNodes = new ArrayList<>();
        for (int i = 0; i < steps.size(); i++) {
            HowToStepItem s = steps.get(i);
            Map<String, Object> step = new LinkedHashMap<>();
            step.put("@type", "HowToStep");
            step.put("position", i + 1);
            step.put("name", s.name);
            step.put("text", s.text);
            stepNodes.add(step);
        }
        Map<String, Object> howTo = new LinkedHashMap<>();
        howTo.put("@type", "HowTo");
        howTo.put("@id", id);
        howTo.put("name", name);
        howTo.put("description", description);
        howTo.put("inLanguage", "vi");
        howTo.put("step", stepNodes);
        return howTo;
    }

    // Build CollegeOrUniversity Schema.org node highlighting HUSC physical campus address for GEO AI
    private Map<String, Object> buildHuscCollegeOrUniversityNode() {
        Map<String, Object> university = new LinkedHashMap<>();
        university.put("@type", "CollegeOrUniversity");
        university.put("@id", siteUrl + "/#husc-university");
        university.put("name", HUSC_OFFICIAL_NAME);
        university.put("alternateName", List.of(
                "HUSC",
                "ĐHKH Huế",
                "Trường Đại học Khoa học Huế",
                "Trường Khoa học Huế",
                "Khoa học Huế",
                "ĐHKH"
        ));
        university.put("url", siteUrl);
        university.put("sameAs", "https://husc.edu.vn/");

        Map<String, Object> address = new LinkedHashMap<>();
        address.put("@type", "PostalAddress");
        address.put("streetAddress", "77 Nguyễn Huệ");
        address.put("addressLocality", "Thành phố Huế");
        address.put("addressCountry", "VN");
        university.put("address", address);
        return university;
    }

    // Build detailed Person Schema.org node identifying author name, aliases, email, and profile URLs
    private Map<String, Object> buildCampusAuthorNode() {
        Map<String, Object> author = new LinkedHashMap<>();
        author.put("@type", "Person");
        author.put("@id", siteUrl + "/#author");
        author.put("name", "Tài Nguyễn");
        author.put("alternateName", List.of("Nguyễn Ngọc Thành Tài", "Tai Nguyen", "ntainguyenit"));
        author.put("email", "ntainguyen.it@gmail.com");
        author.put("url", "https://github.com/ntainguyenit");
        author.put("sameAs", List.of(
                "https://github.com/ntainguyenit",
                "https://www.facebook.com/ntainguyenit"
        ));
        return author;
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

    private static class FaqItem {
        final String question;
        final String answer;

        FaqItem(String question, String answer) {
            this.question = question;
            this.answer = answer;
        }
    }

    private static class HowToStepItem {
        final String name;
        final String text;

        HowToStepItem(String name, String text) {
            this.name = name;
            this.text = text;
        }
    }
}
