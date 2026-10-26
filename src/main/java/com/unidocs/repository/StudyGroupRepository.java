package com.unidocs.repository;

import com.unidocs.domain.StudyGroup;
import com.unidocs.domain.StudyGroupPurpose;
import com.unidocs.domain.StudyGroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    Optional<StudyGroup> findByToken(String token);

    // Prevent spam: Count groups created by IP within time window
    int countByCreatorIpAndCreatedAtAfter(String creatorIp, LocalDateTime after);

    // Prevent duplicates: Check if active group exists for subject code
    boolean existsBySubjectCodeAndStatus(String subjectCode, StudyGroupStatus status);

    // Fetch study groups ordered by creation time descending
    List<StudyGroup> findByStatusOrderByCreatedAtDesc(StudyGroupStatus status);
}
