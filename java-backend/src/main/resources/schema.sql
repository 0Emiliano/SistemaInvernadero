-- Crear la tabla base si no existe (Spring Data JPA usualmente la crea, pero aquí aseguramos tipos)
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS mediciones (
    id BIGSERIAL,
    sensor_id TEXT NOT NULL,
    greenhouse_id TEXT NOT NULL,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    timestamp TIMESTAMPTZ NOT NULL,
    manufacturer TEXT,
    PRIMARY KEY (id, timestamp)
);

-- Convertir la tabla en una HYPERTABLE de TimescaleDB
-- Esto segmenta los datos automáticamente por tiempo para consultas ultra rápidas
SELECT create_hypertable('mediciones', 'timestamp', if_not_exists => TRUE);

-- Crear índice para búsquedas por invernadero y sensor (Mapeo de Routing Keys)
CREATE INDEX IF NOT EXISTS idx_greenhouse_sensor ON mediciones (greenhouse_id, sensor_id, timestamp DESC);
