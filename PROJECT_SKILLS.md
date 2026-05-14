# PROJECT SKILLS: Domain Knowledge & Workflows

This document provides specialized knowledge bases for the System Invernadero.

## Skill: Ingestion Adapter Development
*   **Goal:** Create a new sensor adapter in < 5 minutes.
*   **Workflow:**
    1. Define the incoming payload format (Binary/JSON).
    2. Create a specific POJO for mapping.
    3. Implement `SensorAdapter` supports and parse methods.
    4. Register as a Spring `@Component`.
*   **Domain:** IoT protocols, Binary parsing, JSON mapping.

## Skill: Hypertable Optimization (TimescaleDB)
*   **Goal:** Maintain sub-second query speeds on millions of rows.
*   **Knowledge Base:**
    - Use `create_hypertable` on `timestamp` columns.
    - Set `chunk_time_interval` to fit in RAM.
    - Use `time_bucket` for efficient aggregations.
    - Implement `continuous aggregates` for dashboards.
*   **Domain:** Time-series databases, SQL Aggregates.

## Skill: RabbitMQ Troubleshooting & Flow
*   **Goal:** Fix connectivity and message loss.
*   **Workflow:**
    1. Check `localhost:15672` for unacknowledged messages.
    2. Verify `Routing Key` matches the binding.
    3. Inspect the `Jackson2JsonMessageConverter` logs for deserialization errors.
*   **Domain:** Message brokers, Event-driven architecture.

## Skill: Industrial UI & Visualization
*   **Goal:** Create distinctive industrial dashboards for high-pressure environments.
*   **Principles:**
    - High contrast for readability in bright greenhouse environments.
    - Large touch targets for operators wearing gloves.
    - Staggered animations using `framer-motion` for visual hierarchy.
    - Real-time data updates via Axios/WebSocket pooling.
*   **Domain:** Frontend design, UX for industrial IoT.
