package com.unidocs.repository;

import com.unidocs.domain.StudyGroup;
import com.unidocs.domain.StudyGroupInteraction;
import com.unidocs.domain.InteractionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyGroupInteractionRepository extends JpaRepository<StudyGroupInteraction, Long> {
    boolean existsByStudyGroupAndIpAddressAndAction(StudyGroup studyGroup, String ipAddress, InteractionType action);
    void deleteByStudyGroup(StudyGroup studyGroup);
}
