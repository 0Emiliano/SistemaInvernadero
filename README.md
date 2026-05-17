# Sistema Invernadero

Sistema de monitoreo de invernaderos basado en el diagrama de despliegue/componentes:

- Frontend: React + Vite + Recharts.
- Backend: Spring Boot 3, Java 17, REST API, Spring AMQP, Spring Data JPA y Actuator.
- Mensajeria: RabbitMQ con exchange topic `invernadero.telemetry.exchange`.
- Persistencia: TimescaleDB/PostgreSQL con hypertable `mediciones`.
- Observabilidad: Prometheus y Grafana.
- Compatibilidad Supabase: `infra/supabase/schema.sql` contiene el SQL base para un Postgres/Supabase con TimescaleDB disponible.

## Ejecutar

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/v1/health
- RabbitMQ: http://localhost:15672
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

Credenciales por defecto: revisar `.env.example`.

## Flujo

1. El frontend envia telemetria a `POST /api/v1/ingest`.
2. El backend publica el mensaje en RabbitMQ usando routing key `invernadero.[greenhouseId].[sensorId]`.
3. `PersistenceService` consume el evento y guarda la lectura en TimescaleDB.
4. `AlarmService` consume el mismo evento y registra alertas cuando la temperatura supera 35 C.
5. El dashboard consulta `/api/v1/analytics/dashboard/{greenhouseId}`, `/api/v1/sensors` y `/api/v1/alerts`.

## Configuracion

Toda la configuracion operativa vive en `infra/`:

- `infra/timescaledb/init.sql`
- `infra/rabbitmq/definitions.json`
- `infra/prometheus/prometheus.yml`
- `infra/supabase/schema.sql`
