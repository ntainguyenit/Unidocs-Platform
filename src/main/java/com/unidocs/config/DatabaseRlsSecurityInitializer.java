package com.unidocs.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Locale;

// Ensure Row Level Security and strict service-role policies are enforced on PostgreSQL public.access_logs
@Component
public class DatabaseRlsSecurityInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseRlsSecurityInitializer.class);

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseRlsSecurityInitializer(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Apply idempotent RLS hardening automatically after JPA schema initialization completes
    @EventListener(ApplicationReadyEvent.class)
    public void enforceAccessLogsRls() {
        if (!isPostgreSqlDatabase()) {
            return;
        }

        try {
            String regClass = jdbcTemplate.queryForObject("SELECT to_regclass('public.access_logs')::text", String.class);
            if (regClass == null || regClass.isBlank()) {
                return;
            }

            // Enable Row Level Security on public.access_logs
            jdbcTemplate.execute("ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY");

            if (!isSupabaseAuthEnvironment()) {
                log.info("Enabled PostgreSQL RLS on public.access_logs");
                return;
            }

            // Revoke public PostgREST access from anon and authenticated client roles
            jdbcTemplate.execute("REVOKE ALL ON TABLE public.access_logs FROM anon, authenticated");

            // Recreate strict service-role policies idempotently using InitPlan-safe auth.role() wrapper
            jdbcTemplate.execute("DROP POLICY IF EXISTS \"Enable insert for service role only\" ON public.access_logs");
            jdbcTemplate.execute("DROP POLICY IF EXISTS \"Enable read for service role only\" ON public.access_logs");
            jdbcTemplate.execute("DROP POLICY IF EXISTS \"Enable update for service role only\" ON public.access_logs");
            jdbcTemplate.execute("DROP POLICY IF EXISTS \"Enable delete for service role only\" ON public.access_logs");

            jdbcTemplate.execute("CREATE POLICY \"Enable insert for service role only\" ON public.access_logs FOR INSERT TO service_role WITH CHECK ((SELECT auth.role()) = 'service_role')");
            jdbcTemplate.execute("CREATE POLICY \"Enable read for service role only\" ON public.access_logs FOR SELECT TO service_role USING ((SELECT auth.role()) = 'service_role')");
            jdbcTemplate.execute("CREATE POLICY \"Enable update for service role only\" ON public.access_logs FOR UPDATE TO service_role USING ((SELECT auth.role()) = 'service_role') WITH CHECK ((SELECT auth.role()) = 'service_role')");
            jdbcTemplate.execute("CREATE POLICY \"Enable delete for service role only\" ON public.access_logs FOR DELETE TO service_role USING ((SELECT auth.role()) = 'service_role')");

            log.info("Verified Supabase RLS and service_role policies on public.access_logs");
        } catch (Exception ex) {
            log.warn("Skipped automatic RLS enforcement on public.access_logs: {}", ex.getMessage());
        }
    }

    // Detect whether the active JDBC datasource connects to PostgreSQL
    private boolean isPostgreSqlDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            String productName = connection.getMetaData().getDatabaseProductName();
            return productName != null && productName.toLowerCase(Locale.ROOT).contains("postgresql");
        } catch (Exception ex) {
            log.debug("Could not inspect database product metadata for RLS check: {}", ex.getMessage());
            return false;
        }
    }

    // Confirm Supabase service_role, anon, authenticated roles, and auth.role() helper exist
    private boolean isSupabaseAuthEnvironment() {
        Boolean hasSupabaseRoles = jdbcTemplate.queryForObject(
                "SELECT (EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') "
                        + "AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') "
                        + "AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') "
                        + "AND EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace "
                        + "WHERE n.nspname = 'auth' AND p.proname = 'role'))",
                Boolean.class
        );
        return Boolean.TRUE.equals(hasSupabaseRoles);
    }
}
