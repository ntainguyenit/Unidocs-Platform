package com.unidocs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_group")
@Getter
@Setter
public class StudyGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String token; // Unique short link token

    @Column(nullable = false)
    private String subjectCode;

    @Column(nullable = false)
    private String subjectName;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'Học kỳ 1'")
    private String semester = "Học kỳ 1";

    @Column(nullable = false)
    private String universityName = "Đại học Khoa học - ĐH Huế";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudyGroupPurpose purpose = StudyGroupPurpose.IMPROVE;

    @Column(nullable = false)
    private Integer targetMembers = 20;

    @Column(nullable = false)
    private String groupLink; // Only Zalo or Messenger

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudyGroupStatus status = StudyGroupStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private String creatorIp;

    private int views = 0;
    private int interestedCount = 0;
    private int linkReveals = 0;
    private int externalOpens = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void setLastUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
