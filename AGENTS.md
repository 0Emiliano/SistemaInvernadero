# REGLAS DE PROYECTO: Greenhouse Sensor System

### Estándar de Codificación
*   **Lenguaje:** Java 17+ con Spring Boot 3.x.
*   **Arquitectura:** Modular por Feature (Dominio).
*   **Patrones Obligatorios:** 
    *   `Adapter` para ingesta de sensores.
    *   `ApiResponse<T>` para todos los controladores.
    *   `GlobalExceptionHandler` para todas las excepciones.

### Estructura de Paquetes
Cualquier nuevo módulo debe seguir esta jerarquía:
`com.greenhouse.sensors.modules.[feature_name].[controller|service|repository|dto]`

### Reglas de Mensajería
*   Todos los eventos de telemetría deben pasar por RabbitMQ a través del exchange `greenhouse.telemetry.exchange`.
*   Las Routing Keys deben seguir el patrón: `greenhouse.[id_invernadero].[id_sensor]`.

### Referencia Histórica
Este proyecto hereda la lógica de validación y seguridad del repositorio `api-tattoo` de @0Emiliano, pero adaptándola a un entorno de backend distribuido de alta frecuencia.
