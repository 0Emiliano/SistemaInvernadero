# Diagrama de Componentes Actualizado

Este diagrama representa los componentes reales del proyecto y las piezas planeadas para alinearlo mejor con el diagrama original sin sobreingenieria.

```mermaid
flowchart LR
    %% Frontend
    subgraph frontend["Frontend - React + Vite + Tailwind"]
        app["App.tsx\nOrquestacion UI"]
        shell["Shell\nLayout / Sidebar"]
        dashboard["Dashboard\nStatGrid / Chart / AlertLog / Terminal"]
        sensorsUi["SensorList\nInventario sensores"]
        ingestionUi["IngestionView\nEnvio lecturas / registro"]
        infraUi["InfraView\nEstado infraestructura visual"]
        apiClient["invernaderoApi.ts\nCliente REST Axios"]
        types["types.ts\nContratos frontend"]
    end

    app --> shell
    app --> dashboard
    app --> sensorsUi
    app --> ingestionUi
    app --> infraUi
    app --> apiClient
    apiClient --> types

    %% API backend
    subgraph backend["Backend - Spring Boot 3.x"]
        subgraph controllers["Controllers"]
            ingestionController["IngestionController\nPOST /ingest\nGET /health"]
            analyticsController["AnalyticsController\nDashboard / Sensors / Alerts"]
            demoController["DemoController\nPOST /demo/seed"]
            adaptersController["AdaptersController\nMQTT / Modbus\nPLANEADO"]
            configController["ConfigController\nUmbrales\nPLANEADO"]
        end

        subgraph dto["DTO / Validacion"]
            readingRequest["SensorReadingRequest\nValidacion temperatura/humedad"]
            apiResponse["ApiResponse<T>\nRespuesta universal"]
            exceptionHandler["GlobalExceptionHandler\nErrores y validacion"]
        end

        subgraph services["Services"]
            sensorService["SensorService\nRegistro y listado sensores"]
            persistenceService["PersistenceService\nConsume y guarda lecturas"]
            alarmService["AlarmService\nEvalua y crea alertas"]
            metricsService["Business Metrics\nMicrometer\nPLANEADO"]
            thresholdService["ThresholdService\nUmbrales configurables\nPLANEADO"]
        end

        subgraph repositories["Repositories"]
            readingRepo["SensorReadingRepository"]
            sensorRepo["SensorRepository"]
            alertRepo["AlertRepository"]
            thresholdRepo["ThresholdRepository\nPLANEADO"]
        end

        subgraph models["Domain / Entities"]
            readingModel["SensorReading\nMensaje normalizado"]
            readingEntity["SensorReadingEntity\nmediciones"]
            sensorEntity["SensorEntity\nsensores"]
            alertEntity["AlertEntity\nalertas"]
            thresholdEntity["ThresholdEntity\nPLANEADO"]
        end

        rabbitConfig["RabbitConfig\nExchange / Queues / Bindings"]
    end

    %% Relationships frontend-backend
    apiClient -->|HTTP REST| ingestionController
    apiClient -->|HTTP REST| analyticsController
    apiClient -->|HTTP REST| demoController
    apiClient -. futuro .-> configController

    %% Controller internals
    ingestionController --> readingRequest
    ingestionController --> apiResponse
    analyticsController --> apiResponse
    demoController --> apiResponse
    adaptersController -. normaliza .-> readingModel
    configController -. usa .-> thresholdService
    exceptionHandler --> apiResponse

    %% Services
    ingestionController -->|publica mensaje| rabbitConfig
    demoController -->|publica mensajes demo| rabbitConfig
    persistenceService --> readingRepo
    persistenceService --> sensorService
    alarmService --> alertRepo
    alarmService -. consulta .-> thresholdService
    thresholdService -. usa .-> thresholdRepo
    metricsService -. instrumenta .-> ingestionController
    metricsService -. instrumenta .-> alarmService

    %% Repositories to entities
    readingRepo --> readingEntity
    sensorRepo --> sensorEntity
    alertRepo --> alertEntity
    thresholdRepo -.-> thresholdEntity
    sensorService --> sensorRepo
    sensorService --> readingRepo

    %% Messaging
    subgraph messaging["Messaging - RabbitMQ"]
        exchange["Topic Exchange\ninvernadero.telemetry.exchange"]
        qPersist["Queue persistencia"]
        qAlerts["Queue alertas"]
        dlq["Dead Letter Queue\nPLANEADO"]
    end

    rabbitConfig --> exchange
    exchange --> qPersist
    exchange --> qAlerts
    exchange -. errores .-> dlq
    qPersist --> persistenceService
    qAlerts --> alarmService

    %% Persistence
    subgraph database["Database"]
        db["TimescaleDB local / PostgreSQL Supabase"]
        mediciones["mediciones"]
        sensores["sensores"]
        alertas["alertas"]
        thresholdTable["configuracion_umbral\nPLANEADO"]
    end

    readingEntity --> mediciones
    sensorEntity --> sensores
    alertEntity --> alertas
    thresholdEntity -.-> thresholdTable
    mediciones --> db
    sensores --> db
    alertas --> db
    thresholdTable -.-> db

    %% Observability
    subgraph observability["Observabilidad"]
        actuator["Spring Actuator\n/actuator/prometheus"]
        prometheus["Prometheus"]
        grafana["Grafana"]
        logs["SLF4J + Logback"]
    end

    backend --> actuator
    actuator --> prometheus
    prometheus --> grafana
    backend --> logs
```

## Estado de Componentes

| Componente | Estado |
|---|---|
| Frontend dashboard | Implementado |
| Cliente REST frontend | Implementado |
| IngestionController HTTP | Implementado |
| Validacion DTO | Implementado |
| RabbitMQ exchange/queues | Implementado |
| PersistenceService | Implementado |
| AlarmService | Implementado |
| Sensores persistentes | Implementado |
| Alertas persistentes | Implementado |
| Demo seed endpoint | Implementado |
| Metricas tecnicas Actuator | Parcial |
| Metricas de negocio | Planeado |
| Resolver alertas | Planeado |
| Umbrales configurables | Planeado |
| Adapters MQTT/Modbus simulados | Planeado |
| DLQ RabbitMQ | Planeado |

