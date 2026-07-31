package com.unidocs.repository;

import com.unidocs.domain.StudyGroup;
import com.unidocs.domain.StudyGroupReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyGroupReportRepository extends JpaRepository<StudyGroupReport, Long> {
    boolean existsByStudyGroupAndReporterIp(StudyGroup studyGroup, String reporterIp);
    long countByStudyGroup(StudyGroup studyGroup);
    void deleteByStudyGroup(StudyGroup studyGroup);
}
