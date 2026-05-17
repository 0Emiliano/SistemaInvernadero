CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS public.mediciones (
    id BIGSERIAL,
    sensor_id TEXT NOT NULL,
    greenhouse_id TEXT NOT NULL,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    timestamp TIMESTAMPTZ NOT NULL,
    manufacturer TEXT,
    PRIMARY KEY (id, timestamp)
);

SELECT create_hypertable('public.mediciones', 'timestamp', if_not_exists => TRUE);

ALTER TABLE public.mediciones ENABLE ROW LEVEL SECURITY;
