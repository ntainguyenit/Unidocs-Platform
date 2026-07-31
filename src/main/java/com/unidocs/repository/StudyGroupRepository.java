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

    // Chống spam: Tìm xem IP này đã tạo bao nhiêu nhóm trong ngày
    int countByCreatorIpAndCreatedAtAfter(String creatorIp, LocalDateTime after);

    // Chống trùng lặp: Tìm xem có nhóm nào đang ACTIVE cùng mã môn không
    boolean existsBySubjectCodeAndStatus(String subjectCode, StudyGroupStatus status);

    // Lấy danh sách nhóm theo trạng thái
    List<StudyGroup> findByStatusOrderByCreatedAtDesc(StudyGroupStatus status);
}
