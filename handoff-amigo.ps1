# Handoff del proyecto Sistema Invernadero
# Ejecutar desde la raiz del repo:
#   powershell -ExecutionPolicy Bypass -File .\handoff-amigo.ps1

Write-Host "=== Sistema Invernadero: contexto para colaborador ===" -ForegroundColor Green

Write-Host "`n1) Stack del proyecto" -ForegroundColor Cyan
Write-Host "- Frontend: React + Vite + Tailwind + Recharts"
Write-Host "- Backend: Spring Boot 3.2.x + Java 17"
Write-Host "- Mensajeria: RabbitMQ topic exchange"
Write-Host "- Base local: TimescaleDB/PostgreSQL"
Write-Host "- Observabilidad: Prometheus + Grafana"
Write-Host "- Supabase remoto: proyecto vwtwbgnbmysjcjvolvbi"

Write-Host "`n2) Flujo funcional" -ForegroundColor Cyan
Write-Host "Frontend -> POST /api/v1/ingest -> Backend -> RabbitMQ -> PersistenceService -> TimescaleDB"
Write-Host "AlarmService crea alertas cuando temperature > 35 C."
Write-Host "Tablas principales: mediciones, sensores, alertas."

Write-Host "`n3) Credenciales locales por defecto" -ForegroundColor Cyan
Write-Host "PostgreSQL/TimescaleDB:"
Write-Host "  host: localhost"
Write-Host "  port: 5432"
Write-Host "  database: invernadero_db"
Write-Host "  user: admin"
Write-Host "  password: password"
Write-Host ""
Write-Host "RabbitMQ AMQP:"
Write-Host "  host: localhost"
Write-Host "  port: 5672"
Write-Host "  user: guest"
Write-Host "  password: guest"
Write-Host ""
Write-Host "Grafana:"
Write-Host "  url: http://localhost:3001"
Write-Host "  user: admin"
Write-Host "  password: admin"
Write-Host ""
Write-Host "Prometheus:"
Write-Host "  url: http://localhost:9090"

Write-Host "`n4) Archivo .env local sugerido" -ForegroundColor Cyan
$envContent = @"
POSTGRES_DB=invernadero_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=password

RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

GRAFANA_PASSWORD=admin

VITE_API_URL=http://localhost:8080
"@

if (-not (Test-Path ".env")) {
    $envContent | Set-Content -Path ".env" -Encoding UTF8
    Write-Host ".env creado con credenciales locales por defecto." -ForegroundColor Green
} else {
    Write-Host ".env ya existe; no se sobrescribio." -ForegroundColor Yellow
}

Write-Host "`n5) Supabase compartido" -ForegroundColor Cyan
Write-Host "Proyecto Supabase: vwtwbgnbmysjcjvolvbi"
Write-Host "El esquema remoto ya tiene: public.mediciones, public.sensores, public.alertas con RLS activo."
Write-Host "Importante: el proyecto remoto no reporta TimescaleDB disponible; funciona como PostgreSQL estandar."
Write-Host "Para dar acceso real:"
Write-Host "  A) Invitar al colaborador desde Supabase Dashboard > Organization/Team Members."
Write-Host "  B) O compartirle una connection string desde Project Settings > Database."
Write-Host "No pegues la password de Supabase en Git. Usar variables de entorno locales."

Write-Host "`n6) Comandos principales" -ForegroundColor Cyan
Write-Host "Levantar desde cero BORRANDO datos locales:"
Write-Host "  docker compose down -v"
Write-Host "  docker compose build --no-cache"
Write-Host "  docker compose up -d"
Write-Host ""
Write-Host "Reiniciar conservando datos locales:"
Write-Host "  docker compose down"
Write-Host "  docker compose up -d"
Write-Host ""
Write-Host "Build frontend:"
Write-Host "  npm.cmd run build"
Write-Host ""
Write-Host "Tests backend con Docker:"
Write-Host "  docker run --rm -v `"`${PWD}\java-backend:/app`" -w /app maven:3.9-eclipse-temurin-17 mvn test"

Write-Host "`n7) URLs locales" -ForegroundColor Cyan
Write-Host "Frontend:   http://localhost:3000"
Write-Host "Backend:    http://localhost:8080/api/v1/health"
Write-Host "Prometheus: http://localhost:9090"
Write-Host "Grafana:    http://localhost:3001"

Write-Host "`n8) Endpoints utiles" -ForegroundColor Cyan
Write-Host "GET  /api/v1/health"
Write-Host "POST /api/v1/ingest"
Write-Host "POST /api/v1/sensors/register"
Write-Host "GET  /api/v1/sensors"
Write-Host "GET  /api/v1/alerts"
Write-Host "GET  /api/v1/analytics/dashboard/1"
Write-Host "POST /api/v1/demo/seed"

Write-Host "`n9) Prueba rapida de API" -ForegroundColor Cyan
Write-Host "Cuando el stack este arriba, puedes ejecutar:"
Write-Host "  Invoke-RestMethod -Uri http://localhost:8080/api/v1/health"
Write-Host "  Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/demo/seed"
Write-Host "  Invoke-RestMethod -Uri http://localhost:8080/api/v1/sensors"
Write-Host "  Invoke-RestMethod -Uri http://localhost:8080/api/v1/alerts"

Write-Host "`n10) Notas de desarrollo" -ForegroundColor Cyan
Write-Host "- No usar docker compose down -v si se quieren conservar datos locales."
Write-Host "- La configuracion de infraestructura vive en infra/."
Write-Host "- El frontend ya consume backend real; no depende de mocks."
Write-Host "- Si conectan el backend a Supabase, usar la connection string de Supabase en variables DB_*."

Write-Host "`nHandoff listo." -ForegroundColor Green
