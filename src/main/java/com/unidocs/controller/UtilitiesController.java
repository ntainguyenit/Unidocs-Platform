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
}
