# 🐳 Cómo Funcionan tus Contenedores - Explicación Completa

---

## 📚 Tabla de Contenidos

1. [¿Qué son los contenedores?](#qué-son-los-contenedores)
2. [Tus 4 contenedores](#tus-4-contenedores)
3. [Flujo de datos](#flujo-de-datos)
4. [Red interna](#red-interna)
5. [Volúmenes](#volúmenes)
6. [Estados](#estados)
7. [Logs](#logs)
8. [Ciclo de vida](#ciclo-de-vida)
9. [Comandos útiles](#comandos-útiles)

---

## ¿Qué son los contenedores?

Un contenedor es como una **caja sellada** que contiene:

```
┌─────────────────────────────────┐
│    TU APLICACIÓN (Backend)      │
├─────────────────────────────────┤
│  Todas las dependencias         │
│  (Java, Maven, librerías)       │
├─────────────────────────────────┤
│  Sistema Operativo (Linux)      │
├─────────────────────────────────┤
│  Variables de entorno           │
└─────────────────────────────────┘
     = 1 CONTENEDOR
```

**Ventaja**: Funciona igual en tu PC, en AWS, en Google Cloud, en producción. No importa qué sistema operativo tengas.

---

## Tus 4 contenedores

### 📦 **Contenedor 1: TimescaleDB (Base de Datos)**

```yaml
Imagen: timescale/timescaledb:latest-pg15
Puerto: 5432 (interno) → 5432 (tu PC)
Usuario: admin
Contraseña: password
```

**¿Qué hace?**
- Guarda datos de sensores en tabla `mediciones`
- Columnas: sensor_id, temperature, humidity, greenhouse_id, timestamp
- Optimizado para datos de tiempo (TimescaleDB es PostgreSQL + extensión)
- Los datos PERSISTEN (quedan guardados incluso si borras el contenedor)

**¿Cómo acceder?**
```bash
# Desde tu PC
psql -h localhost -U admin -d invernadero_db

# Desde dentro de Docker
docker-compose exec timescaledb psql -U admin -d invernadero_db
```

---

### 📦 **Contenedor 2: RabbitMQ (Message Broker)**

```yaml
Imagen: rabbitmq:3.13-management-alpine
Puerto AMQP: 5672 (interno) → 5672 (tu PC)
Puerto UI: 15672 (interno) → 15672 (tu PC)
Usuario: guest
Contraseña: guest
```

**¿Qué hace?**
- Distribuye mensajes entre Backend y Servicios
- Exchange: `invernadero.telemetry.exchange` (tipo Topic)
- Queues: 
  - `alarm.queue` (para procesar alertas)
  - `persistence.queue` (para guardar en DB)
- **Ventaja**: Si el backend falla, los mensajes quedan en cola y se procesan después

**¿Cómo acceder?**
```bash
# Management UI
http://localhost:15672
# Usuario: guest
# Contraseña: guest
```

---

### 📦 **Contenedor 3: Backend (Spring Boot API)**

```yaml
Imagen: sistemainvernadero-backend:latest
Puerto: 8080 (interno) → 8080 (tu PC)
Lenguaje: Java 17
Framework: Spring Boot 3.2.2
```

**¿Qué hace?**
- Recibe datos de sensores: `POST /api/v1/ingest`
- Publica en RabbitMQ
- Consulta database: `GET /api/v1/analytics/dashboard/{id}`
- Procesa alertas (si T > 35°C)

**¿Cómo acceder?**
```bash
# API health
curl http://localhost:8080/api/v1/health

# Send telemetry
curl -X POST http://localhost:8080/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"greenhouseId":"GW-001","sensorId":"S01","temperature":25.5,"humidity":65}'

# Get dashboard
curl http://localhost:8080/api/v1/analytics/dashboard/GW-001
```

---

### 📦 **Contenedor 4: Frontend (React App) - EN TU PC**

```
NO ES DOCKER, corre directamente en tu PC
Tecnología: Node.js + Vite + React
Puerto: 3000
```

**¿Qué hace?**
- Muestra dashboard con gráficos
- 4 tabs: Dashboard, Ingestion, Sensors, Alerts
- Botones funcionales para enviar datos
- Consume API del backend vía proxy

---

## Flujo de datos

### Escenario: Envías datos desde Frontend

```
1. TÚ haces click en "Send Telemetry" en http://localhost:3000
                           ↓
2. FRONTEND (React)
   └─ Envía: POST http://localhost:8080/api/v1/ingest
      Datos: {greenhouse: GW-001, sensor: S01, temp: 25.5, humidity: 65}
                           ↓
3. BACKEND (Spring Boot)
   ├─ Recibe el POST
   ├─ Valida datos
   └─ Publica en RabbitMQ con routing key: "invernadero.GW-001.S01"
                           ↓
4. RABBITMQ (Message Broker)
   ├─ Recibe el mensaje
   ├─ Lo copia a 2 queues simultáneamente:
   │  ├─ alarm.queue
   │  └─ persistence.queue
   └─ Garantiza que no se pierden datos
                           ↓
                      (EN PARALELO)
                    ↙                ↘
5a. AlarmService         5b. PersistenceService
   ├─ Consume de            ├─ Consume de
   │  alarm.queue           │  persistence.queue
   ├─ Chequea: T > 35°C?    ├─ Guarda en TimescaleDB:
   └─ Si SÍ → Registra        │ INSERT INTO mediciones
      alerta                  │ VALUES(...)
                              └─ ✅ Datos guardados
                           ↓
6. TÚ ves en "Dashboard" tab
   ├─ Frontend hace GET http://localhost:8080/api/v1/analytics/dashboard/GW-001
   │              ↓
   ├─ Backend consulta: SELECT * FROM mediciones WHERE greenhouse_id=GW-001
   │              ↓
   ├─ Retorna JSON con datos
   │              ↓
   └─ Frontend dibuja gráficos con Recharts
                           ↓
              ✅ VES LOS DATOS EN PANTALLA
```

---

## Red interna

Todos los contenedores están en la **MISMA RED** (docker network):

```yaml
Network: invernadero_network (bridge)
Contenedores conectados:
  - timescaledb
  - rabbitmq
  - backend
```

**¿Por qué importa?**

El Backend puede conectar a TimescaleDB así:
```
jdbc:postgresql://timescaledb:5432/invernadero_db
                 ↑
         Nombre del contenedor
         Docker lo traduce a IP automáticamente
```

El Backend puede conectar a RabbitMQ así:
```
amqp://guest:guest@rabbitmq:5672
                    ↑
            Nombre del contenedor
```

**Desde tu PC haces:**
```
http://localhost:8080        (Backend)
http://localhost:3000        (Frontend)
http://localhost:15672       (RabbitMQ UI)
localhost:5432               (PostgreSQL)
```

---

## Volúmenes

Los volúmenes garantizan que **los datos persisten** incluso si borras contenedores:

### Tus volúmenes

**postgres_data** (TimescaleDB)
- Almacena: Toda la base de datos
- Si borras el contenedor: `docker-compose down`
- Dato: Los datos quedan en el volumen
- Si haces `docker-compose up`: Datos se restauran

**rabbitmq_data** (RabbitMQ)
- Almacena: Mensajes en queues
- Garantiza que no pierdes mensajes pendientes

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar un volumen
docker volume inspect sistemainvernadero_postgres_data

# Ver tamaño de volúmenes
docker system df
```

---

## Estados

Un contenedor tiene varios estados:

```yaml
running:    Activo, ejecutando
exited:     Se detuvo (error o completado)
restarting: Tratando de reiniciar
paused:     En pausa (congelado)
created:    Creado pero nunca ejecutado
```

Ver estado actual:
```bash
docker-compose ps

# Salida:
# NAME           STATUS
# timescaledb    Up 5 minutes
# rabbitmq       Up 5 minutes
# backend        Up 2 minutes
```

---

## Logs

Los contenedores escriben TODO a stdout/stderr. Docker captura en logs:

```bash
# Ver logs en tiempo real (sigue)
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs --tail=100 backend

# Con timestamps
docker-compose logs -t backend

# Solo backend
docker-compose logs backend

# Todo
docker-compose logs

# Limpiar logs
docker container prune --force
```

---

## Ciclo de vida

### CREACIÓN

```bash
# 1. Build (construye imagen)
docker-compose build
# Dockerfile → Imagen

# 2. Up (crea y inicia contenedores)
docker-compose up -d
# ├─ Crea red
# ├─ Crea volúmenes
# ├─ Crea 4 contenedores
# └─ Los inicia
```

### DURANTE EJECUCIÓN

```
- Procesos ejecutan
- Escriben a stdout (logs)
- Crean archivos (en volúmenes persisten)
- Escuchan en puertos
```

### PARADA

```bash
# 1. Stop (pausa contenedores)
docker-compose stop
# Envía SIGTERM (kill suave)
# Contenedores pausados pero no eliminados

# 2. Down (detiene y elimina)
docker-compose down
# ├─ Detiene contenedores
# ├─ Elimina contenedores
# ├─ Elimina red
# └─ MANTIENE volúmenes (datos persisten)

# 3. Down -v (elimina TODO)
docker-compose down -v
# ⚠️  También elimina volúmenes
# ⚠️  PIERDES TODOS LOS DATOS
```

---

## Comandos útiles

### Ver información

```bash
# Contenedores corriendo
docker ps

# Todos los contenedores
docker ps -a

# Imágenes disponibles
docker images

# Volúmenes
docker volume ls

# Redes
docker network ls
```

### Inspeccionar

```bash
# Info completa de contenedor
docker inspect <container_id>

# Logs de contenedor
docker logs <container_id>

# Ver archivos dentro de contenedor
docker exec <container_id> ls

# Uso de CPU/memoria
docker stats
```

### Conectarse

```bash
# Shell en contenedor
docker exec -it <container_id> bash

# Shell alternativo
docker exec -it <container_id> sh

# Comando específico
docker exec <container_id> ls /app
```

### Limpiar

```bash
# Elimina todo no usado
docker system prune

# Elimina todo (incluyendo volúmenes)
docker system prune -a --volumes

# Ver uso de espacio
docker system df
```

---

## Resumen

```
✅ 4 contenedores = 1 aplicación completa
✅ Se comunican por red Docker (interna)
✅ Puertos mapeados para acceso desde tu PC
✅ Datos persistidos en volúmenes
✅ Logs capturados y accesibles
✅ Aislamiento = no interfieren con tu sistema
```

Cuando haces `docker-compose up`:
1. Docker verifica que imágenes existan
2. Crea red interna
3. Crea volúmenes
4. Inicia 4 contenedores en paralelo
5. Todos conectados en la MISMA red
6. Se comunican por nombre (DNS interno)
7. Tú accedes desde localhost:puerto
