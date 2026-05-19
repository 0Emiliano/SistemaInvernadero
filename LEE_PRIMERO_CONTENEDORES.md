# 📚 LEER PRIMERO - Cómo Entienden tus Contenedores

Acabo de crear **2 archivos** que explican CÓMO FUNCIONAN tus contenedores en detalle:

---

## 📖 Opción 1: Leer en Markdown (Recomendado)

```
Abre este archivo:
  SistemaInvernadero/CONTENEDORES_EXPLICACION.md

Contiene:
  ✅ Explicación visual de cada contenedor
  ✅ Flujo completo de datos (paso a paso)
  ✅ Cómo se comunican entre sí
  ✅ Volúmenes (persistencia)
  ✅ Logs y debugging
  ✅ Comandos útiles
```

---

## 🎬 Opción 2: Ejecutar Script Bash

```bash
bash CONTENEDORES_EXPLICACION.sh

# Muestra TODO en terminal con colores y diagramas ASCII
```

---

## 🎯 Resumen Ultra Rápido

```
┌─────────────────────────────────────────────────────────┐
│                  TUS 4 CONTENEDORES                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📦 TimescaleDB (Database)                              │
│    └─ Guarda datos de sensores                         │
│       Puerto: localhost:5432                           │
│                                                         │
│ 📦 RabbitMQ (Message Broker)                           │
│    └─ Distribuye mensajes entre servicios              │
│       Puerto: localhost:15672 (UI)                     │
│                                                         │
│ 📦 Backend (Spring Boot API)                           │
│    └─ Recibe datos, publica en RabbitMQ                │
│       Puerto: localhost:8080                           │
│                                                         │
│ 📦 Frontend (React App - EN TU PC)                     │
│    └─ Muestra dashboards                               │
│       Puerto: localhost:3000                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ FLUJO: Frontend → Backend → RabbitMQ → (Parallel)      │
│                              ├─ AlarmService           │
│                              └─ PersistenceService → DB│
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Conceptos Clave

### Red Interna
Todos los contenedores están en la MISMA red Docker.
Se comunican por nombre (DNS interno):
- `timescaledb:5432` (no localhost)
- `rabbitmq:5672` (no localhost)

TÚ accedes por puerto mapeado:
- `localhost:5432` → contenedor:5432
- `localhost:8080` → contenedor:8080

### Volúmenes
- `postgres_data`: Base de datos persiste
- `rabbitmq_data`: Mensajes persisten
- Si borras contenedor, datos quedan
- Si haces `docker-compose up`, datos se restauran

### Logs
- Cada contenedor escribe a stdout
- Docker captura en logs
- Ver con: `docker-compose logs -f backend`

---

## 🎓 Aprender Más

Comandos para explorar:

```bash
# Ver todo
docker-compose ps           # Estado de contenedores
docker volume ls            # Volúmenes
docker network ls           # Redes

# Inspeccionar
docker logs <container>     # Logs
docker inspect <container>  # Info completa

# Conectarse
docker exec -it <container> bash   # Shell
docker exec <container> ls /app    # Ver archivos
```

---

## ✅ Resultado

Entenderás:
1. ✅ Qué es un contenedor
2. ✅ Cómo tus 4 contenedores se comunican
3. ✅ Por qué funciona tu aplicación
4. ✅ Cómo debuggear si algo falla
5. ✅ Cómo los datos persisten

---

**Siguiente paso:**
Lee `CONTENEDORES_EXPLICACION.md` completo.
Luego ejecuta tu backend y confirmamos que todo funciona! ✨
