package com.unidocs.dto;

import com.unidocs.domain.StudyGroupPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;

@Data
public class StudyGroupRequest {

    @NotBlank(message = "Mã học phần không được để trống")
    private String subjectCode;

    @NotBlank(message = "Tên học phần không được để trống")
    private String subjectName;

    @NotBlank(message = "Học kỳ không được để trống")
    private String semester;

    @NotBlank(message = "Link nhóm không được để trống")
    private String groupLink;
    
    // Honeypot field - should be empty. If not, it's a bot.
    private String honeypot;
}
