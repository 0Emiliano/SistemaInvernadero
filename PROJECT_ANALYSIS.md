# Sistema Invernadero - Análisis Completo del Proyecto

## 📋 Resumen Ejecutivo

**Sistema Invernadero** es una arquitectura distribuida IoT para monitoreo de sensores en invernaderos. Combina un **frontend React/Vite** con un **backend Java Spring Boot**, conectados mediante **RabbitMQ** y persistencia en **TimescaleDB/PostgreSQL**.

### Estado Actual
- ✅ Frontend compila correctamente (React 19 + TypeScript)
- ✅ Backend compila correctamente (Java 17 + Spring Boot 3.2.2)
- ✅ Docker Compose totalmente configurado
- ⚠️ **No validado end-to-end**: flujo completo sensor→adapter→rabbitmq→persistence→dashboard aún no probado en conjunto

---

## 🏗️ Arquitectura General

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                         │
│  React Dashboard (Vite, Tailwind, Recharts, Lucide React)      │
│  Puerto 3000                                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA API / BACKEND                           │
│  Spring Boot 3.2.2 + Java 17                                    │
│  REST API (8080) | TCP Ingestion Server (9000)                 │
├─────────────────────────────────────────────────────────────────┤
│ Módulos:                                                         │
│  - Ingestion: Recibe datos TCP/REST, aplica adapters           │
│  - Alarm: Detecta anomalías (temp > 35°C)                       │
│  - Persistence: Guarda datos en DB                              │
│  - Analytics: Expone datos agregados para dashboard             │
│  - Registry: Control de sensores e invernaderos                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE MENSAJERÍA                            │
│  RabbitMQ (AMQP 5672) + Management UI (15672)                  │
│  Exchange: invernadero.telemetry.exchange (Topic)              │
│  Colas: alarm.queue, persistence.queue                          │
│  Routing: invernadero.{GREENHOUSE_ID}.{SENSOR_ID}              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE PERSISTENCIA                          │
│  TimescaleDB sobre PostgreSQL 15                                │
│  Tabla: mediciones (Hypertable)                                 │
│  Puerto: 5432                                                    │
│  Campos: sensor_id, greenhouse_id, temperature, humidity, ...   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos Esperado (End-to-End)

1. **Ingesta**
   - Gateway/Sensor envía datos por TCP (puerto 9000) o HTTP POST `/ingest`
   - `IngestionService` recibe y detecta fabricante (BOSCH, HONEYWELL)
   
2. **Normalización**
   - `SensorAdapter` correspondiente transforma payload a objeto `SensorReading` estándar
   - Formato canónico: `{sensorId, greenhouseId, temperature, humidity, manufacturer, timestamp}`

3. **Publicación en RabbitMQ**
   - Evento publicado en exchange `invernadero.telemetry.exchange`
   - Routing key: `invernadero.{GW_ID}.{SENSOR_ID}`
   - RabbitMQ entrega copias a colas suscritas

4. **Distribución Asíncrona**
   - **Alarmas**: `alarm.queue` → `AlarmService` → evalúa umbrales → log de alerta
   - **Persistencia**: `persistence.queue` → `PersistenceService` → `TimescaleDB`

5. **Consulta Analytics**
   - `/api/v1/analytics/dashboard/{greenhouseId}` agregación SQL última 24h
   - Retorna: temperatura promedio, lecturas recientes

6. **Visualización**
   - Dashboard React llama `analyticsService.getDashboardData()`
   - Renderiza gráficos Recharts con datos reales o fallback mock

---

## 📁 Estructura de Carpetas

```
SistemaInvernadero/
├── src/                          # Frontend React/Vite
│   ├── components/
│   │   └── Dashboard.tsx          # Componente principal con KPIs
│   ├── services/
│   │   └── analyticsService.ts    # Cliente HTTP al backend
│   ├── types.ts                   # Interfaces TypeScript
│   └── main.tsx
│
├── java-backend/                  # Backend Spring Boot
│   ├── src/main/java/.../
│   │   ├── config/
│   │   │   └── RabbitConfig.java  # Exchanges, queues, bindings
│   │   ├── core/
│   │   │   ├── exceptions/
│   │   │   └── responses/
│   │   ├── modules/
│   │   │   ├── ingestion/         # Adapters, TCP server
│   │   │   ├── alarm/             # Evaluación de umbrales
│   │   │   ├── persistence/       # Guardado en DB
│   │   │   ├── analytics/         # APIs de consulta
│   │   │   └── registry/          # Inventario de sensores
│   │   └── Application.java
│   │
│   ├── src/main/resources/
│   │   ├── application.properties # Configs Spring
│   │   └── schema.sql            # Creación de tabla + hypertable
│   │
│   ├── pom.xml                   # Dependencias Maven
│   ├── Dockerfile                # Multi-stage build Java
│   └── docker-compose.yml        # Orquestación local
│
├── k8s/                          # Manifiestos Kubernetes
│   ├── namespace.yaml
│   ├── configmaps-secrets.yaml
│   ├── persistent-volumes.yaml
│   ├── postgres.yaml
│   ├── rabbitmq.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── autoscaling.yaml
│   ├── disruption-budgets.yaml
│   ├── DEPLOYMENT.md
│   └── README.md
│
├── Dockerfile                    # Frontend nginx (multi-stage)
├── nginx.conf                    # Proxy para /api → backend:8080
├── package.json                  # Frontend deps
├── tsconfig.json
├── vite.config.ts
│
└── Documentación/
    ├── README.md
    ├── DOCUMENTACION_ARQUITECTURA.md
    ├── CONFIGURACION_TOTAL.md
    ├── RUN_LOCAL.md
    ├── INFRA_STANDARDS.md
    └── PROJECT_ANALYSIS.md (este archivo)
```

---

## 🚀 Puertos y Servicios

| Componente | Puerto | URL/Dirección | Propósito |
|-----------|--------|---------------|-----------|
| Frontend | 3000 | http://localhost:3000 | Dashboard React |
| Backend API | 8080 | http://localhost:8080 | REST API Spring |
| TCP Ingestion | 9000 | localhost:9000 | Servidor TCP sensores |
| RabbitMQ AMQP | 5672 | amqp://localhost | Broker mensajes |
| RabbitMQ Mgmt | 15672 | http://localhost:15672 | Panel administrativo |
| PostgreSQL/TimescaleDB | 5432 | localhost | Base datos series tiempo |

---

## 🔧 Stack Tecnológico

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool (hot reload)
- **Tailwind CSS 4** - Styling
- **Recharts 3** - Gráficos
- **Lucide React** - Iconos
- **Motion 12** - Animaciones
- **Axios** - HTTP client

### Backend
- **Java 17** - Lenguaje
- **Spring Boot 3.2.2** - Framework
- **Spring Web** - REST API
- **Spring AMQP** - RabbitMQ integration
- **Spring Data JPA** - ORM
- **Spring Integration IP** - TCP server
- **PostgreSQL Driver** - JDBC
- **Lombok** - Boilerplate reduction

### Infraestructura
- **Docker** - Containerización
- **Docker Compose** - Orquestación local
- **RabbitMQ 3** - Message broker (AMQP)
- **TimescaleDB** - PostgreSQL + hypertables
- **Nginx** - Reverse proxy (en producción)
- **Kubernetes** - Orquestación producción (manifiestos listos)

---

## 🧩 Módulos Backend Detallados

### 1. Ingestion
**Ubicación**: `java-backend/src/main/java/.../modules/ingestion`

**Responsabilidades**:
- Recibir telemetría por TCP (puerto 9000) o HTTP
- Aplicar pattern Adapter para múltiples fabricantes
- Normalizar a `SensorReading` estándar
- Publicar en RabbitMQ

**Adapters Disponibles**:
- `BoschSensorAdapter` - Interpreta payload binario BOSCH
- `HoneywellSensorAdapter` - Interpreta JSON Honeywell

**Rutas**:
- `POST /ingest/{greenhouseId}` - HTTP ingestion
- `TCP :9000` - Socket ingestion

---

### 2. Messaging/Config RabbitMQ
**Ubicación**: `java-backend/.../config/RabbitConfig.java`

**Contrato**:
```
Exchange: invernadero.telemetry.exchange
Tipo: Topic
Binding pattern: invernadero.#

Colas:
  - alarm.queue → AlarmService
  - persistence.queue → PersistenceService
```

**Routing Key Generada**:
```
invernadero.{GREENHOUSE_ID}.{SENSOR_ID}
```

---

### 3. Persistence
**Ubicación**: `java-backend/.../modules/persistence`

**Responsabilidades**:
- Consumir eventos de `persistence.queue`
- Mapear `SensorReading` → `SensorReadingEntity`
- Insertar en tabla `mediciones`

**Tabla Base**:
```sql
CREATE TABLE mediciones (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(50),
  greenhouse_id VARCHAR(50),
  temperature FLOAT,
  humidity FLOAT,
  manufacturer VARCHAR(50),
  timestamp TIMESTAMP
);

SELECT create_hypertable('mediciones', 'timestamp');
```

---

### 4. Alarm
**Ubicación**: `java-backend/.../modules/alarm`

**Responsabilidades**:
- Consumir eventos de `alarm.queue`
- Evaluar condiciones (ej: `temperature > 35.0°C`)
- Emitir logs de alerta crítica

**Umbral Actual**: `MAX_TEMP = 35.0°C`

---

### 5. Analytics
**Ubicación**: `java-backend/.../modules/analytics`

**Responsabilidades**:
- Consultar datos agregados para dashboard
- Calcular temperatura promedio últimas 24h
- Retornar lecturas recientes

**Endpoint Principal**:
```http
GET /api/v1/analytics/dashboard/{greenhouseId}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Datos de analítica recuperados correctamente",
  "data": {
    "recentReadings": [
      {"sensorId": "S01", "temperature": 28.5, "humidity": 65.0, ...}
    ],
    "averageTemperature24h": 27.3,
    "period": "LAST_24H"
  }
}
```

---

### 6. Registry
**Ubicación**: `java-backend/.../modules/registry`

**Responsabilidades**:
- Registro de sensores e invernaderos
- Gestión de inventario

**Endpoints**:
```http
POST /sensors/register?greenhouseId={id}&sensorId={id}
GET /sensors/report/{greenhouseId}
```

---

## 📊 Dashboard React

**Componente**: `src/components/Dashboard.tsx`

**KPIs Mostrados**:
- Temperatura promedio (real si backend responde, mock si no)
- Alertas activas (mock temporalmente)
- Sensores operando (mock temporalmente)

**Gráficos**:
- Área: Temperatura últimas 24h
- Línea: Humedad últimas 24h
- Tarjetas: Estado en tiempo real

**Fallback**: Si el backend no responde, usa datos mock para demostración

---

## 🐳 Docker & Docker Compose

### Docker Compose Local
```yaml
version: '3.8'
services:
  rabbitmq:      # AMQP 5672, Management 15672
  timescaledb:   # PostgreSQL 15 con hypertables
  app:           # Backend Java (build desde Dockerfile)
```

**Comandos**:
```bash
# Levantar
cd java-backend
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs -f app

# Bajar
docker-compose down
```

### Dockerfiles

**Backend** (`java-backend/Dockerfile`):
- Multi-stage: Maven build → Eclipse Temurin JRE
- Optimización JVM: `-Xms256m -Xmx512m`
- Expone: 8080 (API), 9000 (TCP)

**Frontend** (`Dockerfile`):
- Multi-stage: Node build → nginx alpine
- Sirve dist estático
- Proxy `/api` al backend vía `nginx.conf`
- Expone: 8080 (nginx)

---

## ☸️ Kubernetes - Manifiestos Generados

**Ubicación**: `k8s/`

**Archivos**:
1. `namespace.yaml` - Namespace `invernadero`
2. `configmaps-secrets.yaml` - Configs y secretos
3. `persistent-volumes.yaml` - PVCs para DB y queue broker
4. `postgres.yaml` - Deployment PostgreSQL + Service
5. `rabbitmq.yaml` - Deployment RabbitMQ + Services
6. `backend.yaml` - Deployment backend (3 replicas) + LoadBalancer
7. `frontend.yaml` - Deployment frontend (2 replicas) + LoadBalancer
8. `autoscaling.yaml` - HPA para backend (2-5) y frontend (2-4)
9. `disruption-budgets.yaml` - PDB para alta disponibilidad
10. `DEPLOYMENT.md` - Guía paso a paso

**Características**:
- Rolling updates (maxSurge: 1, maxUnavailable: 0)
- Health checks: liveness + readiness probes
- Resource limits: requests y limits por componente
- Security context: runAsNonRoot, readOnlyRootFilesystem (donde aplica)
- Autoscaling: CPU/Memory-based HPA

---

## ✅ Verificaciones Realizadas

### Frontend
```bash
npm run lint              # TypeScript sin errores ✓
npm run build             # Vite build producción ✓
docker build -t ...      # Imagen Docker construida ✓
```

### Backend
```bash
cd java-backend
docker build -t ...      # Multi-stage Java compilado ✓
docker-compose up -d    # Servicios levantados ✓
```

### Configuración
- Puertos frontend/backend alineados ✓
- Colas RabbitMQ configuradas ✓
- Schema SQL con hypertable definido ✓
- Variables de entorno documentadas ✓

---

## ⚠️ NO Validado Aún (End-to-End)

### Flujo Completo Faltante de Prueba
```
Sensor/Gateway → TCP 9000 o POST /ingest
    ↓
Adapter normaliza
    ↓
RabbitMQ publica
    ↓
PersistenceService consume
    ↓
TimescaleDB guarda
    ↓
AnalyticsController consulta
    ↓
Dashboard renderiza datos reales
```

### Tests Específicos Pendientes
1. ¿Docker-compose levanta todos los servicios sin errores?
2. ¿El backend conecta correctamente a RabbitMQ y TimescaleDB?
3. ¿Los adapters transforman correctamente payloads binarios?
4. ¿RabbitMQ entrega mensajes a ambas colas?
5. ¿PersistenceService inserta datos en la tabla?
6. ¿AnalyticsController retorna datos persistidos?
7. ¿Dashboard React renderiza gráficos con datos reales?
8. ¿Kubernetes manifiestos se aplican sin errores en cluster real?

---

## 📋 Roadmap Propuesto

### Corto Plazo (1-2 semanas)
- [ ] Maven Wrapper (`mvnw`) para uniformidad
- [ ] Script simulador de sensores (Python o Java)
- [ ] Guía end-to-end reproducible
- [ ] Validación `docker-compose` completo
- [ ] Reemplazar mocks por endpoints reales (alertas, sensores activos)

### Medio Plazo (1 mes)
- [ ] Pruebas unitarias para adapters
- [ ] Tests de integración RabbitMQ/PersistenceService
- [ ] Tests del endpoint analytics
- [ ] Dead Letter Exchange (DLX) para reintentos
- [ ] Endpoint de alarmas activas
- [ ] Inventario real de sensores/invernaderos (base de datos)

### Largo Plazo (2-3 meses)
- [ ] Autenticación JWT
- [ ] Notificaciones email/SMS/webhook
- [ ] Políticas de retención TimescaleDB
- [ ] Observabilidad (Prometheus, ELK, Jaeger)
- [ ] Despliegue Kubernetes multi-cluster

---

## 🎯 Recomendaciones Inmediatas

### 1. Validar End-to-End Local
```bash
# Terminal 1: Infraestructura
cd java-backend && docker-compose up -d

# Terminal 2: Backend
cd java-backend && mvn spring-boot:run
# o F5 en VS Code

# Terminal 3: Frontend
npm install && npm run dev

# Visitar http://localhost:3000
```

### 2. Enviar Telemetría de Prueba
- Via RabbitMQ UI: publicar mensaje en exchange con routing key
- Via curl: `POST http://localhost:8080/ingest/GW-001` con payload
- Verificar en `docker logs` que se procesa

### 3. Verificar Persistencia
```bash
docker exec -it timescaledb psql -U admin -d invernadero_db
SELECT * FROM mediciones LIMIT 5;
```

### 4. Monitorear Colas RabbitMQ
- Ir a `http://localhost:15672` (guest/guest)
- Ver que alarma.queue y persistence.queue tengan mensajes
- Confirmar que se procesan sin errores

### 5. Preparar para Producción
- Cambiar contraseñas en secrets K8s
- Actualizar URLs de imágenes Docker Registry
- Configurar persistent volumes según infra
- Implementar secrets externas (Vault, AWS Secrets Manager)

---

## 📞 Documentación Relacionada

- **README.md** - Visión general del proyecto
- **CONFIGURACION_TOTAL.md** - Setup detallado por componente
- **DOCUMENTACION_ARQUITECTURA.md** - Patrones y decisiones de diseño
- **RUN_LOCAL.md** - Quick start 3 pasos
- **INFRA_STANDARDS.md** - Estándares de infraestructura
- **k8s/DEPLOYMENT.md** - Despliegue Kubernetes paso a paso
- **SESSION_CONTEXT.md** - Historial acumulativo de sesiones

---

**Última Actualización**: 2024
**Versión del Proyecto**: 0.0.1-SNAPSHOT
**Estado**: ✅ Compilable | ⚠️ Requiere validación end-to-end
