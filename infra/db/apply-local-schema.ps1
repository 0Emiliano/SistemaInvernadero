# Aplica el esquema local idempotente sobre el contenedor TimescaleDB en ejecucion.
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\infra\db\apply-local-schema.ps1

$ErrorActionPreference = "Stop"

$container = "invernadero-timescaledb"
$database = $env:POSTGRES_DB
$user = $env:POSTGRES_USER

if ([string]::IsNullOrWhiteSpace($database)) {
    $database = "invernadero_db"
}

if ([string]::IsNullOrWhiteSpace($user)) {
    $user = "admin"
}

if (-not (Test-Path ".\infra\timescaledb\init.sql")) {
    throw "No se encontro .\infra\timescaledb\init.sql. Ejecuta este script desde la raiz del repo."
}

Get-Content ".\infra\timescaledb\init.sql" | docker exec -i $container psql -U $user -d $database

Write-Host "Esquema local aplicado sobre $container/$database." -ForegroundColor Green
