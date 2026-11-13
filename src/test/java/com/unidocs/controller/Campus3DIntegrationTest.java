package com.unidocs.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Verify /husc-campus view, legacy /utilities/campus-3d removal, GLB asset, vendor ES modules, homepage removal, and sitemap inclusion
@SpringBootTest
class Campus3DIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void campus3dPage_RendersStandaloneWebGLHudWithoutSecurityMonitorBlocking() throws Exception {
        // Verify /husc-campus returns OK, native modal dialogs, text-only HUD controls, and excludes blocker scripts
        mockMvc.perform(get("/husc-campus"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("id=\"campusCanvas\"")))
                .andExpect(content().string(containsString("viewport-fit=cover")))
                .andExpect(content().string(containsString("100dvh")))
                .andExpect(content().string(containsString("closedby=\"any\"")))
                .andExpect(content().string(containsString("\"/vendor/three/three.module.js\"")))
                .andExpect(content().string(containsString("<p class=\"loading-eyebrow\">HUSC CAMPUS</p>")))
                .andExpect(content().string(containsString("<h1 class=\"loading-title\">Trường Đại học Khoa học - Đại học Huế</h1>")))
                .andExpect(content().string(containsString("<h1>TRƯỜNG ĐẠI HỌC KHOA HỌC - ĐH HUẾ</h1>")))
                .andExpect(content().string(containsString("<p>GÓC NHÌN TOÀN CẢNH</p>")))
                .andExpect(content().string(containsString("id=\"skipIntroBtn\" type=\"button\" class=\"skip-intro-btn\" aria-label=\"Bỏ qua\"")))
                .andExpect(content().string(containsString("<span>Bỏ qua</span>")))
                .andExpect(content().string(not(containsString(">Sổ tay</button>"))))
                .andExpect(content().string(not(containsString("handbookDialog"))))
                .andExpect(content().string(not(containsString(">Bộ sưu tập</button>"))))
                .andExpect(content().string(containsString("id=\"openMenuBtn\" type=\"button\" class=\"hud-btn hud-icon-btn\" aria-label=\"Cài đặt\" title=\"Cài đặt\"")))
                .andExpect(content().string(containsString("class=\"hud-gear-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"")))
                .andExpect(content().string(not(containsString(">Bản đồ</button>"))))
                .andExpect(content().string(not(containsString("id=\"checkinCountBadge\""))))
                .andExpect(content().string(containsString("class=\"minimap-container\"")))
                .andExpect(content().string(containsString("<span class=\"minimap-dir minimap-dir-n\" aria-hidden=\"true\">BẮC</span>")))
                .andExpect(content().string(containsString("<span class=\"minimap-dir minimap-dir-e\" aria-hidden=\"true\">ĐÔNG</span>")))
                .andExpect(content().string(containsString("<span class=\"minimap-dir minimap-dir-s\" aria-hidden=\"true\">NAM</span>")))
                .andExpect(content().string(containsString("<span class=\"minimap-dir minimap-dir-w\" aria-hidden=\"true\">TÂY</span>")))
                .andExpect(content().string(containsString("class=\"minimap-zone-label\"")))
                .andExpect(content().string(containsString("Quay về trang chủ UniDocs")))
                .andExpect(content().string(not(containsString("ĐHKH HUẾ · HUSC"))))
                .andExpect(content().string(not(containsString("Tìm chi tiết đặc trưng"))))
                .andExpect(content().string(not(containsString("questDetailText"))))
                .andExpect(content().string(containsString("<h2>Khám phá:</h2>")))
                .andExpect(content().string(containsString("id=\"snapshotFrameOverlay\"")))
                .andExpect(content().string(containsString("class=\"hud-top-center\"")))
                .andExpect(content().string(containsString("id=\"weatherClockLabel\"")))
                .andExpect(content().string(containsString("id=\"fpsBadge\"")))
                .andExpect(content().string(not(containsString("id=\"trafficSignalPill\""))))
                .andExpect(content().string(containsString("<h2 id=\"menuDialogTitle\">Cài đặt</h2>")))
                .andExpect(content().string(containsString("class=\"dlg-close-btn is-red-close\" aria-label=\"Đóng\" autofocus>X</button>")))
                .andExpect(content().string(containsString(">Toàn cảnh</h3>")))
                .andExpect(content().string(containsString(">Xem</button>")))
                .andExpect(content().string(containsString(">Thời gian</h3>")))
                .andExpect(content().string(containsString(">Ban ngày</button>")))
                .andExpect(content().string(not(containsString(">Hoàng hôn xứ Huế</button>"))))
                .andExpect(content().string(containsString(">Buổi tối</button>")))
                .andExpect(content().string(containsString(">Đồ họa</label></h3>")))
                .andExpect(content().string(containsString("id=\"qualitySlider\"")))
                .andExpect(content().string(containsString(">Thấp</button>")))
                .andExpect(content().string(containsString(">Vừa</button>")))
                .andExpect(content().string(containsString(">Cao</button>")))
                .andExpect(content().string(containsString(">Âm thanh</label></h3>")))
                .andExpect(content().string(containsString("id=\"soundToggleInput\"")))
                .andExpect(content().string(not(containsString("id=\"soundStateLabel\""))))
                .andExpect(content().string(not(containsString(">Đang bật</span>"))))
                .andExpect(content().string(containsString(">Đặt lại</h3>")))
                .andExpect(content().string(containsString(">Đặt lại</button>")))
                .andExpect(content().string(containsString(">Lưu</button>")))
                .andExpect(content().string(not(containsString("Thoát game về Trang chủ UniDocs"))))
                .andExpect(content().string(not(containsString("menu-exit-link"))))
                .andExpect(content().string(not(containsString("id=\"sprintBtn\""))))
                .andExpect(content().string(containsString("id=\"snapshotBtn\" type=\"button\" class=\"hud-btn hud-icon-btn action-fab\" aria-label=\"Chụp ảnh\"")))
                .andExpect(content().string(containsString("id=\"openGalleryBtn\" type=\"button\" class=\"hud-btn hud-icon-btn action-fab\" aria-label=\"Kho ảnh\" title=\"Kho ảnh\"")))
                .andExpect(content().string(containsString("<h2 id=\"galleryDialogTitle\">Kho ảnh</h2>")))
                .andExpect(content().string(containsString("class=\"hud-action-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"")))
                .andExpect(content().string(not(containsString(">Chạy</button>"))))
                .andExpect(content().string(not(containsString(">Chụp ảnh</button>"))))
                .andExpect(content().string(not(containsString("Shift: Chạy"))))
                .andExpect(content().string(not(containsString("Giữ Shift chạy nhanh"))))
                .andExpect(content().string(not(containsString("UniDocs Campus 3D Explorer"))))
                .andExpect(content().string(not(containsString("Trường Đại học Khoa học · ĐH Huế"))))
                .andExpect(content().string(not(containsString("Bỏ qua Intro"))))
                .andExpect(content().string(not(containsString("77 Nguyễn Huệ · Góc quay Flycam"))))
                .andExpect(content().string(not(containsString("/#utilities"))))
                .andExpect(content().string(not(containsString("security-monitor.js"))))
                .andExpect(content().string(not(containsString("anti-theft.js"))));

        // Verify legacy /utilities/campus-3d route is removed
        mockMvc.perform(get("/utilities/campus-3d"))
                .andExpect(status().isNotFound());
    }

    @Test
    void campus3dAssets_ServeValidGlbModelVendorModulesAndScripts() throws Exception {
        // Verify Meshopt-compressed GLB model begins with valid glTF magic header bytes
        MvcResult glbResult = mockMvc.perform(get("/models/husc-campus.glb"))
                .andExpect(status().isOk())
                .andReturn();
        byte[] glbBytes = glbResult.getResponse().getContentAsByteArray();
        assertTrue(glbBytes.length > 50_000, "Expected compressed HUSC GLB model to exceed 50 KB");
        assertEquals('g', (char) glbBytes[0]);
        assertEquals('l', (char) glbBytes[1]);
        assertEquals('T', (char) glbBytes[2]);
        assertEquals('F', (char) glbBytes[3]);

        // Verify local Three.js vendor bundle and campus-3d game engine scripts load cleanly
        mockMvc.perform(get("/vendor/three/three.module.js")).andExpect(status().isOk());
        mockMvc.perform(get("/vendor/three/addons/loaders/GLTFLoader.js")).andExpect(status().isOk());
        mockMvc.perform(get("/vendor/three/addons/libs/meshopt_decoder.module.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/main.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/world-data.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/materials-env.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/player-controls.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/student-avatar.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/traffic-system.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/traffic-lights.js")).andExpect(status().isOk());
        mockMvc.perform(get("/js/campus-3d/hud-ui.js")).andExpect(status().isOk());
    }

    @Test
    void homepageAndSitemap_ExposeStandaloneCampusRouteOnly() throws Exception {
        // Verify homepage removed 3D campus from utilities card list and 2D campus map modal banner
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("/utilities/campus-3d"))))
                .andExpect(content().string(not(containsString("Khám phá Trường 3D"))))
                .andExpect(content().string(not(containsString("Mở Bản đồ 3D"))));

        // Verify sitemap excludes removed /utilities/campus-3d and indexes standalone /husc-campus
        mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("/utilities/campus-3d"))))
                .andExpect(content().string(containsString("https://unidocs-husc.pages.dev/husc-campus")));
    }

    @Test
    void campus3dPage_ExposesNormalizedSeoMetaTagsAndValidGeoJsonLd() throws Exception {
        // Verify full SEO head meta tags, author ownership, Open Graph, Twitter Card, and valid JSON-LD payload
        MvcResult result = mockMvc.perform(get("/husc-campus"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<title>Khám phá Khuôn viên 3D - Trường Đại học Khoa học Huế (HUSC) | UniDocs</title>")))
                .andExpect(content().string(containsString("<meta name=\"keywords\" content=\"husc campus 3d, sơ đồ 3d trường đại học khoa học huế, đhkh huế, husc, unidocs, tài nguyễn, nguyễn ngọc thành tài, ntainguyenit")))
                .andExpect(content().string(containsString("<meta name=\"author\" content=\"Tài Nguyễn (Nguyễn Ngọc Thành Tài - ntainguyen.it@gmail.com)\">")))
                .andExpect(content().string(containsString("<link rel=\"canonical\" href=\"https://unidocs-husc.pages.dev/husc-campus\">")))
                .andExpect(content().string(containsString("<meta property=\"og:site_name\" content=\"UniDocs HUSC\">")))
                .andExpect(content().string(containsString("<meta property=\"og:locale\" content=\"vi_VN\">")))
                .andExpect(content().string(containsString("<meta property=\"og:image\" content=\"https://unidocs-husc.pages.dev/images/campus-map.jpeg\">")))
                .andExpect(content().string(containsString("<meta name=\"twitter:card\" content=\"summary_large_image\">")))
                .andExpect(content().string(containsString("\"@type\":\"InteractiveModel\"")))
                .andExpect(content().string(containsString("\"@type\":\"CollegeOrUniversity\"")))
                .andReturn();

        // Extract and parse embedded JSON-LD payload to verify strict JSON validity and required GEO entities
        String html = result.getResponse().getContentAsString();
        Matcher jsonLdMatcher = Pattern.compile("<script type=\"application/ld\\+json\">(.*?)</script>", Pattern.DOTALL).matcher(html);
        assertTrue(jsonLdMatcher.find(), "Expected single rendered JSON-LD script block on /husc-campus");
        String jsonLdRaw = jsonLdMatcher.group(1);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(jsonLdRaw);
        assertEquals("https://schema.org", root.get("@context").asText());
        assertTrue(root.get("@graph").isArray());
        assertTrue(jsonLdRaw.contains("Trường Đại học Khoa học, Đại học Huế"));
        assertTrue(jsonLdRaw.contains("77 Nguyễn Huệ"));
        assertTrue(jsonLdRaw.contains("Thành phố Huế"));
        assertTrue(jsonLdRaw.contains("ntainguyen.it@gmail.com"));
        assertTrue(jsonLdRaw.contains("https://github.com/ntainguyenit"));
    }
}
