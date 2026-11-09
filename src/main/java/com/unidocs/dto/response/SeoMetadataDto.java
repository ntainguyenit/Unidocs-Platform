package com.unidocs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Dynamic SEO and GEO AI metadata container consumed by base head and academic views
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeoMetadataDto {
    private String title;
    private String description;
    private String keywords;
    private String canonicalUrl;
    private String ogType;
    private String ogImage;
    private String robots;
    private String jsonLd;
    private String contextualIntro;
    private String contextualSummary;
}
