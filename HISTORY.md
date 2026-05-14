# HISTORY: Evolución del Sistema Invernadero

Este documento recopila paso a paso la construcción del sistema, desde la conceptualización hasta la implementación técnica final.

## Fase 1: Alineación Arquitectónica
- **Objetivo**: Migrar el estándar de calidad de `api-tattoo` (emiliano.rascon) a un entorno de IoT/Invernadero.
- **Acciones**:
    - Creación de `DOCUMENTACION_ARQUITECTURA.md` definiendo el patrón **Modular by Feature**.
    - Definición de los módulos: `Ingestion`, `Registry`, `Alarm`, `Analytics` y `Persistence`.
    - Establecimiento del exchange de RabbitMQ (`invernadero.telemetry.exchange`) y el patrón de Routing Keys (`invernadero.[ID].[SENSOR]`).

## Fase 2: Desarrollo del Núcleo (Backend Java)
- **Infraestructura**:
    - Configuración de `pom.xml` con Spring Boot 3.x, Spring Integration IP (TCP) y Spring AMQP.
    - Creación de `Dockerfile` y `docker-compose.yml` para orquestar la App, **RabbitMQ** y **TimescaleDB**.
- **Ingesta Multi-Fabricante (Patrón Adapter)**:
    - Implementación de la interfaz `SensorAdapter`.
    - Creación de adaptadores específicos: `BoschSensorAdapter` (binario) y `HoneywellSensorAdapter` (JSON sobre binario).
    - Configuración de un servidor TCP en el puerto 9000 para recibir datos directos del Gateway.
- **Mensajería Reactiva**:
    - Configuración de RabbitMQ con una cola de Persistencia y una de Alarmas (Fan-out selectivo).
    - Implementación de `AlarmService` para detección de umbrales en tiempo real.

## Fase 3: Persistencia de Series de Tiempo
- **Base de Datos**:
    - Conexión a **TimescaleDB**.
    - Creación de `schema.sql` transformando la tabla `mediciones` en una **Hypertable** para manejar millones de registros con alto rendimiento.
    - Repositorio JPA con consultas personalizadas para promedios y dashboards de BI.

## Fase 4: Experiencia de Usuario (Frontend React)
- **Dashboard de Monitoreo**:
    - Interfaz construida con **Tailwind CSS** y **Lucide-React**.
    - Visualización de datos mediante **Recharts** (AreaChart para temperatura, LineChart para humedad).
    - Implementación de estados KPI para alertas, sensores activos y promedios.
    - Tipado estricto en TypeScript para evitar errores en tiempo de ejecución.

## Fase 5: Estabilización y Refinamiento
- **Documentación**: Generación de `ANALISIS_Y_MEJORAS.md` con auditoría de diseño.
- **Optimización**: 
    - Inyección de `Jackson2JsonMessageConverter` para serialización limpia entre Java y RabbitMQ.
    - Manejo global de excepciones (`GlobalExceptionHandler`) para errores de ingesta y base de datos.
    - Implementación de `application.properties` con soporte para variables de entorno (Docker-ready).

## Fase 6: Gobernanza de Agentes e Infraestructura Pro
- **Estándares**: 
    - Creación de `INFRA_STANDARDS.md` para Docker, K8s, RabbitMQ y TimescaleDB.
    - Implementación de `K8S_MANIFEST.yml` para despliegue en clusters de Kubernetes.
- **Gestión de Agentes**:
    - Definición de `AGENT_TASKS.md` para ejecución paralela de tareas por dominio.
    - Establecimiento de `WORKSPACE_GUIDELINES.md` para control de comportamiento AI.
    - Creación de `PROJECT_SKILLS.md` para transferencia de conocimiento técnica.
- **Automatización**: Configuración de `AUTOMATION_CONFIG.json` para disparadores de tareas.
- **Frontend Pro**: Integración de `analyticsService` real con Axios en el Dashboard, sustituyendo mocks por telemetría viva.

---
**Estado Actual**: Proyecto 100% Funcional. Listo para despliegue en entornos productivos.
