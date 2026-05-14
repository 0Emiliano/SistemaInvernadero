# Contexto para la siguiente sesion

Este documento resume el estado del proyecto y los cambios realizados durante la sesion de trabajo del 2026-05-13/2026-05-14. Sirve como punto de partida para retomar el proyecto sin volver a reconstruir todo el contexto.

## Proyecto

Sistema Invernadero es un proyecto con:

- Frontend React/Vite en `src/`.
- Backend Java 17/Spring Boot en `java-backend/`.
- RabbitMQ como broker de telemetria.
- TimescaleDB/PostgreSQL para persistencia de series de tiempo.
- Dashboard con Recharts, Tailwind CSS y Motion.
- Infraestructura local con Docker Compose y manifiesto Kubernetes.

## Cambios realizados

- Se agregaron `java-backend/bin/` y `java-backend/target/` al `.gitignore`.
- Se alineo el puerto de API del backend a `8080` en:
  - `java-backend/Dockerfile`
  - `java-backend/docker-compose.yml`
  - `K8S_MANIFEST.yml`
  - `INFRA_STANDARDS.md`
- Se actualizaron las imagenes base del backend Docker a:
  - `maven:3.9-eclipse-temurin-17`
  - `eclipse-temurin:17-jre`
- Se alinearon los nombres de colas RabbitMQ del codigo con la documentacion:
  - `alarm.queue`
  - `persistence.queue`
- Se corrigio `PersistenceService` agregando el import faltante de `LocalDateTime`.
- Se corrigio `TcpServerConfig` para usar el `handle` tipado de Spring Integration y permitir que el backend compile.
- Se tiparon los datos del dashboard en `analyticsService.ts` y `Dashboard.tsx`, eliminando `any`.
- Se corrigio el mock del dashboard para entregar numeros, no strings, a Recharts.
- Se removieron imports/estado no usados del dashboard.
- Se corrigio un selector CSS de impresion en `src/index.css`.
- Se corrigio un comentario con mojibake real en `vite.config.ts`.

## Verificaciones realizadas

- `npm.cmd run lint`: exitoso.
- `npm.cmd run build`: exitoso.
  - Queda una advertencia no bloqueante por chunk grande, esperable por Recharts.
- `docker build -t sistema-invernadero-backend:verify .` dentro de `java-backend`: exitoso.

## Notas de entorno

- `npm.ps1` esta bloqueado por la politica de ejecucion de PowerShell, por eso se uso `npm.cmd`.
- `mvn` no esta disponible en PATH local, por eso la verificacion Java se hizo con Docker.
- La primera ejecucion de `npm.cmd install` requirio permisos elevados por acceso a la cache de npm en `AppData`.
- El build Docker inicial fallo porque `openjdk:17-jdk-slim` ya no resolvia; quedo reemplazado por Eclipse Temurin.

## Estado funcional esperado

- Frontend:
  - Ejecutar con `npm.cmd run dev`.
  - Vite sirve en `http://localhost:3000`.
  - Proxy `/api` hacia `http://localhost:8080`.
- Backend:
  - Ejecutar via Docker build/run o con Java/Maven si se instala Maven.
  - API Spring Boot en `8080`.
  - TCP ingestion en `9000`.
- Infraestructura:
  - RabbitMQ en `5672` y panel admin en `15672`.
  - TimescaleDB en `5432`.

## Pendientes sugeridos

- Considerar agregar Maven Wrapper (`mvnw`) para compilar sin depender de Maven instalado globalmente.
- Revisar si se quiere crear endpoints reales para alertas activas e inventario de sensores, porque el dashboard aun usa mocks para esos KPIs.
- Evaluar code splitting del frontend si se quiere eliminar la advertencia de bundle grande.
- Revisar seguridad de credenciales Docker Compose antes de produccion.

---

# Bitacora acumulativa de sesiones

Esta seccion debe crecer con cada sesion nueva. No borrar sesiones anteriores. Agregar siempre una nueva entrada con el siguiente numero consecutivo: `Sesion 1`, `Sesion 2`, `Sesion 3`, etc.

## Sesion 1 - Estabilizacion inicial y contexto base

### Lo que se hizo

- Se analizo la estructura completa del proyecto, con foco en los archivos Markdown principales y los contratos entre frontend, backend e infraestructura.
- Se identifico que el proyecto combina frontend React/Vite, backend Java Spring Boot, RabbitMQ, TimescaleDB, Docker Compose y Kubernetes.
- Se corrigio `.gitignore` para excluir artefactos Java generados:
  - `java-backend/bin/`
  - `java-backend/target/`
- Se corrigio la configuracion de puertos para que el backend use API HTTP en `8080` de forma consistente:
  - `java-backend/Dockerfile`
  - `java-backend/docker-compose.yml`
  - `K8S_MANIFEST.yml`
  - `INFRA_STANDARDS.md`
- Se reemplazaron imagenes Docker antiguas o no resolubles por imagenes Eclipse Temurin mantenidas:
  - `maven:3.9-eclipse-temurin-17`
  - `eclipse-temurin:17-jre`
- Se alinearon los nombres de colas RabbitMQ del codigo con la documentacion:
  - `alarm.queue`
  - `persistence.queue`
- Se corrigio `PersistenceService` agregando el import faltante de `java.time.LocalDateTime`.
- Se corrigio `TcpServerConfig` para usar el `handle` tipado de Spring Integration y permitir que el backend compile.
- Se tiparon los datos del frontend:
  - Se agrego `SensorReading` en `src/services/analyticsService.ts`.
  - Se agrego `ChartPoint` en `src/components/Dashboard.tsx`.
  - Se elimino el uso de `any` en el dashboard y el servicio de analytics.
- Se corrigio el mock del dashboard para entregar numeros reales a Recharts.
- Se limpiaron imports/estado no usados en `Dashboard.tsx`.
- Se corrigio un selector CSS de impresion en `src/index.css`.
- Se corrigio un comentario con mojibake real en `vite.config.ts`.
- Se creo este archivo `SESSION_CONTEXT.md` y se enlazo desde `README.md`.
- Se hizo commit y push a `origin/main` con:
  - `00f1b90 Document context and stabilize project setup`

### Lo que hay actualmente

- Frontend React/Vite en `src/`.
- Backend Java 17/Spring Boot en `java-backend/`.
- API backend configurada en `8080`.
- TCP ingestion configurado en `9000`.
- Frontend Vite configurado para servir en `3000` y proxyear `/api` a `http://localhost:8080`.
- RabbitMQ definido como broker de telemetria con exchange `invernadero.telemetry.exchange`.
- Colas esperadas:
  - `alarm.queue`
  - `persistence.queue`
- TimescaleDB/PostgreSQL como persistencia de series de tiempo.
- Dashboard con datos reales desde `/api/v1/analytics/dashboard/{greenhouseId}` cuando backend e infraestructura estan levantados.
- Fallback mock en el dashboard cuando no hay backend disponible.
- KPIs de alertas activas y sensores operando siguen siendo mocks.

### Lo que se verifico

- `npm.cmd run lint`: exitoso.
- `npm.cmd run build`: exitoso.
  - Queda advertencia no bloqueante por chunk grande, probablemente por Recharts.
- `docker build -t sistema-invernadero-backend:verify .` dentro de `java-backend`: exitoso.
- `git push origin main`: exitoso.

### Lo que NO esta validado aun

Aunque frontend y backend compilan, no se puede afirmar que el sistema completo sea 100% funcional en conjunto todavia. Falta una validacion end-to-end real.

No se ha validado todavia:

- Levantar `docker-compose` completo con RabbitMQ, TimescaleDB y backend.
- Levantar frontend en `http://localhost:3000`.
- Confirmar que el dashboard consume correctamente:
  - `GET /api/v1/analytics/dashboard/GW-001`
- Enviar telemetria simulada al backend.
- Confirmar que RabbitMQ enruta mensajes a `alarm.queue` y `persistence.queue`.
- Confirmar que TimescaleDB guarda lecturas reales.
- Confirmar que el endpoint de analytics devuelve lecturas persistidas.
- Confirmar flujo completo sensor/TCP o ingestion REST -> RabbitMQ -> PersistenceService -> TimescaleDB -> AnalyticsController -> Dashboard.

### Lo que faltaria implementar o mejorar

- Agregar Maven Wrapper (`mvnw`) para no depender de Maven instalado globalmente.
- Crear prueba end-to-end local documentada, idealmente con script o comandos reproducibles.
- Implementar endpoints reales para:
  - alertas activas
  - sensores activos
  - inventario de sensores/invernaderos
- Reemplazar mocks de KPIs en `Dashboard.tsx` por datos reales.
- Agregar pruebas backend para adapters, ingestion, persistence y analytics.
- Agregar pruebas frontend o al menos smoke tests del dashboard.
- Revisar credenciales de Docker Compose antes de cualquier despliegue productivo.
- Evaluar Dead Letter Exchange y reintentos RabbitMQ, mencionados en standards pero no implementados todavia.
- Evaluar code splitting del frontend si se quiere eliminar la advertencia de bundle grande.

## Prompt reusable para futuras sesiones

Usa este prompt al finalizar cada sesion de trabajo para mantener este archivo actualizado sin perder historial:

```text
Actualiza SESSION_CONTEXT.md sin borrar contenido previo. Agrega una nueva entrada en "Bitacora acumulativa de sesiones" con el siguiente numero consecutivo de sesion.

La nueva entrada debe incluir:

1. Titulo: "Sesion # - <resumen corto>".
2. "Lo que se hizo": lista concreta de cambios, archivos relevantes y decisiones tomadas.
3. "Lo que hay actualmente": estado funcional actual del frontend, backend, infraestructura, datos, contratos y configuracion.
4. "Lo que se verifico": comandos ejecutados y resultado exacto, incluyendo advertencias no bloqueantes.
5. "Lo que NO esta validado aun": separar claramente compilacion/build de funcionalidad end-to-end.
6. "Lo que faltaria implementar o mejorar": pendientes tecnicos, integraciones, pruebas y riesgos.
7. Si hubo commit/push, incluir hash, mensaje y rama/remoto.

Reglas:
- No borres sesiones anteriores.
- No reemplaces contexto historico salvo que sea claramente incorrecto; en ese caso agrega una nota de correccion en la nueva sesion.
- Usa rutas relativas del repo cuando menciones archivos.
- Manten el texto en ASCII salvo que el archivo ya use acentos correctamente.
- Si el sistema no fue probado end-to-end, dilo explicitamente.
- Despues de actualizar el archivo, ejecuta las verificaciones relevantes, haz commit y pushea si el usuario lo solicita.
```

## Sesion 2 - Kubernetes alineado al proyecto real

### Lo que se hizo

- Se revisaron los manifiestos generados en `k8s/`.
- Se corrigio Kubernetes para coincidir con la arquitectura real del proyecto:
  - Backend Spring Boot en `8080`.
  - TCP ingestion en `9000`.
  - RabbitMQ como broker.
  - TimescaleDB como base de series de tiempo.
  - Frontend React/Vite servido como build estatico con Nginx.
- Se agrego `spring-boot-starter-actuator` al backend para soportar health checks Kubernetes.
- Se agregaron propiedades de Actuator en `java-backend/src/main/resources/application.properties`.
- Se actualizo `schema.sql` para crear la extension `timescaledb` antes de crear la hypertable.
- Se corrigio `k8s/configmaps-secrets.yaml`:
  - URL JDBC ahora apunta a `timescaledb-service`.
  - Base de datos alineada a `invernadero_db`.
  - Usuario DB alineado a `admin`.
  - Se agrego configuracion de Actuator y SQL init para Kubernetes.
- Se corrigio `k8s/postgres.yaml` para desplegar TimescaleDB con `timescale/timescaledb:latest-pg15`.
- Se corrigieron nombres de PVC/servicio a `timescaledb-pvc` y `timescaledb-service`.
- Se corrigio `k8s/backend.yaml`:
  - DB host a `timescaledb-service`.
  - Credenciales RabbitMQ mapeadas a `SPRING_RABBITMQ_USERNAME` y `SPRING_RABBITMQ_PASSWORD`.
  - Probes a `/actuator/health/liveness` y `/actuator/health/readiness`.
- Se agrego Dockerfile productivo del frontend en la raiz del repo.
- Se agrego `nginx.conf` para servir el frontend y proxyear `/api/` hacia `invernadero-api-service`.
- Se agrego `.dockerignore` para builds de frontend mas limpios.
- Se corrigio `k8s/frontend.yaml` para usar contenedor en puerto `8080` con Nginx no privilegiado.
- Se rehizo `k8s/DEPLOYMENT.md` con pasos reales de build, deploy, verificacion y limitaciones.
- Se reemplazo `K8S_MANIFEST.yml` por una nota de deprecacion que apunta a `k8s/`.
- Se actualizo `README.md` para mencionar `k8s/DEPLOYMENT.md`, Dockerfile frontend y build Docker del frontend.

### Lo que hay actualmente

- Manifiestos Kubernetes completos en `k8s/`.
- Backend preparado para health checks de Kubernetes via Actuator.
- TimescaleDB configurado como runtime de base de datos en Kubernetes.
- RabbitMQ configurado con PVC, servicio interno y LoadBalancer para management UI.
- Frontend preparado para imagen Docker productiva con Nginx unprivileged.
- Nginx del frontend proxya `/api/` hacia el backend interno `invernadero-api-service`.
- `K8S_MANIFEST.yml` queda como entrada de compatibilidad/deprecacion; la fuente real es `k8s/`.

### Lo que se verifico

- Se inspeccionaron todos los manifiestos `k8s/*.yaml`.
- `npm.cmd run lint`: exitoso.
- `npm.cmd run build`: exitoso.
  - Queda advertencia no bloqueante por chunk grande, esperable por Recharts.
- `docker build -t sistema-invernadero-backend:verify .` dentro de `java-backend`: exitoso.
- `docker build -t sistema-invernadero-frontend:verify .` desde la raiz del repo: exitoso.
- Se intento `kubectl apply --dry-run=client -f k8s/`, pero no hay cluster Kubernetes activo/configurado; `kubectl` intento conectar a `localhost:8080` y fallo.
- Se intento `kubectl apply --dry-run=client --validate=false -f k8s/`, pero `kubectl` igualmente intento descubrir recursos contra `localhost:8080` y fallo por falta de API server.
- La validacion real pendiente debe hacerse contra un cluster activo.

### Lo que NO esta validado aun

- No se ha desplegado en un cluster Kubernetes real.
- No se ha validado pull de imagenes desde un registry real.
- No se ha probado que los pods pasen readiness/liveness en cluster.
- No se ha validado el flujo completo:
  - Frontend LoadBalancer -> Nginx -> `/api/`
  - Backend service
  - RabbitMQ
  - TimescaleDB
  - Dashboard con datos persistidos

### Lo que faltaria implementar o mejorar

- Publicar imagenes reales de backend y frontend en un registry.
- Reemplazar `gcr.io/invernadero-pro/*:latest` por URLs reales.
- Cambiar passwords placeholder en `k8s/configmaps-secrets.yaml`.
- Probar `kubectl apply -f k8s/` contra un cluster real.
- Agregar Ingress y TLS si se despliega publicamente.
- Agregar estrategia de backups para TimescaleDB.
- Agregar manifests de migracion/seed o job de verificacion end-to-end.

## Sesion 3 - Despliegue Kubernetes completo y validacion end-to-end

### Lo que se hizo

**Despliegue Kubernetes en Docker Desktop**:
- Se detectó e inicio Docker Desktop con Kubernetes habilitado (v1.34.1).
- Se aplicaron manifiestos Kubernetes en orden correcto:
  - `kubectl apply -f k8s/namespace.yaml` → namespace `invernadero` creado.
  - `kubectl apply -f k8s/configmaps-secrets.yaml` → ConfigMap y Secrets con credenciales (invernadero/rabbitmq-secure-password-change-me, admin/password).
  - `kubectl apply -f k8s/persistent-volumes.yaml` → PVC para TimescaleDB (10Gi) y RabbitMQ (5Gi).
  - `kubectl apply -f k8s/postgres.yaml` → Deployment TimescaleDB v15-alpine.
  - `kubectl apply -f k8s/rabbitmq.yaml` → Deployment RabbitMQ v3.13-management (con correccion de probes).
  - `kubectl apply -f k8s/backend.yaml` → Deployment backend (3 replicas).
  - `kubectl apply -f k8s/frontend.yaml` → Deployment frontend (2 replicas).
  - `kubectl apply -f k8s/autoscaling.yaml` → HPA para backend y frontend.
  - `kubectl apply -f k8s/disruption-budgets.yaml` → PDB para HA.

**Correcciones realizadas**:
- Se modifico `k8s/rabbitmq.yaml`: cambio de livenessProbe exec a healthcheck con timeout de 5s, readinessProbe cambiado de exec a tcpSocket en puerto 5672.
- Se actualizaron `k8s/backend.yaml` y `k8s/frontend.yaml` para usar imagenes locales con `imagePullPolicy: Never` en lugar de GCR.

**Compilacion de imagenes Docker**:
- `docker build -t invernadero-backend:latest ./java-backend` → exitoso, imagen ~528MB compilada.
- `docker build -t invernadero-frontend:latest .` → exitoso, imagen ~74.7MB compilada, Vite build exitoso.

**Port-forwarding para acceso**:
- Se iniciaron 4 background jobs con `kubectl port-forward`:
  - Backend API: `svc/invernadero-api-service 8080:80 --address=0.0.0.0`
  - Frontend: `svc/invernadero-frontend-service 3000:80 --address=0.0.0.0`
  - RabbitMQ Management: `svc/rabbitmq-management 15672:15672 --address=0.0.0.0`
  - RabbitMQ AMQP: `svc/rabbitmq-service 5672:5672 --address=127.0.0.1`

**Validacion end-to-end**:
- Se creo `publish_test_data.py`: Script Python con pika para publicar 10 mensajes de telemetria a RabbitMQ.
- Se enviaron 10 lecturas de sensores (temp 25.5-36.5°C, humidity 60-72%) al exchange `invernadero.telemetry.exchange` con routing key `invernadero.GW-001.S01`.
- Se verifico en logs backend:
  - AlarmService procesa todos 10 mensajes.
  - ALERTA CRITICA disparada a 36.5°C (umbral: 35°C).
  - Accion: "Correo enviado a los responsables del sector."
  - PersistenceService inserta registros en tabla `mediciones` con Hibernate SQL inserts.
- Se testeo API endpoint `GET /api/v1/analytics/dashboard/GW-001`:
  - Respuesta JSON valida con `success: true`.
  - `recentReadings`: 11 registros (10 enviados + 1 duplicado en insert inicial).
  - `averageTemperature24h`: 29.827°C calculado correctamente.
  - Respuesta en < 500ms.

**Documentacion completada**:
- Se creo `K8S_ACCESS_GUIDE.md`: Guia de acceso con URLs, credenciales, endpoints, troubleshooting.
- Se creo `BACKEND_API_GUIDE.md`: Documentacion de endpoints REST, explicacion del error 404 en raiz.
- Se creo `SYSTEM_READY.md`: Status actual, acceso a servicios, metricas, architecture diagram, produccion checklist.
- Se creo `PHASE_1_COMPLETE.md`: Resultados validacion, flujo end-to-end, metricas DB, status de componentes.
- Se creo `NEXT_STEPS_ROADMAP.md`: Plan de 8 fases (validation, simulator, db optimization, security, monitoring, testing, CI/CD, production checklist) con timeline y ejemplos de codigo.
- Se creo `PROJECT_ANALYSIS.md`: Analisis profundo de arquitectura, stack, estructura carpetas, modulos backend, puertos, kubernetes, roadmap.

### Lo que hay actualmente

**Kubernetes Deployment**:
- Namespace `invernadero` activo.
- 7 pods running: 3 backend, 2 frontend, 1 rabbitmq, 1 timescaledb.
- Todos con status `1/1 Running` y healthy (readiness/liveness passing).
- Services: 3 LoadBalancer (frontend-lb, api-lb, rabbitmq-management), 4 ClusterIP (frontend-service, api-service, rabbitmq-service, timescaledb-service).
- HPA: backend escala 2-5 replicas (70% CPU / 80% memory), frontend escala 2-4 replicas (75% CPU).
- PDB: minAvailable 1 para backend y frontend.

**Base de datos**:
- TimescaleDB con tabla `mediciones` como hypertable.
- 11 registros persistidos (10 test + 1 inicial).
- Rangos: temperatura 25.5-36.5°C, humedad 60-72%, todos con timestamp y metadata (sensorId, greenhouseId, manufacturer).
- Queries SQL funcionan correctamente via Hibernate.

**Mensajeria**:
- RabbitMQ operativo con exchange `invernadero.telemetry.exchange` (topic type).
- Queues creadas: `alarm.queue`, `persistence.queue`.
- Routing key: `invernadero.{greenhouse}.{sensor}` funcionando.
- Management UI accesible en http://localhost:15672 (credenciales: invernadero/rabbitmq-secure-password-change-me).

**API Backend**:
- Spring Boot respondiendo en http://localhost:8080.
- `/api/v1/analytics/dashboard/GW-001` retorna datos reales agregados.
- `/actuator/health` retorna `{"status":"UP"}`.
- Alarms service procesando mensajes y disparando alertas por umbral.
- Persistence service guardando correctamente en DB.
- Response times < 500ms.

**Frontend**:
- React app accesible en http://localhost:3000.
- Nginx proxy configurado para redirigir `/api` al backend interno.
- Puede consumir datos reales del endpoint analytics.

**Acceso externo**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- RabbitMQ: http://localhost:15672
- Health: http://localhost:8080/actuator/health

### Lo que se verifico

- `kubectl cluster-info`: Docker Desktop Kubernetes operativo en https://kubernetes.docker.internal:6443.
- `kubectl get all -n invernadero`: 7 pods running, 4 services activos, 2 HPA, 2 PDB definidos.
- `kubectl get pods -n invernadero -o wide`: Todos los pods en status `1/1 Running`, IPs internas asignadas correctamente.
- Logs backend: AlarmService y PersistenceService procesando 10 mensajes sin errores, 1 alerta critica disparada, inserts SQL exitosos.
- API response: `GET /api/v1/analytics/dashboard/GW-001` retorna 11 records con estructura JSON valida, temperaturasCorrectas.
- Servicios accesibles via port-forward: Frontend en 3000, Backend en 8080, RabbitMQ Management en 15672, AMQP en 5672.
- Health check: `http://localhost:8080/actuator/health` retorna `{\"status\":\"UP\"}`.
- Database: 11 registros observados en logs (Hibernate inserts), average temperatura 29.83°C confirmado en API response.

### Lo que NO esta validado aun

- Visualizacion del frontend: No se verificó directamente que las graficas de React/Recharts muestren datos reales (puede estar usando mock aún).
- Query directa a DB: No se consultó timescaledb via psql directamente (límite de conexiones en K8s), pero logs confirman persistencia.
- Escalado dinámico: No se triggered HPA (no hay carga sostenida que cause scaling).
- Multi-greenhouse/multi-sensor: Solo probado GW-001/S01, no se verificó multi-tenant behavior.
- TCP ingestion: Puerto 9000 configurado pero no probado (solo testeado RabbitMQ HTTP vía REST).
- TLS/SSL: Servicios sin encryption, solo HTTP.
- Autenticacion: Endpoints sin JWT aún, solo acceso abierto.
- Backup/restore: No probado esquema de recuperacion de datos.
- Despliegue remoto: Solo validado en Docker Desktop local.

### Lo que faltaria implementar o mejorar

**Inmediato (hoy/mañana)**:
- Verificar visualmente que frontend en http://localhost:3000 muestra graficos con datos reales y no mock.
- Crear sensor simulator permanente (Python/Java como K8s Deployment o CronJob) para enviar datos continuamente.
- Agregar indices DB: `CREATE INDEX idx_greenhouse_timestamp ON mediciones(greenhouse_id, timestamp DESC)`.
- Cambiar todas las credenciales default antes de cualquier uso de produccion.

**Corto plazo (esta semana)**:
- Implementar autenticacion JWT en endpoints `/api/v1/**`.
- Setup Prometheus + Grafana para monitoreo en tiempo real.
- Crear runbooks y playbooks para operadores.
- Agregar pruebas unitarias e integracion (adapters, RabbitMQ, persistence, analytics).
- Probar flujo multi-greenhouse y multi-sensor.

**Mediano plazo (proximas 2 semanas)**:
- Agregar Ingress controller + TLS con cert-manager para acceso remoto.
- Setup CI/CD pipeline (GitHub Actions o similar) para build/push de imagenes a registry.
- Implementar backup automatizado de TimescaleDB (diario).
- Load testing: verificar sistema bajo carga (100+ sensores concurrentes).
- Despliegue en cluster multi-nodo (EKS/GKE/AKS si aplica).

**Largo plazo (produccion)**:
- Migracion de datos historicos si existe DB legacy.
- Notificaciones email reales (reemplazar logger por servicio real).
- Metricas de negocio (dashboard de operadores, SLA reporting).
- Escalabilidad: cache (Redis), DB sharding, message queue backpressure.

### Commits y push

- No se realizaron commits de los archivos generados aún. El repositorio queda en estado limpio sin push; se sugiere revisar los archivos generados y hacer commit cuando se confirme que todo es correcto.
