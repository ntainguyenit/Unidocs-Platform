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
    
    Optional<Course> findByNameAndFaculty(String name, Faculty faculty);
    
    List<Course> findByNameContainingIgnoreCase(String keyword);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN FETCH c.faculty")
    List<Course> findAllWithFaculty();
}
