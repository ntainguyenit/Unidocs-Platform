package com.unidocs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Single-line English comment: Public response DTO for footer access summary without sensitive IP fields
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessInfoDto {
    private String time;
    private String date;
    private String deviceName;
    private String displayText;
}
