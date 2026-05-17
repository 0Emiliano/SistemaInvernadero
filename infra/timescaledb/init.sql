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

SELECT create_hypertable('mediciones', 'timestamp', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_greenhouse_sensor
    ON mediciones (greenhouse_id, sensor_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_greenhouse_timestamp
    ON mediciones (greenhouse_id, timestamp DESC);
