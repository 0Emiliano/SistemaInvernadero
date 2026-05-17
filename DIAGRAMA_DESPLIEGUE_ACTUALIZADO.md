# Diagrama de Despliegue Actualizado

Este diagrama refleja el estado real del proyecto y las extensiones planeadas sin asumir Kubernetes como parte ya implementada.

```mermaid
flowchart LR
    %% Entradas
    subgraph devices["Sensores / Dispositivos"]
        temp["Temperatura"]
        hum["Humedad"]
        co2["CO2 / pH / otros"]
        vendor["Fabricante X"]
    end

    subgraph adapters["Ingestion / Adapters"]
        http["HTTP Adapter\nIMPLEMENTADO\nPOST /api/v1/ingest"]
        mqtt["MQTT Adapter\nPLANEADO\nPOST /api/v1/adapters/mqtt"]
        modbus["Modbus Adapter\nPLANEADO\nPOST /api/v1/adapters/modbus"]
        proprietary["Adapter propietario\nPLANEADO"]
    end

    devices --> adapters

    %% Frontend
    subgraph frontend["Frontend - React + Vite + Tailwind"]
        ui["Dashboard operacional\nIMPLEMENTADO"]
        sensorsUi["Vista sensores\nIMPLEMENTADO"]
        ingestionUi["Vista ingestion\nIMPLEMENTADO"]
        alertsUi["Vista alertas\nIMPLEMENTADO"]
        infraUi["Vista infraestructura\nPARCIAL"]
        configUi["Configuracion umbrales\nPLANEADO"]
    end

    %% Backend
    subgraph backend["Backend - Spring Boot 3.x / Java 17"]
        api["REST API\n/api/v1"]
        validation["Validacion DTO\nIMPLEMENTADO"]
        ingestion["IngestionController\nIMPLEMENTADO"]
        demo["DemoController\nPOST /demo/seed\nIMPLEMENTADO"]
        analytics["AnalyticsController\nIMPLEMENTADO"]
        persistenceWorker["PersistenceService\nRabbit consumer\nIMPLEMENTADO"]
        alarmWorker["AlarmService\nRabbit consumer\nIMPLEMENTADO"]
        alertResolve["Resolver alertas\nPATCH /alerts/{id}/resolve\nPLANEADO"]
        thresholdConfig["Umbrales configurables\nPLANEADO"]
        metrics["Micrometer / Actuator\nPARCIAL"]
    end

    frontend -->|HTTP REST| api
    adapters -->|lectura normalizada| api
    api --> validation
    validation --> ingestion
    api --> demo
    api --> analytics
    api --> alertResolve
    api --> thresholdConfig
    backend --> metrics

    %% Mensajeria
    subgraph messaging["Mensajeria - RabbitMQ"]
        exchange["Topic Exchange\ninvernadero.telemetry.exchange"]
        persistenceQueue["Queue persistencia"]
        alertsQueue["Queue alertas"]
        dlq["Dead Letter Queue\nPLANEADO"]
    end

    ingestion -->|routing key\ninvernadero.[greenhouseId].[sensorId]| exchange
    demo -->|lecturas demo| exchange
    exchange --> persistenceQueue
    exchange --> alertsQueue
    exchange -. mensajes invalidos .-> dlq

    persistenceQueue --> persistenceWorker
    alertsQueue --> alarmWorker

    %% Persistencia local
    subgraph dbLocal["Persistencia Local - Docker"]
        timescale["TimescaleDB / PostgreSQL\nIMPLEMENTADO"]
        mediciones["mediciones\nhypertable local"]
        sensores["sensores"]
        alertas["alertas"]
        config["configuracion_umbral\nPLANEADO"]
    end

    persistenceWorker --> mediciones
    persistenceWorker --> sensores
    alarmWorker --> alertas
    thresholdConfig --> config
    alertResolve --> alertas
    dbLocal --- timescale
    timescale --- mediciones
    timescale --- sensores
    timescale --- alertas
    timescale --- config

    %% Supabase
    subgraph supabase["Supabase Compartido - Opcional"]
        supaPg["PostgreSQL 17\nPROYECTO: vwtwbgnbmysjcjvolvbi"]
        supaMed["public.mediciones\nRLS activo"]
        supaSensors["public.sensores\nRLS activo"]
        supaAlerts["public.alertas\nRLS activo"]
        supaNote["TimescaleDB no disponible actualmente\nfallback PostgreSQL"]
    end

    backend -. modo remoto DB_* .-> supaPg
    supaPg --- supaMed
    supaPg --- supaSensors
    supaPg --- supaAlerts
    supaPg --- supaNote

    %% Observabilidad
    subgraph obs["Operacion y Observabilidad"]
        prometheus["Prometheus\nIMPLEMENTADO"]
        grafana["Grafana\nIMPLEMENTADO\nDashboard PLANEADO"]
        businessMetrics["Metricas negocio\nPLANEADO"]
        logs["Logs contenedor / Spring\nIMPLEMENTADO"]
        tracing["Tracing Jaeger\nFUERA DE ALCANCE ACTUAL"]
    end

    prometheus -->|scrape /actuator/prometheus| metrics
    grafana -->|datasource| prometheus
    metrics -. lecturas, sensores, alertas .-> businessMetrics

    %% Infra
    subgraph infra["Infraestructura Actual"]
        compose["Docker Compose\nIMPLEMENTADO"]
        volumes["Docker Volumes\npersistencia local"]
        backup["Backup / Restore\nPLANEADO\ninfra/backup"]
        ci["GitHub Actions CI\nPLANEADO"]
        k8s["Kubernetes\nFASE FUTURA"]
    end

    compose --> frontend
    compose --> backend
    compose --> messaging
    compose --> dbLocal
    compose --> obs
    volumes --> timescale
    backup --> timescale
    ci -. build/test/config .-> compose
    k8s -. reemplazo futuro .-> compose
```

## Lectura Rapida

- **Implementado hoy:** frontend, backend, HTTP ingestion, RabbitMQ, TimescaleDB local, sensores persistentes, alertas persistentes, endpoint demo, Prometheus, Grafana base y Supabase con tablas equivalentes.
- **Planeado proximo:** metricas de negocio, dashboard Grafana provisionado, resolver alertas, umbrales configurables, adaptadores MQTT/Modbus simulados, backup/restore y CI.
- **Fase futura:** Kubernetes, tracing distribuido y protocolos reales MQTT/Modbus si el alcance lo requiere.

