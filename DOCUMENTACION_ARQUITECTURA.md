# DOCUMENTACIÓN TÉCNICA: Sistema de Sensores en Invernadero
## Arquitectura de Software Distribuida y Escalamiento

---

### 1. MODELO DE DOMINIO Y ESTRUCTURA (Features)
Inspirado en la estructura de `api-tattoo`, el backend en Java se ha organizado bajo el patrón **Modular by Feature** para cumplir con los objetivos de monitoreo ambiental:

*   **com.sistemas.invernadero.core**: Lógica transversal (ApiResponse, GlobalExceptionHandler).
*   **com.sistemas.invernadero.modules**:
    *   `ingestion`: Servidor TCP (Puerto 9000) que aplica el **Patrón Adapter** para normalizar múltiples protocolos (Bosch, Honeywell).
    *   `alarm`: Servicio reactivo que consume de RabbitMQ para detectar anomalías críticas.
    *   `persistence`: Consumidor especializado que mapea telemetría a **TimescaleDB**.
    *   `analytics`: Agregaciones SQL para Dashboards y BI.

---

### 2. FLUJO DE TELEMETRÍA (RabbitMQ Topic Exchange)
El sistema utiliza RabbitMQ como pivote central para asegurar la resiliencia:
1.  **Ingesta (M2)**: El Gateway envía datos. El adaptador los convierte a POJO y los publica con la routing key: `invernadero.[GW_ID].[SENSOR_ID]`.
2.  **Distribución**: RabbitMQ entrega copias a las colas suscritas.
3.  **Persistencia**: La cola `persistence.queue` recibe todo el tráfico (`invernadero.#`) y lo vuelca a la Hypertable de TimescaleDB.
4.  **Alarmas**: La cola `alarm.queue` evalúa los datos y dispara notificaciones si los umbrales se superan.

---

### 3. PERSISTENCIA DE SERIES DE TIEMPO (TimescaleDB)
A diferencia de PostgreSQL estándar, usamos **Hypertables**:
*   **Segmentación**: Los datos se dividen automáticamente en "chunks" por tiempo.
*   **Rendimiento**: Consultas de rangos históricos son hasta 100x más rápidas que en tablas tradicionales.
*   **Mantenimiento**: Facilita políticas de retención de datos antiguas sin bloquear la base de datos.

---

### 4. DASHBOARD Y ANALÍTICA (React + Recharts)
La capa de presentación (Frontend) provee:
*   **KPIs en Tiempo Real**: Temperatura promedio, alertas activas y salud del sensor.
*   **Tendencias**: Gráficos de área y líneas para predecir comportamientos ambientales.
*   **Responsive Design**: Interfaz adaptable construida con Tailwind CSS y Framer Motion.

---

### 5. INFRAESTRUCTURA Y DESPLIEGUE (Docker)
El sistema está orquestado mediante Docker Compose, garantizando que todos los componentes (App, RabbitMQ, TimescaleDB) se comuniquen en una red privada y aislada.

---

### 6. SEGURIDAD (Heredada de api-tattoo)
*   **Validation Layer**: Sanitización de inputs binarios para prevenir inyecciones.
*   **Auth (Planned)**: Extensión de seguridad basada en JWT para el acceso al Dashboard de Administración.
