# 🚨 PROBLEMA: Docker Build Toma Mucho Tiempo

El problema es que Maven compila TODO en Docker la primera vez (~15 minutos).

**Solución**: Usar docker-compose sin esperar o usar versión pre-compilada.

---

## ✅ SOLUCIÓN RÁPIDA - 3 MINUTOS

### Opción 1: Usar Imágenes Pre-Compiladas (SIN BUILD)

```bash
cd SistemaInvernadero

# Cambiar docker-compose para usar imágenes, no build
# Editar docker-compose.yml:
# - backend: USAR IMAGE en lugar de build
# - frontend: USAR IMAGE en lugar de build
```

### Opción 2: Pre-Compilar Maven Localmente

```bash
cd java-backend

# Compilar localmente (necesita Maven instalado)
mvn clean package -DskipTests

# O si no tienes Maven, usar Docker pero solo UNA VEZ:
docker run -it --rm -v "$(pwd)":/app -w /app maven:3.9-eclipse-temurin-17 mvn clean package -DskipTests

# Luego el Dockerfile solo ejecuta el JAR (muy rápido)
```

---

## 🔧 SOLUCIÓN INMEDIATA

Voy a crear un docker-compose optimizado que NO compila (solo ejecuta):

```yaml
# Cambiar backend:
backend:
  image: sistemainvernadero-backend:latest  # Use image instead of build
  ports:
    - "8080:8080"
  
# Cambiar frontend:
frontend:
  image: sistemainvernadero-frontend:latest  # Use image instead of build
  ports:
    - "3000:3000"
```

---

## 📋 PASOS AHORA:

1. **Detener containers**
   ```bash
   docker-compose down
   ```

2. **Compilar backend UNA VEZ**
   ```bash
   cd java-backend
   docker run -it --rm -v "$(pwd)":/app -w /app maven:3.9-eclipse-temurin-17 mvn clean package -DskipTests
   ```
   
   Esto toma ~5 min SOLO LA PRIMERA VEZ.

3. **Compilar frontend UNA VEZ**
   ```bash
   cd ..
   npm install
   npm run build
   ```
   
   Toma ~2 min.

4. **Update docker-compose.yml** para usar imágenes
   ```bash
   # Replace build sections with image sections
   ```

5. **Levanta de nuevo**
   ```bash
   docker-compose up -d
   # Ahora toma solo ~30 segundos
   ```

---

## ⚠️ PROBLEMA RAÍZ

El `docker-compose.yml` actual intenta **compilar** en Docker cada vez:

```yaml
backend:
  build:  # ← ESTO compila Maven CADA VEZ (15+ min)
    context: ./java-backend

frontend:
  build:  # ← ESTO compila npm CADA VEZ (5+ min)
    context: .
```

**Solución**: Cambiar a usar imágenes pre-compiladas.

---

## OPCIÓN A (Más Rápido Ahora):  Pre-Build & Use Images

### Paso 1: Stop actual
```bash
docker-compose down -v
```

### Paso 2: Pre-compile backend (UNA VEZ - 5 min)
```bash
cd java-backend
docker run -it --rm \
  -v "$(pwd)":/app \
  -w /app \
  maven:3.9-eclipse-temurin-17 \
  mvn clean package -DskipTests
```

### Paso 3: Pre-compile frontend (UNA VEZ - 2 min)
```bash
cd ..
npm install
npm run build
```

### Paso 4: Update docker-compose.yml
```yaml
services:
  backend:
    # Remove build: section
    image: sistemainvernadero-backend:latest
    build:
      context: ./java-backend
    ports:
      - "8080:8080"
    ...
  
  frontend:
    # Keep as is, but can also use image
    build:
      context: .
    ports:
      - "3000:3000"
    ...
```

### Paso 5: Start (NOW FAST - 30 sec)
```bash
docker-compose up -d
```

---

## OPCIÓN B (Simplest - Skip Docker Para Frontend)

```bash
# Backend en Docker
docker-compose up -d backend timescaledb rabbitmq

# Frontend localmente (MUCHO más rápido)
npm install
npm run dev
# Open http://localhost:3000
```

Esto es mucho más rápido para desarrollo.

---

## 🎯 RECOMENDACIÓN AHORA

**Usa Opción B (Frontend local)**:

```bash
# Terminal 1: Backend + infraestructura
cd SistemaInvernadero
docker-compose up backend timescaledb rabbitmq

# Terminal 2: Frontend
cd SistemaInvernadero
npm install
npm run dev

# Abre: http://localhost:3000
```

**Ventajas**:
- ✅ Front end se levanta en 3 segundos
- ✅ Backend + DB + RabbitMQ en 30 segundos
- ✅ Hot reload de frontend (vite)
- ✅ NO ESPERAS 15+ MINUTOS

**Total Time**: ~2 minutos (vs 15+ con build completo)

---

Quiero que **hagas esto ahora** y me confirmes cuando tengas:

1. ✅ Backend + infraestructura corriendo en Docker
2. ✅ Frontend corriendo localmente  
3. ✅ Abierto http://localhost:3000

¿Vamos con Opción B?
