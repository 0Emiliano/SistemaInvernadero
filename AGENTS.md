# REGLAS DE PROYECTO: Sistema Invernadero

### Estándar de Codificación y Stack
*   **Backend:** Java 17+ con Spring Boot 3.x.
*   **Frontend:** React 18+ con TypeScript, Tailwind CSS, y Recharts para visualización.
*   **Arquitectura:** Modular por Feature (Dominio) tanto en Backend como en carpetas de frontend.
*   **Patrones Obligatorios:** 
    *   `Adapter` para ingesta de sensores (Backend).
    *   `ApiResponse<T>` para todos los controladores.
    *   `GlobalExceptionHandler` para todas las excepciones.
    *   `KPI Cards` y `Responsive Charts` para el Dashboard.

### Estructura de Paquetes (Backend)
Cualquier nuevo módulo debe seguir esta jerarquía:
`com.sistemas.invernadero.modules.[feature_name].[controller|service|repository|dto]`

### Reglas de Mensajería (RabbitMQ)
*   **Exchange:** `invernadero.telemetry.exchange` (Tipo: Topic).
*   **Routing Keys Pattern:** `invernadero.[id_invernadero].[id_sensor]`.
*   **Queues:** 
    *   `persistence.queue`: Enlazado a `invernadero.#`.
    *   `alarm.queue`: Enlazado a `invernadero.#` (o filtros específicos).
*   **Configuración:** Siempre usar `Jackson2JsonMessageConverter` para la interoperabilidad de POJOs.

### Persistencia y Series de Tiempo
*   **Base de Datos:** TimescaleDB (PostgreSQL 15+).
*   **Hypertables:** Todas las tablas de mediciones masivas deben ser Hypertables segmentadas por la columna `timestamp`.
*   **Consultas:** Priorizar agregaciones de tiempo (`AVG`, `MAX`) sobre rangos UTC.

### Dashboard UI Standards
*   **Paleta:** Fondo `#F8FAFC` (Slate 50), Acentos en `Emerald 500` (Salud) y `Orange 500` (Temperatura).
*   **Librerías:** `framer-motion` (motion/react) para transiciones y `lucide-react` para iconografía.
*   **Comportamiento:** Los datos mostrados deben reflejar la agregación del módulo de `Analytics`.

### Referencia Histórica
Este proyecto hereda la lógica de validación y seguridad del repositorio `api-tattoo` de @0Emiliano, pero adaptándola a un entorno de backend distribuido de alta frecuencia y monitoreo industrial.

## 🛠️ Infraestructura y Gestión de Agentes
Para escalar el desarrollo y asegurar la consistencia, todos los agentes deben seguir estos documentos:
*   **[INFRA_STANDARDS.md](./INFRA_STANDARDS.md):** Estándares de Docker, RabbitMQ y TimescaleDB.
*   **[AGENT_TASKS.md](./AGENT_TASKS.md):** Delegación de tareas paralelas por dominio.
*   **[WORKSPACE_GUIDELINES.md](./WORKSPACE_GUIDELINES.md):** Control de comportamiento y calidad de código.
*   **[PROJECT_SKILLS.md](./PROJECT_SKILLS.md):** Reutilización de conocimiento en el ecosistema.
*   **[AUTOMATION_CONFIG.json](./AUTOMATION_CONFIG.json):** Disparadores de tareas automáticas.
