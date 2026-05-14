# Guía de Ejecución Local - Sistema Invernadero

Esta es una guía rápida. Para una explicación detallada de la infraestructura (Docker, RabbitMQ, TimescaleDB), consulta el nuevo archivo **[CONFIGURACION_TOTAL.md](./CONFIGURACION_TOTAL.md)**.

## Paso 1: Levantar Infraestructura (Docker)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
cd java-backend
docker-compose up -d
```
*Esto encenderá:*
- **TimescaleDB:** En el puerto `5432` (Persistencia de series de tiempo).
- **RabbitMQ:** En el puerto `5672` (Mensajería) y `15672` (Panel Admin).

## Paso 2: Ejecutar el Backend (Java)
Abre una **nueva terminal** (sin cerrar la anterior):
```bash
cd java-backend
# En VS Code, simplemente abre este folder y presiona F5 en la aplicación principal.
```
*   **API REST:** Escuchando en `http://localhost:8080`.
*   **Puerto de Sensores (TCP):** Escuchando en `9000`.

## Paso 3: Ejecutar el Frontend (React)
Abre una **tercera terminal** en la raíz del proyecto:
```bash
npm install
npm run dev
```
*   **Dashboard:** Abre `http://localhost:3000` en tu navegador. El tráfico de `/api` se redirige automáticamente al puerto `8080`.

---

## Verificaciones Rápidas
1. **Base de Datos:** Entra a `localhost:15672` (usuario: `guest`, clave: `guest`) para ver si RabbitMQ está activo.
2. **Logs:** Si ves `[TCP SERVER] Iniciado en puerto 9000` en la consola de Java, la ingesta está lista.
3. **Frontend:** Deberías ver las gráficas de Recharts moviéndose con datos simulados (o reales si envías telemetría).
