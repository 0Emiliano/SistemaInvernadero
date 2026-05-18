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

CREATE TABLE IF NOT EXISTS sensores (
    id BIGSERIAL PRIMARY KEY,
    sensor_id TEXT NOT NULL,
    greenhouse_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'TELEMETRY',
    manufacturer TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sensores_greenhouse_sensor UNIQUE (greenhouse_id, sensor_id)
);

CREATE INDEX IF NOT EXISTS idx_sensores_greenhouse
    ON sensores (greenhouse_id, sensor_id);

CREATE TABLE IF NOT EXISTS alertas (
    id BIGSERIAL PRIMARY KEY,
    sensor_id TEXT NOT NULL,
    greenhouse_id TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alertas_status_created
    ON alertas (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_sensor_type
    ON alertas (greenhouse_id, sensor_id, type, status, created_at DESC);

CREATE TABLE IF NOT EXISTS threshold_config (
    id BIGSERIAL PRIMARY KEY,
    greenhouse_id TEXT NOT NULL,
    metric TEXT NOT NULL,
    max_value DOUBLE PRECISION NOT NULL,
    min_value DOUBLE PRECISION,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_threshold_config_greenhouse_metric UNIQUE (greenhouse_id, metric)
);

INSERT INTO threshold_config (greenhouse_id, metric, max_value)
VALUES ('1', 'TEMPERATURE', 35.0)
ON CONFLICT (greenhouse_id, metric) DO NOTHING;
