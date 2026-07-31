package com.unidocs.dto;

import com.unidocs.domain.StudyGroupPurpose;
import com.unidocs.domain.StudyGroupStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyGroupResponse {
    private String token;
    private String subjectCode;
    private String subjectName;
    private String semester;
    private StudyGroupStatus status;
    private int views;
    private int interestedCount;
    private int linkReveals;
    private int externalOpens;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    
    // We intentionally EXCLUDE the groupLink to avoid bots scraping it.
    // It will only be returned via a specific Reveal API.
}
