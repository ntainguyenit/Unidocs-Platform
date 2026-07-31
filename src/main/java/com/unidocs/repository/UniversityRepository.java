package com.unidocs.repository;

import com.unidocs.domain.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityRepository extends JpaRepository<University, Long> {
    
    @Cacheable(value = "universities")
    @EntityGraph(attributePaths = {"faculties"})
    java.util.List<University> findAll();

    @Cacheable(value = "university", key = "#slug")
    @EntityGraph(attributePaths = {"faculties"})
    Optional<University> findBySlug(String slug);

    Optional<University> findByName(String name);
}
