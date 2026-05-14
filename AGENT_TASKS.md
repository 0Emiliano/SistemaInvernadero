# AGENT TASKS: Parallel Execution Guide

This document delegates specific tasks to AI agents for simultaneous execution within the greenhouse project.

## Agent A: Telemetry & Ingestion (The "Collector")
*   **Domain:** Ingestion, Adapters, TCP Server.
*   **Tasks:**
    - Develop and test new `SensorAdapter` implementations for generic manufacturers.
    - Optimize TCP buffer handling in `TcpServerConfig`.
    - Implement binary checksum verification for payload integrity.

## Agent B: Processing & Persistence (The "Archivist")
*   **Domain:** Persistence, TimescaleDB, RabbitMQ.
*   **Tasks:**
    - Monitor Hypertable performance and chunk distribution.
    - Implement batching logic in `PersistenceService` to reduce DB I/O.
    - Configure RabbitMQ Dead Letter Queues and retry mechanisms.

## Agent C: Monitoring & Alerts (The "Guardian")
*   **Domain:** Alarm Module, Notifications.
*   **Tasks:**
    - Refine alarm thresholds based on plant-specific biological needs.
    - Implement notification throttling to prevent "alert fatigue".
    - Integrate external notification APIs (Email, SMS, Webhooks).

## Agent D: Insights & UI (The "Visionary")
*   **Domain:** Analytics, Frontend, Recharts.
*   **Tasks:**
    - Develop new aggregation queries in `SensorReadingRepository`.
    - Update `Dashboard.tsx` with predictive trend lines (Future Gemini integration).
    - Ensure 100% responsive design across mobile and industrial tablets.
