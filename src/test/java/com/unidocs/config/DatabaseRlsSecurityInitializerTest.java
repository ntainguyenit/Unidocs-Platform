package com.unidocs.config;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

// Verify automatic PostgreSQL/Supabase RLS enforcement and SQL migration consistency for public.access_logs
class DatabaseRlsSecurityInitializerTest {

    @Test
    void enforceAccessLogsRls_SkipsNonPostgreSqlDatabases() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("H2");

        DatabaseRlsSecurityInitializer initializer = new DatabaseRlsSecurityInitializer(dataSource, jdbcTemplate);
        initializer.enforceAccessLogsRls();

        verifyNoInteractions(jdbcTemplate);
    }

    @Test
    void enforceAccessLogsRls_AppliesRlsAndServiceRolePoliciesOnSupabasePostgres() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        when(jdbcTemplate.queryForObject("SELECT to_regclass('public.access_logs')::text", String.class))
                .thenReturn("access_logs");
        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class))).thenReturn(Boolean.TRUE);

        DatabaseRlsSecurityInitializer initializer = new DatabaseRlsSecurityInitializer(dataSource, jdbcTemplate);
        initializer.enforceAccessLogsRls();

        verify(jdbcTemplate).execute("ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY");
        verify(jdbcTemplate).execute("REVOKE ALL ON TABLE public.access_logs FROM anon, authenticated");
        verify(jdbcTemplate).execute(contains("FOR INSERT TO service_role WITH CHECK ((SELECT auth.role()) = 'service_role')"));
        verify(jdbcTemplate).execute(contains("FOR SELECT TO service_role USING ((SELECT auth.role()) = 'service_role')"));
        verify(jdbcTemplate).execute(contains("FOR UPDATE TO service_role USING ((SELECT auth.role()) = 'service_role') WITH CHECK ((SELECT auth.role()) = 'service_role')"));
        verify(jdbcTemplate).execute(contains("FOR DELETE TO service_role USING ((SELECT auth.role()) = 'service_role')"));
    }

    @Test
    void enforceAccessLogsRls_EnablesRlsOnlyOnNonSupabasePostgres() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        when(jdbcTemplate.queryForObject("SELECT to_regclass('public.access_logs')::text", String.class))
                .thenReturn("access_logs");
        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class))).thenReturn(Boolean.FALSE);

        DatabaseRlsSecurityInitializer initializer = new DatabaseRlsSecurityInitializer(dataSource, jdbcTemplate);
        initializer.enforceAccessLogsRls();

        verify(jdbcTemplate).execute("ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY");
        verify(jdbcTemplate, never()).execute(contains("CREATE POLICY"));
    }

    @Test
    void enforceAccessLogsRls_HandlesDatabasePermissionErrorsGracefully() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        when(jdbcTemplate.queryForObject("SELECT to_regclass('public.access_logs')::text", String.class))
                .thenThrow(new RuntimeException("permission denied"));

        DatabaseRlsSecurityInitializer initializer = new DatabaseRlsSecurityInitializer(dataSource, jdbcTemplate);
        assertDoesNotThrow(initializer::enforceAccessLogsRls);
    }

    @Test
    void supabaseMigrationScript_EnablesRlsAndDefinesSecureServiceRolePolicies() throws Exception {
        Path migrationPath = Path.of("supabase/migrations/20261118000001_enable_rls_access_logs.sql");
        assertTrue(Files.exists(migrationPath));
        String sql = Files.readString(migrationPath);
        assertTrue(sql.contains("ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;"));
        assertTrue(sql.contains("REVOKE ALL ON TABLE public.access_logs FROM anon, authenticated;"));
        assertTrue(sql.contains("TO service_role"));
        assertTrue(sql.contains("(SELECT auth.role()) = 'service_role'"));
    }
}
