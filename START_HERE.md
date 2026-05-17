# 🚀 START HERE - Cómo Correr el Proyecto Localmente

---

## ⚡ TL;DR - Ultra Rápido

```bash
git clone https://github.com/0Emiliano/SistemaInvernadero.git
cd SistemaInvernadero
make quick-start
```

Abre: http://localhost:3000 ✅

---

## 📋 Opción 1: One Command (RECOMENDADO)

```bash
make quick-start
```

**Qué hace:**
1. ✅ Construye imágenes Docker
2. ✅ Levanta 4 servicios (Backend, Frontend, Database, RabbitMQ)
3. ✅ Espera a que estén listos
4. ✅ Verifica salud de servicios

**Tiempo**: ~3 minutos

**Resultado:**
```
✅ Frontend:  http://localhost:3000
✅ Backend:   http://localhost:8080
✅ RabbitMQ:  http://localhost:15672 (guest/guest)
✅ Database:  localhost:5432 (admin/password)
```

---

## 📋 Opción 2: Script Automático

```bash
bash setup.sh
```

Hace lo mismo que `make quick-start` pero con más detalles.

---

## 📋 Opción 3: Manual paso a paso

```bash
# 1. Build
docker-compose build

# 2. Start
docker-compose up -d

# 3. Wait 30 seconds
sleep 30

# 4. Check status
docker-compose ps

# 5. Open frontend
# http://localhost:3000
```

---

## 🎮 Cómo Usar (Una Vez Corriendo)

### Paso 1: Abrir Frontend
```
Abre en navegador: http://localhost:3000
```

### Paso 2: Enviar Datos (Ingestion Tab)
```
1. Click en tab "Ingestion"
2. Completa formulario:
   - Greenhouse: GW-001
   - Sensor: S01
   - Temperature: 25.5
   - Humidity: 65.0
3. Click "Send Telemetry"
4. Ver confirmación ✅
```

### Paso 3: Ver en Dashboard
```
1. Click tab "Dashboard"
2. Observa:
   - Gráfico de temperatura actualizado
   - Humedad en el otro gráfico
   - KPI cards con promedios
   - Auto-refresca cada 10 segundos
```

### Paso 4: Ver Sensores Conectados
```
1. Click tab "Sensors"
2. Lista todos los sensores registrados
3. Muestra último valor temp/humidity
```

### Paso 5: Ver Alertas (si T > 35°C)
```
1. Click tab "Alerts"
2. Si temperatura > 35°C, aparecerá alerta crítica
3. Muestra timestamp y status
```

---

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
make logs

# Ver específicos
make logs-backend       # Solo backend
make logs-frontend      # Solo frontend
make logs-db           # Solo database
make logs-rabbitmq     # Solo RabbitMQ

# Conectarse a servicios
make shell-backend     # SSH a backend
make shell-db          # psql a database

# Gestión
make stop              # Detener todo
make restart           # Reiniciar
make status            # Ver estado
make clean             # Limpiar todo
```

---

## 🧪 Probar API Manualmente (curl)

```bash
# Send telemetry
curl -X POST http://localhost:8080/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "greenhouseId": "GW-001",
    "sensorId": "S01",
    "temperature": 28.5,
    "humidity": 70,
    "manufacturer": "BOSCH"
  }'

# Get dashboard data
curl http://localhost:8080/api/v1/analytics/dashboard/GW-001

# Get alerts
curl http://localhost:8080/api/v1/alerts

# Get sensors
curl http://localhost:8080/api/v1/sensors

# Health check
curl http://localhost:8080/api/v1/health
```

---

## 🐳 Acceso a Servicios

### RabbitMQ Management
```
URL:      http://localhost:15672
Username: guest
Password: guest

Usa esto para ver:
- Exchanges
- Queues
- Bindings
- Message rates
```

### Database (PostgreSQL)
```
Host:     localhost
Port:     5432
User:     admin
Password: password
Database: invernadero_db

Conectar:
psql -h localhost -U admin -d invernadero_db
```

---

## 🚨 Troubleshooting

### "Port already in use"
```bash
# Ver qué está usando los puertos
lsof -i :3000       # Frontend
lsof -i :8080       # Backend
lsof -i :5432       # Database
lsof -i :5672       # RabbitMQ
lsof -i :15672      # RabbitMQ Management

# O detener anterior
make clean
```

### "Docker not found"
```bash
# Install Docker Desktop
https://www.docker.com/products/docker-desktop

# Para Windows/Mac: Abre Docker Desktop
# Para Linux: 
sudo apt-get install docker.io docker-compose
```

### "Services not responding"
```bash
# Wait longer (puede tomar hasta 30s)
sleep 60
make status

# Or check logs
make logs
```

### "Frontend shows error"
```bash
# Check backend is running
curl http://localhost:8080/api/v1/health

# Refresh browser
# Ctrl+Shift+R (hard refresh)

# Or restart frontend
docker-compose restart frontend
```

---

## 📊 Arquitectura Local

```
┌────────────────────┐
│  React Frontend    │  Port 3000
│  (4 paneles)       │
└─────────┬──────────┘
          │ HTTP
┌─────────▼──────────┐
│ Spring Boot API    │  Port 8080
│ (6 endpoints)      │
└─┬────────────────┬─┘
  │                │
  │ AMQP           │ JDBC
  │                │
  ▼                ▼
┌──────────┐  ┌──────────────────┐
│ RabbitMQ │  │   TimescaleDB    │
│ 5672     │  │   Port 5432      │
│ 15672    │  │   Hypertable     │
└──────────┘  └──────────────────┘
```

---

## 📁 Proyecto Structure

```
SistemaInvernadero/
├── src/                    # React Frontend
│   └── components/
│       └── Dashboard.tsx   # 4 paneles funcionales
├── java-backend/           # Spring Boot
│   ├── src/
│   │   └── main/java/.../
│   │       └── modules/
│   │           ├── analytics/    # GET endpoints
│   │           ├── ingestion/    # POST ingest
│   │           ├── alarm/        # Threshold check
│   │           └── persistence/  # DB save
│   └── Dockerfile
├── Makefile               # 25+ comandos
├── docker-compose.yml     # 4 servicios
├── setup.sh              # Auto-setup
└── README_SIMPLE.md      # Esta guía
```

---

## ✅ Verificar que todo funciona

```bash
# Terminal 1: Ver logs en vivo
make logs

# Terminal 2: Probar servicios
sleep 10
curl http://localhost:8080/api/v1/health      # ✅ UP
curl http://localhost:3000                     # ✅ Frontend
curl http://localhost:15672                    # ✅ RabbitMQ

# Terminal 3: Abrir navegador
# http://localhost:3000
```

Si ves datos en el frontend, ¡todo funciona! ✅

---

## 🎯 Próximos Pasos

1. **Explorar Frontend**
   - Envía varios valores de telemetría
   - Observa gráficos actualizarse
   - Juega con diferentes temperaturas

2. **Check RabbitMQ**
   - http://localhost:15672
   - Ver queues: alarm.queue, persistence.queue
   - Ver message rates

3. **Query Database**
   - ```bash
     make shell-db
     SELECT COUNT(*) FROM mediciones;
     SELECT * FROM mediciones LIMIT 5;
     ```

4. **Luego (opcional)**
   - Agregar Kubernetes (`k8s/` manifests)
   - Agregar CI/CD (GitHub Actions)
   - Agregar observabilidad (Prometheus, Grafana)

---

## 📚 Documentación

- `README_SIMPLE.md` - Guía detallada
- `REFACTORING_SUMMARY.md` - Resumen de cambios
- `REFACTORING_COMPLETE.md` - Detalle técnico
- `Makefile` - Todos los comandos

---

## 🎊 Summary

```bash
# Tú haces:
make quick-start

# El proyecto:
✅ Construye
✅ Levanta 4 servicios
✅ Espera ready
✅ Verifica salud

# Tú ves:
✅ Frontend en http://localhost:3000
✅ Datos reales
✅ Todos los botones funcionales
✅ Gráficos actualizándose
```

---

**¿Preguntas?**
- Check logs: `make logs`
- Check status: `make status`  
- Clean restart: `make clean && make quick-start`

**¡Listo!** 🚀

Sistema corriendo localmente con todo lo necesario:
✅ Backend REST API
✅ Frontend React
✅ Database PostgreSQL
✅ Message Queue RabbitMQ
✅ Health checks
✅ Persistencia

Disfruta! 🌱
