# INFRASTRUCTURE STANDARDS: Sistema Invernadero

This document defines the technical standards for the deployment and operation of the greenhouse system infrastructure.

## 1. Containerization (Docker & Kubernetes)
*   **Base Images:** Always use slim or alpine versions for production (e.g., `openjdk:17-jdk-slim`).
*   **Multi-stage Builds:** Mandatory for all microservices to keep image sizes small.
*   **Networking:** Services must communicate via a dedicated internal network. 
*   **Kubernetes (Future):** 
    - Deployments must use `RollingUpdate` strategy.
    - Resources must have `limits` and `requests` defined.
    - Liveness and Readiness probes must point to `/api/health`.

## 2. Messaging (RabbitMQ)
*   **Exchange Type:** `Topic` is mandatory for telemetry to allow selective routing and future scalability.
*   **Durability:** Both exchanges and queues must be marked as `durable`.
*   **Acknowledgements:** Consumers must use `manual` acknowledgements to ensure "at-least-once" delivery.
*   **Dead Letter Exchange (DLX):** All queues should have a DLX for failed message handling.
*   **Serialization:** Mandatory use of `Jackson2JsonMessageConverter` for consistent JSON POJO mapping.

## 3. Persistence (TimescaleDB)
*   **Hypertables:** Every telemetry table must be a Hypertable partitioned by `timestamp`.
*   - **Chunk Interval:** Default to 1 day for high-frequency sensors.
*   **Indexing:** Compound indexes on `(greenhouse_id, sensor_id, timestamp DESC)` are mandatory.
*   **Retention Policy:** Implement automatic data compression for chunks older than 30 days.

## 4. Backend (Spring Boot)
*   **Port Mapping:** Internal `3000` for API, `9000` for TCP ingestion.
*   **Health Checks:** Actuator must be enabled.
*   **Logging:** JSON format for production logs, human-readable for dev.

## 5. Security
*   **Environment Variables:** No secrets in `application.properties`. Use `${VAR_NAME}` syntax.
*   **CORS:** Strictly restricted to the production frontend domain.
