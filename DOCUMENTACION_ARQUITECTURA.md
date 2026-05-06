# DOCUMENTACIÓN TÉCNICA: Sistema de Sensores en Invernadero
## Arquitectura de Software Distribuida y Escalamiento

---

### 1. SELECCIÓN DE TECNOLOGÍA
Se ha optado por una arquitectura orientada a eventos (Event-Driven Architecture) con una estructura **Modular por Feature**, inspirada en estándares industriales para facilitar el mantenimiento y la escalabilidad.

*   **API de Integración:** **Spring Boot (Java 17)**. Organizada en módulos independientes (`ingestion`, `registry`, `alarm`) para garantizar que cada característica del sistema sea autocontenida.
*   **Manejo de Errores:** Centralizado mediante un `GlobalExceptionHandler` que asegura que todas las respuestas de error sigan el formato `{ success: false, message: ... }`.
*   **Contrato de Respuesta:** Todas las respuestas están envueltas en un objeto `ApiResponse` para consistencia con el ecosistema de frontend y servicios externos.

---

### 2. JUSTIFICACIÓN TÉCNICA
*   **Escalabilidad Horizontal:** Cada componente (Ingestor, Alarm Service, Persistence) se ejecuta en contenedores independientes. Si aumenta el número de invernaderos, basta con replicar el módulo de Ingesta y el Alarm Service sin afectar la base de datos.
*   **Desacoplamiento:** El servidor TCP no "sabe" nada sobre el envío de correos o el almacenamiento. Solo publica un mensaje en RabbitMQ siguiendo un modelo canónico. Esto permite añadir nuevas funcionalidades (ej. un módulo de IA) simplemente suscribiéndolo a la cola existente.
*   **Rendimiento:** El uso del **Patrón Adapter** en la capa de ingesta permite procesar formatos de diferentes fabricantes en microsegundos, convirtiéndolos a un formato común antes de entrar al núcleo del sistema.

---

### 3. DESARROLLO DE MÓDULOS
| ID | Módulo | Responsabilidad | Entidades |
|:---|:---|:---|:---|
| **M1** | Sensor Registry | Gestión de inventario, registro de sensores y su asociación a invernaderos específicos. | Sensor, Greenhouse, Manufacturer |
| **M2** | Data Ingestion | Servidor TCP persistente. Recepción de bytes, selección del Adapter por fabricante y normalización. | RawPayload, SensorReading |
| **M3** | Messaging | Gestión del ciclo de vida del mensaje en el broker (RabbitMQ), colas de reintento y dead-lettering. | Exchange, Queue, RoutingKey |
| **M4** | Alarm Service | Servicio reactivo que evalúa cada lectura contra reglas de umbral (temp > X). Disparador de notificaciones. | AlarmRule, Notification, Event |
| **M5** | Persistence | Consumidor de alta velocidad encargado de Batch Inserts en TimescaleDB y políticas de retención. | Hypertables, Reading |
| **M6** | REST API | Gateway de salida. Autenticación, gestión de reglas y exposición de datos para Business Intelligence. | User, JWT, AnalyticsReport |

---

### 4. INTEGRACIÓN Y COMUNICACIÓN (FLUJO DE DATOS)
1.  **Sensor -> M2:** Envío de payload binario vía TCP.
2.  **M2 -> M3:** Normalización a JSON y publicación en Exchange tipo `topic` (ej: `greenhouse.12.temp`).
3.  **M3 -> M4/M5:** RabbitMQ replica el mensaje a la cola de alarmas y a la de persistencia simultáneamente.
4.  **M4 (Alarm):** Evalúa la regla. Si hay exceso, envía SMTP o Push de forma asíncrona.
5.  **M5 (Store):** Realiza un insert optimizado en la serie de tiempo.
6.  **Sistemas Externos -> M6:** Realizan consultas síncronas HTTP para obtener dashboards y estadísticas.

---

### 5. DIAGRAMAS INTEGRADOS
*   **Componentes:** Refleja la separación física de los módulos y cómo el Message Broker actúa como el tejido conector entre la ingesta (Producer) y la lógica (Consumer).
*   **Despliegue:** Muestra la topología de red desde la capa física (Edge/Sensores) a través del Gateway, pasando por el Firewall hacia el Cluster Cloud donde residen los microservicios y los nodos de base de datos.

---
**Nota de Diseño:** Esta arquitectura cumple con los requerimientos de extensibilidad para soportar nuevas marcas de sensores mediante el reemplazo o adición de "Adapters" sin interrumpir la operación global.
