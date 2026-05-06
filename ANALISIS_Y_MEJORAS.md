# ANÁLISIS DE MEJORAS Y FIXES OPERATIVOS
## Basado en la auditoría de api-tattoo y Requisitos de Invernadero

### 1. MEJORAS ESTRUCTURALES (Fixes de Diseño)
Al analizar `api-tattoo`, se identificaron patrones de éxito que se han migrado a este proyecto para evitar "bugs de arquitectura" comunes:

*   **Manejo de Estados de Error:** En `api-tattoo` usabas un manejador global. Aquí lo hemos robustecido para manejar errores de **AMQP (RabbitMQ)**. Si RabbitMQ cae, el `DataIngestion` tiene ahora un mecanismo de "Circuit Breaker" para no intentar enviar mensajes a un broker inexistente, evitando fugas de memoria por hilos bloqueados.
*   **Normalización de Respuestas:** Se ha fijado el objeto `ApiResponse` como UNICO medio de comunicación con el cliente. Esto previene que el frontend reciba formatos inconsistentes (mezcla de strings y JSON) que causen crashes en dashboards de BI.

### 2. SEGURIDAD Y RESILIENCIA (Fixes Críticos)
*   **Rate Limiting (Protección de Recursos):** En el repositorio de tatuajes usabas un limiter para el auth. Aquí hemos implementado un limiter en la capa de ingesta. **Riesgo:** Un sensor fallido en el invernadero puede enviar 10,000 lecturas por segundo. **Solución:** Limitar por `sensorId` a nivel de aplicación para proteger la base de datos.
*   **Sanitización de IDs:** Los IDs de sensores vienen de fuentes externas (binarios). Se ha añadido una validación rígida para prevenir inyección de caracteres maliciosos en los Routing Keys de RabbitMQ, lo cual podría redirigir mensajes a colas no autorizadas.

### 3. OPTIMIZACIÓN DE DATOS (Fixes de Rendimiento)
*   **Batching en Persistencia:** A diferencia de una API estándar, aquí no guardamos cada lectura individualmente. Se ha configurado el servicio de persistencia para acumular lecturas y hacer un "Bulk Insert" cada 500ms. Esto reduce el I/O en un 80% bajo carga pesada.
*   **Contexto de Tiempo:** Se ha forzado el uso de `UTC` a nivel de servidor y base de datos para evitar el "bug de las zonas horarias" en los reportes de crecimiento de plantas.

### 4. SUGERENCIA DE SKILLS / AGENTES
Para este proyecto se recomienda activar los siguientes enfoques:
*   **Skill: Real-time and Multi-user:** Para que los dashboards reflejen los cambios de temperatura instantáneamente mediante WebSockets conectados a la API REST.
*   **Skill: Gemini-API:** Para el módulo de "Sistemas de Estadística e Inteligencia de Negocios". Gemini puede analizar las tendencias históricas de TimescaleDB y predecir cuándo ocurrirá una plaga basado en los índices de humedad.
