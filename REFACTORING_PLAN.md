# Refactoring Plan - Limpieza & Funcionalidad Local

**Objetivo**: Backend mínimo + Frontend totalmente funcional + Docker-compose para levantar todo local

---

## 1️⃣ BACKEND CLEANUP

### Remover:
- ❌ JWT Authentication (AuthController, JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig)
- ❌ Complex adapters (solo dejar ingestion HTTP simple)
- ❌ TCP server complexity
- ❌ Registry module (sensor inventory)
- ❌ GlobalExceptionHandler (dejar simple)
- ❌ Test files (backend tests, integration tests)

### Mantener (ESENCIAL):
- ✅ IngestionController (HTTP POST /ingest)
- ✅ AnalyticsController (GET /dashboard)
- ✅ RabbitConfig (exchange + queues)
- ✅ AlarmService (threshold detection)
- ✅ PersistenceService (DB save)
- ✅ SensorReading models

### Endpoints finales:
```
POST /ingest                  → Recibir telemetría
GET  /dashboard/{greenhouseId} → Datos para dashboard
GET  /alerts                  → Alertas activas
GET  /sensors                 → Listado sensores
POST /sensors/register        → Registrar nuevo sensor
```

---

## 2️⃣ FRONTEND ENHANCEMENT

### UI Improvements:
- Remover: Componentes mock, botones no funcionales
- Agregar: Real data consumption, interactive controls

### Nuevas secciones:
```
Dashboard (actualmente existe):
  - Temperatura real ✅
  - Humedad real ✅
  - Alertas vivas (nuevo)
  - Sensores listados (nuevo)

Ingestion Panel (nuevo):
  - Formulario para enviar telemetría
  - Preview de datos
  - Confirmación

Sensors Panel (nuevo):
  - Listado de sensores
  - Registrar nuevo sensor
  - Estado de cada sensor

Alerts Panel (nuevo):
  - Alertas en tiempo real
  - Historial
  - Filtrado por tipo
```

### Endpoints a consumir:
```
GET  /api/v1/analytics/dashboard/{id}
GET  /api/v1/alerts
GET  /api/v1/sensors
POST /api/v1/sensors/register
POST /api/v1/ingest
```

---

## 3️⃣ LOCAL DOCKER-COMPOSE

Makefile + docker-compose para:
```bash
make start          # Levanta todo
make stop           # Baja todo
make logs           # Ver logs
make shell-backend  # Conectar a backend
make shell-db       # Conectar a DB
make clean          # Limpiar
```

---

## 📋 TAREAS

| # | Componente | Acción | Tiempo |
|---|-----------|--------|--------|
| 1 | Backend   | Remover JWT, simplificar | 10 min |
| 2 | Backend   | Agregar endpoints faltantes | 10 min |
| 3 | Backend   | Limpiar código | 5 min |
| 4 | Frontend  | Agregar Sensors panel | 10 min |
| 5 | Frontend  | Agregar Alerts panel | 10 min |
| 6 | Frontend  | Agregar Ingestion panel | 10 min |
| 7 | Frontend  | Limpiar botones no funcionales | 5 min |
| 8 | Docker    | Crear/actualizar docker-compose | 5 min |
| 9 | Scripts   | Crear Makefile | 5 min |
| 10| Testing   | Verificar end-to-end local | 10 min |

**Total: ~80 minutos**

---

## 🎯 Resultado Final

✅ Backend simple (sin JWT, sin TCP, sin overengineering)
✅ Frontend con 4 paneles funcionales
✅ `docker-compose up` levanta todo (Backend, Frontend, RabbitMQ, TimescaleDB)
✅ `make start` automatiza todo
✅ Todos los botones funcionales
✅ API consumiendo datos reales
✅ Sistema completo corriendo local en 1 comando

