# ✅ FRONTEND CORRIENDO - AHORA AGREGA BACKEND

## 🎉 Lo que hicimos

✅ **Frontend corriendo**: http://localhost:3000
✅ **Vite server listo**: En puerto 3000

## 🔧 Siguiente Paso: Levantar Backend + Infraestructura

### Abre NUEVA Terminal (Terminal 2)

```powershell
cd C:\Users\emili\OneDrive\Documentos\SistemaInvernadero\SistemaInvernadero
docker-compose up timescaledb rabbitmq backend
```

**Espera a ver**:
```
backend | Started InvernaderoApplication in ...
```

### Luego abre Navegador

```
http://localhost:3000
```

---

## 📊 Lo que debería ver

| Tab | Contenido |
|-----|-----------|
| Dashboard | Gráficos (vacíos por ahora) |
| Ingestion | Formulario para enviar datos |
| Sensors | Lista de sensores |
| Alerts | Alertas críticas |

---

## 🎯 Si Backend tarda mucho

El backend se compila la PRIMERA VEZ (~3-5 min).

Luego será rápido.

Espera tranquilo. 

Puedes ver logs con:
```powershell
docker-compose logs -f backend
```

---

## ✅ Cuando todo esté corriendo

1. ✅ Frontend: http://localhost:3000 (leyendo)
2. ✅ Backend: http://localhost:8080 (compilando)
3. ✅ Database: localhost:5432 (corriendo)
4. ✅ RabbitMQ: http://localhost:15672 (corriendo)

Luego:

1. Abre Ingestion tab
2. Envía telemetría
3. Ve datos en Dashboard

---

**¿CONFIRMACIÓN?**

Cuando backend esté corriendo:
```
✅ Frontend cargó en http://localhost:3000
✅ Backend respondiendo en http://localhost:8080
✅ Todo funciona
```

Dimelo y avanzamos! 🚀
