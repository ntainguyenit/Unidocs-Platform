package com.unidocs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

// Single-line English comment: Controller rendering the standalone feedback submission view without public list exposure
@Controller
@RequestMapping("/feedback")
public class FeedbackController {

    @GetMapping
    public String showFeedbackPage() {
        // Single-line English comment: Serve feedback submission form only
        return "feedback";
    }
}
