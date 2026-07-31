package com.unidocs.repository;

import com.unidocs.domain.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    
    @Cacheable(value = "faculty", key = "#slug")
    @EntityGraph(attributePaths = {"courses"})
    Optional<Faculty> findBySlug(String slug);

}
