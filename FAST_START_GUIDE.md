# 🎯 SOLUCIÓN INMEDIATA - Cómo Correr en 2 Minutos

**PROBLEMA**: Docker build toma 15+ minutos (Maven compila todo).

**SOLUCIÓN**: Backend en Docker + Frontend localmente = 2 minutos total.

---

## ✅ PASOS RÁPIDO (CóPYA Y PEGA)

### Terminal 1: Backend + Infraestructura
```bash
cd SistemaInvernadero
docker-compose down
docker-compose up backend timescaledb rabbitmq
```

**Espera hasta ver**:
```
backend  | ...Started InvernaderoApplication
```

### Terminal 2: Frontend
```bash
cd SistemaInvernadero
npm install
npm run dev
```

**Espera hasta ver**:
```
  ➜  Local:   http://localhost:3000
```

### Terminal 3: Abre Navegador
```
http://localhost:3000
```

**¡LISTO!** Todo cargando.

---

## 📊 Comparativa

| Setup | Tiempo | Complejidad |
|-------|--------|-------------|
| docker-compose full | 15+ min | Espera larga |
| **Backend Docker + Frontend local** | **2 min** | **Simple ✅** |
| Manual setup | 30+ min | Muy complejo |

---

## ✨ Ventajas del Setup Local

✅ Frontend se recompila automáticamente (Vite hot reload)
✅ Backend corriendo en Docker (limpio)
✅ Database + RabbitMQ corriendo (aislados)
✅ 2 minutos TOTAL
✅ Fácil debuggear
✅ Fácil modificar código

---

## 🔧 Si Aún No Funciona

### ¿Errores en Terminal 1?

```bash
# Ver logs
docker-compose logs backend

# Re-intentar
docker-compose restart backend
```

### ¿Errores en Terminal 2 (npm)?

```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ¿Puerto 3000 en uso?

```bash
# Usar diferente puerto
npm run dev -- --port 3001
# Luego abre http://localhost:3001
```

### ¿Puerto 8080 en uso?

```bash
# Detener lo que está corriendo
# O cambiar port en docker-compose.yml:
# ports:
#   - "8081:8080"  # Cambiar de 8080 a 8081
```

---

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Ver si servicios están UP
docker-compose ps

# Detener todo
docker-compose down

# Reiniciar backend
docker-compose restart backend

# Conectar a database
docker-compose exec timescaledb psql -U admin -d invernadero_db
```

---

## 🎯 ESTO DEBERÍA FUNCIONAR YA

Ejecuta exactamente esto:

**Terminal 1**:
```bash
cd ~/Documentos/SistemaInvernadero
docker-compose down
docker-compose up backend timescaledb rabbitmq
```

**Terminal 2** (espera 30 segundos, luego):
```bash
cd ~/Documentos/SistemaInvernadero
npm install
npm run dev
```

**Navegador**:
```
http://localhost:3000
```

---

**¿Funciona?** 

Si SÍ → ¡Disfruta! 🎉
Si NO → Dame el error exacto de la terminal.
