# DOCUMENTACIÓN TÉCNICA: Sistema de Sensores en Invernadero
## Arquitectura de Software Distribuida y Escalamiento

---

### 1. MODELO DE DOMINIO Y ESTRUCTURA (Features)
Inspirado en la estructura de `api-tattoo`, el backend en Java se ha organizado bajo el patrón **Modular by Feature** dentro de un ecosistema **Core-Shared**:

*   **com.greenhouse.sensors.core**: Contiene la lógica transversal no funcional.
    *   `responses`: Estandarización de `ApiResponse<T>` (Success, Message, Data).
    *   `exceptions`: `GlobalExceptionHandler` para captura de errores síncronos y asíncronos.
    *   `security`: Filtros de seguridad y configuración de CORS (migrado de api-tattoo).
*   **com.greenhouse.sensors.modules**: Lógica de negocio segmentada.
    *   `ingestion`: Manejo de protocolos TCP y Adapters de fabricantes.
    *   `registry`: Inventario de sensores e invernaderos.
    *   `alarm`: Procesamiento de eventos en tiempo real.
*   **com.greenhouse.sensors.shared**: Modelos canónicos compartidos (`SensorReading`) para evitar dependencias circulares entre módulos.

---

### 2. ESTRATEGIA DE COMUNICACIÓN
El sistema utiliza un modelo de **Comunicación Híbrida**:

| Flujo | Protocolo | Tipo | Motivo |
|:---|:---|:---|:---|
| **Ingesta (Sensor -> M2)** | TCP Binario | Síncrono/Stream | Eficiencia en volumen de datos. |
| **Normalización (M2 -> M3)** | AMQP (RabbitMQ) | Asíncrono | Desacoplamiento para que fallos en alarmas no pierdan datos. |
| **Evaluación (M3 -> M4)** | AMQP | Asíncrono | Reactividad inmediata ante cambios críticos. |
| **Consulta (BI -> M6)** | REST (HTTP/JSON) | Síncrono | Compatibilidad universal con herramientas de Business Intelligence. |

---

### 3. PATRONES DE DISEÑO CLAVE
1.  **Adapter Pattern:** Implementado en la capa de ingesta. Cada nuevo fabricante de sensores solo requiere una nueva clase que implemente `SensorAdapter`, permitiendo que el sistema sea agnóstico al hardware.
2.  **Strategy Pattern:** Para la selección dinámica del adaptador basada en los metadatos del Gateway.
3.  **Observer (vía RabbitMQ):** Múltiples servicios "observan" el flujo de telemetría sin que el productor tenga que conocer su existencia.

---

### 4. ASPECTOS DE SEGURIDAD (Adaptados de api-tattoo)
*   **Rate Limiting:** Se ha definido que la ingesta técnica por Gateway tenga un límite para prevenir ataques de denegación de servicio o fallos de sensores que envíen datos infinitos.
*   **Validación de Origen:** El uso de headers `X-Manufacturer` y firmas de validación para asegurar que solo Gateways autorizados puedan inyectar datos al servidor TCP/HTTP.
