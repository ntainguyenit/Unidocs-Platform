package com.unidocs.controller.api;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/.well-known")
public class AgentDiscoveryController {

    @GetMapping(value = "/api-catalog", produces = "application/linkset+json")
    public ResponseEntity<Map<String, Object>> getApiCatalog() {
        Map<String, Object> response = Map.of(
            "linkset", List.of(
                Map.of(
                    "anchor", "https://unidocs-husc.pages.dev/api",
                    "service-desc", List.of(Map.of("href", "https://unidocs-husc.pages.dev/openapi.json", "type", "application/openapi+json")),
                    "status", List.of(Map.of("href", "https://unidocs-husc.pages.dev/api/health"))
                )
            )
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/mcp/server-card.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getMcpServerCard() {
        Map<String, Object> response = Map.of(
            "serverInfo", Map.of(
                "name", "UniDocs MCP Server",
                "version", "1.0.0"
            ),
            "transport", Map.of(
                "type", "sse",
                "endpoint", "https://unidocs-husc.pages.dev/mcp/sse"
            ),
            "capabilities", Map.of(
                "tools", Map.of(),
                "resources", Map.of()
            )
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/agent-skills/index.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAgentSkillsIndex() {
        Map<String, Object> response = Map.of(
            "$schema", "https://agentskills.io/schema/index.json",
            "skills", List.of(
                Map.of(
                    "name", "SearchDocuments",
                    "type", "api",
                    "description", "Search for study documents in the UniDocs database.",
                    "url", "https://unidocs-husc.pages.dev/.well-known/agent-skills/search-documents.json"
                )
            )
        );
        return ResponseEntity.ok(response);
    }
}
