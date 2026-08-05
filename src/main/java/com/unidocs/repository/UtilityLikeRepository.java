package com.unidocs.repository;

import com.unidocs.domain.UtilityLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilityLikeRepository extends JpaRepository<UtilityLike, Long> {
    
    int countByUtilityId(String utilityId);
    
    boolean existsByUtilityIdAndIpAddress(String utilityId, String ipAddress);
    
    void deleteByUtilityIdAndIpAddress(String utilityId, String ipAddress);
    
    @Query("SELECT ul.utilityId FROM UtilityLike ul WHERE ul.ipAddress = :ipAddress")
    List<String> findLikedUtilityIdsByIpAddress(String ipAddress);
    
    @Query("SELECT ul.utilityId, COUNT(ul) FROM UtilityLike ul GROUP BY ul.utilityId")
    List<Object[]> countTotalLikesPerUtility();
}
