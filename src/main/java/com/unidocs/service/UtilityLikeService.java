package com.unidocs.service;

import com.unidocs.domain.UtilityLike;
import com.unidocs.repository.UtilityLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UtilityLikeService {

    @Autowired
    private UtilityLikeRepository repository;

    public Map<String, Integer> getAllLikeCounts() {
        List<Object[]> results = repository.countTotalLikesPerUtility();
        Map<String, Integer> counts = new HashMap<>();
        for (Object[] result : results) {
            counts.put((String) result[0], ((Number) result[1]).intValue());
        }
        return counts;
    }

    public List<String> getLikedUtilitiesByIp(String ipAddress) {
        return repository.findLikedUtilityIdsByIpAddress(ipAddress);
    }

    @Transactional
    public Map<String, Object> toggleLike(String utilityId, String ipAddress) {
        boolean exists = repository.existsByUtilityIdAndIpAddress(utilityId, ipAddress);
        boolean isLikedNow;
        
        if (exists) {
            repository.deleteByUtilityIdAndIpAddress(utilityId, ipAddress);
            isLikedNow = false;
        } else {
            UtilityLike like = new UtilityLike();
            like.setUtilityId(utilityId);
            like.setIpAddress(ipAddress);
            repository.save(like);
            isLikedNow = true;
        }
        
        int newCount = repository.countByUtilityId(utilityId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", isLikedNow);
        response.put("count", newCount);
        return response;
    }
}
