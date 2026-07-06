package com.unidocs.monitor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseHealthCheckService {
    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthCheckService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long measureDatabaseLatency() {
        long start = System.currentTimeMillis();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return System.currentTimeMillis() - start;
        } catch (Exception e) {
            return -1;
        }
    }
}
