package com.unidocs.mapper;

import com.unidocs.domain.Course;
import com.unidocs.domain.Faculty;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class CourseMapperTest {

    @Test
    void testToDto_Success() {
        CourseMapper mapper = new CourseMapper();
        Course c = new Course();
        c.setId(1L);
        c.setName("Test Course");
        c.setSlug("test-course");
        
        Faculty f = new Faculty();
        f.setId(2L);
        f.setName("Test Faculty");
        c.setFaculty(f);

        Map<String, Object> dto = mapper.toDto(c);
        assertNotNull(dto);
        assertEquals(1L, dto.get("id"));
        assertEquals("Test Course", dto.get("name"));
        assertEquals(2L, dto.get("facultyId"));
    }
}
