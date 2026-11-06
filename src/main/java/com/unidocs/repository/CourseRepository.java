package com.unidocs.repository;

import com.unidocs.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Cacheable(value = "course", key = "#slug")
    Optional<Course> findBySlug(String slug);
    
    List<Course> findByNameContainingIgnoreCase(String keyword);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN FETCH c.faculty")
    List<Course> findAllWithFaculty();

    List<Course> findByCreatedAtIsNotNullOrderByCreatedAtDesc();

    List<Course> findByStatusOrderByCreatedAtDesc(String status);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN FETCH c.faculty WHERE c.status = 'pending' ORDER BY c.createdAt DESC")
    List<Course> findPendingCoursesWithFaculty();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN FETCH c.faculty WHERE c.status = 'active' OR c.status IS NULL ORDER BY c.createdAt DESC")
    List<Course> findActiveCoursesWithFaculty();

    @org.springframework.data.jpa.repository.Query("SELECT c.faculty.id, COUNT(c) FROM Course c WHERE c.status = 'active' OR c.status IS NULL GROUP BY c.faculty.id")
    List<Object[]> countActiveCoursesGroupedByFaculty();

    List<Course> findByFacultyIdAndStatus(Long facultyId, String status);

    long countByStatus(String status);
}
