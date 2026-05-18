# Sistema Invernadero

Sistema de monitoreo de invernaderos basado en el diagrama de despliegue/componentes:

- Frontend: React + Vite + Recharts.
- Backend: Spring Boot 3, Java 17, REST API, Spring AMQP, Spring Data JPA y Actuator.
- Mensajeria: RabbitMQ con exchange topic `invernadero.telemetry.exchange`.
- Persistencia: TimescaleDB/PostgreSQL con hypertable `mediciones`.
- Observabilidad: Prometheus y Grafana provisionado.
- Compatibilidad Supabase: `infra/supabase/schema.sql` contiene el SQL base para Postgres/Supabase y activa TimescaleDB solo si la extension esta disponible en el proyecto.

## Ejecutar

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/v1/health
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
