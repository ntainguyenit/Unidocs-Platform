package com.unidocs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/utilities")
public class UtilitiesController {

    @GetMapping("/exam-simulation")
    public String examSimulation(Model model) {
        return "utilities/exam-simulation";
    }

    @GetMapping("/timetable")
    public String timetable(Model model) {
        return "utilities/timetable";
    }

    @GetMapping("/screenshot-beautifier")
    public String screenshotBeautifier() {
        return "utilities/screenshot-beautifier";
    }

    @GetMapping("/photo-booth")
    public String photoBooth() {
        return "utilities/photo-booth";
    }

    @GetMapping("/typing-test")
    public String typingTest() {
        return "utilities/typing-test";
    }

    @GetMapping("/lucky-wheel")
    public String luckyWheel() {
        return "utilities/lucky-wheel";
    }

    @GetMapping("/exam-countdown")
    public String examCountdown() {
        return "utilities/exam-countdown";
    }

    @GetMapping("/flashcards")
    public String flashcards() {
        return "utilities/flashcards";
    }

    @GetMapping("/bmi-calculator")
    public String bmiCalculator() {
        return "utilities/bmi-calculator";
    }

    @GetMapping("/currency-converter")
    public String currencyConverter() {
        return "utilities/currency-converter";
    }

    @GetMapping("/random-number")
    public String randomNumber() {
        return "utilities/random-number";
    }

    @GetMapping("/stopwatch")
    public String stopwatch() {
        return "utilities/stopwatch";
    }

    @GetMapping("/percentage-calculator")
    public String percentageCalculator() {
        return "utilities/percentage-calculator";
    }

    @GetMapping("/password-generator")
    public String passwordGenerator() {
        return "utilities/password-generator";
    }

    @GetMapping("/qr-generator")
    public String qrGenerator() {
        return "utilities/qr-generator";
    }

    @GetMapping("/ip-checker")
    public String ipChecker() {
        return "utilities/ip-checker";
    }

    @GetMapping("/email-signature")
    public String emailSignature() {
        return "utilities/email-signature";
    }

    @GetMapping("/speed-test")
    public String speedTest() {
        return "utilities/speed-test";
    }

    @GetMapping("/color-contrast")
    public String colorContrast() {
        return "utilities/color-contrast";
    }

    @GetMapping("/date-calculator")
    public String dateCalculator() {
        return "utilities/date-calculator";
    }

    @GetMapping("/color-converter")
    public String colorConverter() {
        return "utilities/color-converter";
    }

    @GetMapping("/meta-tag-generator")
    public String metaTagGenerator() {
        return "utilities/meta-tag-generator";
    }

    @GetMapping("/markdown-editor")
    public String markdownEditor() {
        return "utilities/markdown-editor";
    }

    @GetMapping("/typography-previewer")
    public String typographyPreviewer() {
        return "utilities/typography-previewer";
    }

    @GetMapping("/mockup-generator")
    public String mockupGenerator() {
        return "utilities/mockup-generator";
    }

    @GetMapping("/palette-extractor")
    public String paletteExtractor() {
        return "utilities/palette-extractor";
    }

    @GetMapping("/quick-mindmap")
    public String quickMindmap() {
        return "utilities/quick-mindmap";
    }

    @GetMapping("/code-formatter")
    public String codeFormatter() {
        return "utilities/code-formatter";
    }

    @GetMapping("/data-converter")
    public String dataConverter() {
        return "utilities/data-converter";
    }

    @GetMapping("/base-converter")
    public String baseConverter() {
        return "utilities/base-converter";
    }

    @GetMapping("/crypto-hash")
    public String cryptoHash() {
        return "utilities/crypto-hash";
    }
}
