# UniDocs Agent Authentication

No authentication is required for public endpoints on UniDocs.
The public features include document browsing, studying tools, and feedback submission, which are available to all users (and AI agents) without registration or tokens.

For administrative endpoints (`/admin/**`), authentication is handled via a private internal session mechanism which is not exposed for agent integration.
