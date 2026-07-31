package com.unidocs.repository;

import com.unidocs.domain.Document;
import com.unidocs.domain.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCourseIdAndStatusOrderByUploadedAtDesc(Long courseId, DocumentStatus status);
    
    Page<Document> findAllByOrderByReliabilityScoreDescUploadedAtDesc(Pageable pageable);
    
    List<Document> findAllByOrderByReliabilityScoreDescUploadedAtDesc();
    
    Optional<Document> findBySha256Hash(String hash);
    Optional<Document> findBySlug(String slug);
    List<Document> findByStatus(DocumentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Document d LEFT JOIN FETCH d.course WHERE d.status = :status")
    List<Document> findByStatusWithCourse(@org.springframework.data.repository.query.Param("status") DocumentStatus status);

    Page<Document> findByStatusOrderByReliabilityScoreDescUploadedAtDesc(DocumentStatus status, Pageable pageable);
    
    // For dynamic sorting
    Page<Document> findByStatus(DocumentStatus status, Pageable pageable);
    
    boolean existsByCourseIdAndTitle(Long courseId, String title);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Document d WHERE d.course.id = :courseId AND d.status = :status ORDER BY (d.views + d.downloads) DESC")
    List<Document> findTrendingDocumentsByCourse(@org.springframework.data.repository.query.Param("courseId") Long courseId, @org.springframework.data.repository.query.Param("status") DocumentStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Document d WHERE d.course.id = :courseId AND d.folderName = :folderName AND d.id <> :excludeId AND d.status = :status ORDER BY (d.views + d.downloads) DESC")
    List<Document> findRelatedDocumentsSameFolder(@org.springframework.data.repository.query.Param("courseId") Long courseId, @org.springframework.data.repository.query.Param("folderName") String folderName, @org.springframework.data.repository.query.Param("excludeId") Long excludeId, @org.springframework.data.repository.query.Param("status") DocumentStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Document d WHERE d.course.id = :courseId AND d.id <> :excludeId AND d.status = :status ORDER BY (d.views + d.downloads) DESC")
    List<Document> findRelatedDocumentsSameCourse(@org.springframework.data.repository.query.Param("courseId") Long courseId, @org.springframework.data.repository.query.Param("excludeId") Long excludeId, @org.springframework.data.repository.query.Param("status") DocumentStatus status, Pageable pageable);
}