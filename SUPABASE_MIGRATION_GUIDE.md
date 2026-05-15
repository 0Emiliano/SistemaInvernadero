# Migración a Supabase - TimescaleDB Cloud

## Paso 1: Crear proyecto en Supabase

1. Ir a https://supabase.com
2. Crear cuenta o login
3. New Project:
   - Name: `sistema-invernadero`
   - Database Password: [Usar password seguro]
   - Region: [Seleccionar cercana a tus usuarios]
   - PostgreSQL Version: 15 (soporta TimescaleDB)

## Paso 2: Habilitar TimescaleDB Extension

En Supabase:

```sql
-- En SQL Editor de Supabase
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Verificar instalación
SELECT * FROM pg_extension WHERE extname = 'timescaledb';
```

## Paso 3: Conectar Kubernetes a Supabase

### Obtener credenciales Supabase

1. En proyecto Supabase → Settings → Database
2. Copiar:
   - Host: `[project].supabase.co`
   - Port: `5432`
   - User: `postgres`
   - Password: `[tu_password]`
   - Database: `postgres`

### Crear ConfigMap/Secret en Kubernetes

```bash
kubectl create secret generic supabase-credentials \
  --from-literal=host=[project].supabase.co \
  --from-literal=port=5432 \
  --from-literal=database=postgres \
  --from-literal=username=postgres \
  --from-literal=password=[tu_password] \
  -n invernadero
```

## Paso 4: Actualizar ConfigMap de Backend

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: invernadero-backend-config-supabase
  namespace: invernadero
data:
  SPRING_APPLICATION_JSON: |
    {
      "server": {
        "port": 8080
      },
      "spring": {
        "datasource": {
          "url": "jdbc:postgresql://[project].supabase.co:5432/postgres?sslmode=require"
        }
      }
    }
```

## Paso 5: Migrar datos (si existen)

### Exportar de local TimescaleDB:

```bash
# Conectar a local TimescaleDB
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- sh

# Dentro del pod:
pg_dump -U admin -d invernadero_db > /tmp/dump.sql

# Salir y copiar:
kubectl cp invernadero/timescaledb-6df8496b78-rskkm:/tmp/dump.sql ./dump.sql
```

### Importar a Supabase:

```bash
# Conectar a Supabase y restaurar
psql -h [project].supabase.co -U postgres -d postgres < dump.sql
```

## Paso 6: Crear tabla en Supabase

```sql
-- En SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS mediciones (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    greenhouse_id VARCHAR(50) NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    manufacturer VARCHAR(50),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear hypertable con TimescaleDB
SELECT create_hypertable('mediciones', 'timestamp', if_not_exists => TRUE);

-- Agregar índices para performance
CREATE INDEX IF NOT EXISTS idx_greenhouse ON mediciones(greenhouse_id);
CREATE INDEX IF NOT EXISTS idx_sensor ON mediciones(sensor_id);
CREATE INDEX IF NOT EXISTS idx_greenhouse_timestamp ON mediciones(greenhouse_id, timestamp DESC);

-- Habilitar Row Level Security (RLS) para multi-tenancy
ALTER TABLE mediciones ENABLE ROW LEVEL SECURITY;

-- Crear policy: cada usuario solo ve su greenhouse
CREATE POLICY "Users can only see their greenhouse data"
ON mediciones FOR SELECT
USING (greenhouse_id = current_setting('app.current_greenhouse')::TEXT);
```

## Paso 7: Actualizar Backend application.properties

```properties
# Supabase Configuration
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2

# SSL para Supabase
spring.datasource.hikari.ssl=true
```

## Paso 8: Actualizar Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: invernadero-backend
  namespace: invernadero
spec:
  # ... resto igual
  template:
    spec:
      containers:
      - name: backend
        image: invernadero-backend:latest
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: supabase-credentials
              key: host
        - name: DB_PORT
          valueFrom:
            secretKeyRef:
              name: supabase-credentials
              key: port
        - name: DB_NAME
          value: "postgres"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: supabase-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: supabase-credentials
              key: password
```

## Paso 9: Aplicar cambios

```bash
# Recompilar backend con Supabase
docker build -t invernadero-backend:latest ./java-backend

# Actualizar secret
kubectl apply -f k8s/supabase-secret.yaml

# Actualizar deployment
kubectl rollout restart deployment/invernadero-backend -n invernadero
```

## Paso 10: Verificar conexión

```bash
# Ver logs del backend
kubectl logs -f deployment/invernadero-backend -n invernadero

# Verificar datos
curl http://localhost:8080/api/v1/analytics/dashboard/GW-001
```

## Ventajas de Supabase

✅ **Managed PostgreSQL 15** - Sin administración
✅ **TimescaleDB Incluido** - Hipertables para series de tiempo
✅ **Auto-scaling** - Maneja crecimiento automático
✅ **Backups Automáticos** - Diarios + point-in-time recovery
✅ **Row Level Security** - Multi-tenancy nativo
✅ **Real-time Subscriptions** - Webhooks y suscripciones
✅ **Replicación** - HA incluida
✅ **SSL/TLS** - Siempre encriptado
✅ **API REST Automático** - PostgREST incluido
✅ **Auth Integrado** - Con JWT

## Conexión desde aplicaciones externas

```
Host: [project].supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [tu_password]
SSL Mode: require
```

## Costos (Approximate)

- **Plan Gratuito**: 500MB storage, 2GB bandwidth
- **Plan Pro**: $25/mes - Hasta 8GB storage, 250GB bandwidth
- **Plan Business**: Custom pricing

## Monitoreo en Supabase

1. Dashboard → Monitoring
   - CPU usage
   - Memory
   - Network
   - Connections

2. Logs → Postgres logs
3. Performance → Query insights

## Rollback si es necesario

Si necesitas volver a local:

```bash
# Exportar de Supabase
pg_dump -h [project].supabase.co -U postgres -d postgres > supabase_dump.sql

# Importar a local
kubectl exec -i pod/timescaledb-6df8496b78-rskkm -n invernadero -- psql -U admin -d invernadero_db < supabase_dump.sql
```

## Troubleshooting

### Connection timeout
```
❌ psql: FATAL: sorry, too many clients already
✅ Aumentar max_connections en Supabase → Settings
```

### SSL error
```
❌ server does not support SSL
✅ Usar sslmode=require en connection string
```

### TimescaleDB no disponible
```
❌ CREATE EXTENSION timescaledb failed
✅ Supabase soporta en PostgreSQL 13+, usar versión 15 o superior
```

---

**Próximos pasos**: Backend ya apunta a Supabase, Observabilidad (Prometheus, Grafana, Jaeger, Loki) lista para desplegar.
