package com.unidocs.mapper;

import com.unidocs.domain.Course;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class CourseMapper {
    public Map<String, Object> toDto(Course course) {
        if (course == null) return null;
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", course.getId());
        dto.put("name", course.getName());
        dto.put("slug", course.getSlug());
        if (course.getFaculty() != null) {
            dto.put("facultyId", course.getFaculty().getId());
            dto.put("facultyName", course.getFaculty().getName());
        }
        return dto;
    }
}
