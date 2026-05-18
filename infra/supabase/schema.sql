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

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'timescaledb') THEN
        CREATE EXTENSION IF NOT EXISTS timescaledb;
        PERFORM create_hypertable('public.mediciones', 'timestamp', if_not_exists => TRUE);
    END IF;
END $$;

ALTER TABLE public.mediciones ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.sensores (
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
    ON public.sensores (greenhouse_id, sensor_id);

CREATE TABLE IF NOT EXISTS public.alertas (
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
    ON public.alertas (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_sensor_type
    ON public.alertas (greenhouse_id, sensor_id, type, status, created_at DESC);

ALTER TABLE public.sensores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.threshold_config (
    id BIGSERIAL PRIMARY KEY,
    greenhouse_id TEXT NOT NULL,
    metric TEXT NOT NULL,
    max_value DOUBLE PRECISION NOT NULL,
    min_value DOUBLE PRECISION,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_threshold_config_greenhouse_metric UNIQUE (greenhouse_id, metric)
);

INSERT INTO public.threshold_config (greenhouse_id, metric, max_value)
VALUES ('1', 'TEMPERATURE', 35.0)
ON CONFLICT (greenhouse_id, metric) DO NOTHING;

ALTER TABLE public.threshold_config ENABLE ROW LEVEL SECURITY;
