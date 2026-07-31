package com.unidocs.service;

import com.unidocs.domain.*;
import com.unidocs.dto.StudyGroupRequest;
import com.unidocs.dto.StudyGroupResponse;
import com.unidocs.repository.StudyGroupInteractionRepository;
import com.unidocs.repository.StudyGroupReportRepository;
import com.unidocs.repository.StudyGroupRepository;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StudyGroupService {

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private StudyGroupInteractionRepository interactionRepository;

    @Autowired
    private StudyGroupReportRepository reportRepository;

    // Rate Limiting caches
    private final Map<String, Bucket> createBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> interactBuckets = new ConcurrentHashMap<>();

    // Limits: 3 groups per day per IP
    private Bucket resolveCreateBucket(String ip) {
        return createBuckets.computeIfAbsent(ip, k -> {
            Bandwidth limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofDays(1)));
            return Bucket.builder().addLimit(limit).build();
        });
    }

    // Limits: 30 interactions per hour per IP
    private Bucket resolveInteractBucket(String ip) {
        return interactBuckets.computeIfAbsent(ip, k -> {
            Bandwidth limit = Bandwidth.classic(30, Refill.intervally(30, Duration.ofHours(1)));
            return Bucket.builder().addLimit(limit).build();
        });
    }

    private boolean isValidZaloMessengerLink(String link) {
        if (!StringUtils.hasText(link)) return false;
        String l = link.toLowerCase();
        return l.startsWith("https://zalo.me/") || l.startsWith("https://m.me/");
    }

    @Transactional
    public StudyGroupResponse createGroup(StudyGroupRequest request, String ipAddress) {
        // Honeypot check
        if (StringUtils.hasText(request.getHoneypot())) {
            throw new IllegalArgumentException("Invalid request."); // Bot detected
        }

        // Validate link
        if (!isValidZaloMessengerLink(request.getGroupLink())) {
            throw new IllegalArgumentException("Chỉ chấp nhận link Zalo (https://zalo.me/...) hoặc Messenger (https://m.me/...).");
        }

        // Check Rate Limit
        if (!resolveCreateBucket(ipAddress).tryConsume(1)) {
            throw new IllegalStateException("Bạn đã tạo quá nhiều nhóm hôm nay. Vui lòng thử lại vào ngày mai.");
        }

        // Check duplication
        if (studyGroupRepository.existsBySubjectCodeAndStatus(
                request.getSubjectCode(), StudyGroupStatus.ACTIVE)) {
            throw new IllegalStateException("Đã có một nhóm đang mở cho Mã học phần này. Vui lòng tham gia nhóm đó thay vì tạo mới.");
        }

        StudyGroup group = new StudyGroup();
        group.setToken(UUID.randomUUID().toString().substring(0, 8)); // 8 chars short link
        group.setSubjectCode(request.getSubjectCode());
        group.setSubjectName(request.getSubjectName());
        group.setSemester(request.getSemester());
        group.setGroupLink(request.getGroupLink());
        group.setCreatorIp(ipAddress);
        group.setExpiresAt(LocalDateTime.now().plusDays(30)); // 30 days expiration

        StudyGroup saved = studyGroupRepository.save(group);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public StudyGroupResponse getGroupDetails(String token) {
        StudyGroup group = studyGroupRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm này."));
        return mapToResponse(group);
    }

    @Transactional(readOnly = true)
    public java.util.List<StudyGroupResponse> getActiveGroups() {
        return studyGroupRepository.findByStatusOrderByCreatedAtDesc(StudyGroupStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void incrementViews(String token) {
        StudyGroup group = studyGroupRepository.findByToken(token).orElse(null);
        if (group != null) {
            group.setViews(group.getViews() + 1);
            studyGroupRepository.save(group);
        }
    }

    @Transactional
    public void interact(String token, String ipAddress, InteractionType type) {
        // Check Rate Limit
        if (!resolveInteractBucket(ipAddress).tryConsume(1)) {
            throw new IllegalStateException("Bạn đang thao tác quá nhanh.");
        }

        StudyGroup group = studyGroupRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm này."));

        // Only allow one interaction per IP per action
        if (interactionRepository.existsByStudyGroupAndIpAddressAndAction(group, ipAddress, type)) {
            return; // Already interacted
        }

        StudyGroupInteraction interaction = new StudyGroupInteraction();
        interaction.setStudyGroup(group);
        interaction.setIpAddress(ipAddress);
        interaction.setAction(type);
        interactionRepository.save(interaction);

        // Update counters
        switch (type) {
            case INTERESTED:
                group.setInterestedCount(group.getInterestedCount() + 1);
                break;
            case REVEAL:
                group.setLinkReveals(group.getLinkReveals() + 1);
                break;
            case EXTERNAL_OPEN:
                group.setExternalOpens(group.getExternalOpens() + 1);
                break;
        }
        studyGroupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public boolean hasInteracted(String token, String ipAddress, InteractionType type) {
        StudyGroup group = studyGroupRepository.findByToken(token).orElse(null);
        if (group == null) return false;
        return interactionRepository.existsByStudyGroupAndIpAddressAndAction(group, ipAddress, type);
    }

    @Transactional
    public String revealLink(String token, String ipAddress) {
        StudyGroup group = studyGroupRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm này."));
        
        // Ghi nhận lượt REVEAL nếu chưa
        interact(token, ipAddress, InteractionType.REVEAL);
        
        return group.getGroupLink();
    }

    @Transactional
    public void reportGroup(String token, String reason, String ipAddress) {
        StudyGroup group = studyGroupRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm này."));

        // Instant delete as requested by admin
        interactionRepository.deleteByStudyGroup(group);
        reportRepository.deleteByStudyGroup(group);
        studyGroupRepository.delete(group);
    }

    private StudyGroupResponse mapToResponse(StudyGroup group) {
        StudyGroupResponse res = new StudyGroupResponse();
        res.setToken(group.getToken());
        res.setSubjectCode(group.getSubjectCode());
        res.setSubjectName(group.getSubjectName());
        res.setSemester(group.getSemester());
        res.setStatus(group.getStatus());
        res.setViews(group.getViews());
        res.setInterestedCount(group.getInterestedCount());
        res.setLinkReveals(group.getLinkReveals());
        res.setExternalOpens(group.getExternalOpens());
        res.setCreatedAt(group.getCreatedAt());
        res.setExpiresAt(group.getExpiresAt());
        return res;
    }
}
