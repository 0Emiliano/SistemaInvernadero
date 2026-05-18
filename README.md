# Sistema Invernadero

Sistema de monitoreo de invernaderos basado en el diagrama de despliegue/componentes:

- Frontend: React + Vite + Recharts.
- Backend: Spring Boot 3, Java 17, REST API, Spring AMQP, Spring Data JPA y Actuator.
- Mensajeria: RabbitMQ con exchange topic `invernadero.telemetry.exchange`.
- Persistencia: TimescaleDB/PostgreSQL con hypertable `mediciones`.
- Observabilidad: Prometheus y Grafana provisionado.
- Compatibilidad Supabase: `infra/supabase/schema.sql` contiene el SQL base para Postgres/Supabase y activa TimescaleDB solo si la extension esta disponible en el proyecto. El backend puede usar TimescaleDB local o Supabase Postgres con el perfil `supabase`.

## Ejecutar

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

Modo Supabase remoto:

```powershell
Copy-Item .env.example .env
# Edita .env y define:
# SPRING_PROFILES_ACTIVE=supabase
# SUPABASE_DB_PASSWORD=<password de Database Settings en Supabase>
docker compose -f docker-compose.yml -f docker-compose.supabase.yml up -d --build backend frontend prometheus grafana rabbitmq
```

## URLs

- Frontend: http://localhost:3000
- Backend health: http://localhost:8080/api/v1/health
- Infra/API status: http://localhost:8080/api/v1/infra/status
- RabbitMQ: http://localhost:15673
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

Credenciales por defecto: revisar `.env.example`.
RabbitMQ usa `guest / guest`; Grafana usa `admin / admin` si no cambias `GRAFANA_PASSWORD`.

## Flujo

1. El frontend envia telemetria a `POST /api/v1/ingest`.
2. El backend publica el mensaje en RabbitMQ usando routing key `invernadero.[greenhouseId].[sensorId]`.
3. `PersistenceService` consume el evento y guarda la lectura en TimescaleDB.
4. `AlarmService` consume el mismo evento y registra alertas cuando la temperatura supera 35 C.
5. El dashboard consulta `/api/v1/analytics/dashboard/{greenhouseId}`, `/api/v1/sensors` y `/api/v1/alerts`.

## Endpoints principales

- `GET /api/v1/health`
- `POST /api/v1/ingest`
- `POST /api/v1/sensors/register`
- `GET /api/v1/sensors`
- `PATCH /api/v1/sensors/{id}/status`
- `DELETE /api/v1/sensors/{id}`
- `GET /api/v1/alerts`
- `PATCH /api/v1/alerts/{id}/resolve`
- `GET /api/v1/analytics/dashboard/{greenhouseId}`
- `POST /api/v1/demo/seed`
- `POST /api/v1/adapters/mqtt`
- `POST /api/v1/adapters/modbus`
- `GET /api/v1/config/thresholds/temperature`
- `PUT /api/v1/config/thresholds/temperature`
- `GET /api/v1/infra/status`

## Configuracion

Toda la configuracion operativa vive en `infra/`:

- `infra/timescaledb/init.sql`
- `infra/rabbitmq/definitions.json`
- `infra/prometheus/prometheus.yml`
- `infra/grafana/provisioning/`
- `infra/grafana/dashboards/`
- `infra/supabase/schema.sql`
- `infra/supabase/apply-schema.ps1`

## Estado de las 7 tareas de cierre

1. **TimescaleDB/Supabase:** local usa TimescaleDB real y crea la hypertable `mediciones`. Supabase usa Postgres remoto; el esquema intenta activar TimescaleDB solo si la extension esta disponible en el proyecto. El endpoint `/api/v1/infra/status` muestra `timescaleExtension` y `medicionesHypertable` para confirmar el estado real.
2. **Grafana:** el dashboard `Sistema Invernadero - Local` queda provisionado desde `infra/grafana/dashboards/invernadero-overview.json`.
3. **Prometheus:** scrapea el backend en `/actuator/prometheus`; las metricas de negocio incluyen lecturas recibidas, lecturas persistidas, sensores y alertas activas.
4. **Frontend operativo:** dashboard, ingestion, sensores, alertas, infraestructura y configuracion consumen el backend. Sensores permite activar, pausar, marcar mantenimiento y eliminar del inventario.
5. **Seguridad minima local:** CORS se configura con `CORS_ALLOWED_ORIGINS` y por defecto solo permite `http://localhost:3000`. Las credenciales reales deben vivir en `.env`, nunca en Git.
6. **Adaptadores:** los endpoints `/api/v1/adapters/mqtt` y `/api/v1/adapters/modbus` normalizan payloads y publican al mismo flujo RabbitMQ que ingestion HTTP.
7. **Operacion/limpieza:** `infra/` concentra Docker, TimescaleDB, Supabase, RabbitMQ, Prometheus, Grafana y backups. Para limpiar recursos del proyecto usa `docker compose down -v --rmi local --remove-orphans`.

## Validacion rapida

```powershell
npm.cmd run lint
npm.cmd run build
docker run --rm -v "${PWD}\java-backend:/workspace" -w /workspace maven:3.9-eclipse-temurin-17 mvn test
docker compose -f docker-compose.yml -f docker-compose.supabase.yml config --quiet
```

## Operacion local

Aplicar esquema sobre un volumen existente:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\db\apply-local-schema.ps1
```

Backup local:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\backup\backup-local.ps1
```

Restore local:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\backup\restore-local.ps1 -Path .\infra\backup\out\archivo.sql
```

Limpieza completa del stack local del proyecto:

```bash
docker compose down -v --rmi local --remove-orphans
```

Aplicar esquema en Supabase usando `psql`:

```powershell
$env:SUPABASE_DB_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
powershell -ExecutionPolicy Bypass -File .\infra\supabase\apply-schema.ps1
```
