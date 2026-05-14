#!/bin/bash
# Add database indexes for performance
kubectl exec pod/timescaledb-6df8496b78-rskkm -n invernadero -- sh << 'EOF'
psql -U admin -d invernadero_db << 'SQL'
CREATE INDEX IF NOT EXISTS idx_greenhouse ON mediciones(greenhouse_id);
CREATE INDEX IF NOT EXISTS idx_sensor ON mediciones(sensor_id);
CREATE INDEX IF NOT EXISTS idx_greenhouse_timestamp ON mediciones(greenhouse_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_timestamp ON mediciones(timestamp DESC);
SELECT 'Indexes created successfully!' as result;
SQL
EOF
