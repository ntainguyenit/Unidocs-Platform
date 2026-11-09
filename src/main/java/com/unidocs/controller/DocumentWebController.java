package com.unidocs.controller;

import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import com.unidocs.service.DocumentService;
import com.unidocs.service.SeoMetadataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/document")
public class DocumentWebController {

    private final DocumentService documentService;
    private final SeoMetadataService seoMetadataService;

    // Preserve 1-arg constructor for direct unit tests
    public DocumentWebController(DocumentService documentService) {
        this(documentService, new SeoMetadataService("https://unidocs-husc.pages.dev"));
    }

    @Autowired
    public DocumentWebController(DocumentService documentService, SeoMetadataService seoMetadataService) {
        this.documentService = documentService;
        this.seoMetadataService = seoMetadataService;
    }

    @GetMapping("/{slug}")
    public String getDocumentPage(@PathVariable String slug) {
        return "redirect:/document/" + slug + "/view";
    }

    @GetMapping("/{slug}/view")
    public String viewDocument(@PathVariable String slug, Model model) {
        Document doc = documentService.getDocumentBySlug(slug);
        
        // Only allow viewing if approved
        if (doc.getStatus() != DocumentStatus.APPROVED) {
            return "redirect:/"; // Or a proper error page
        }

        documentService.incrementViews(doc.getId());
        model.addAttribute("document", doc);
        // Generate dynamic SEO metadata and LearningResource JSON-LD for document page
        model.addAttribute("seo", seoMetadataService.buildDocumentSeo(doc));
        
        java.util.List<Document> relatedDocs = documentService.getRelatedDocuments(doc, 4);
        model.addAttribute("relatedDocs", relatedDocs);
        
        return "document-view";
    }

    @GetMapping("/{slug}/download")
    public String downloadDocument(@PathVariable String slug) {
        Document doc = documentService.getDocumentBySlug(slug);
        
        if (doc.getStatus() != DocumentStatus.APPROVED) {
            return "redirect:/"; 
        }

        documentService.incrementDownloads(doc.getId());
        
        String url = doc.getStorageUrl();
        if (url != null && url.contains("supabase.co")) {
            url = url + (url.contains("?") ? "&" : "?") + "download=";
        }
        
        return "redirect:" + url;
    }
}
