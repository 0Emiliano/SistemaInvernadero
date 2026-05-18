# Genera un backup SQL de la base local TimescaleDB/PostgreSQL.
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\infra\backup\backup-local.ps1

$ErrorActionPreference = "Stop"

$container = "invernadero-timescaledb"
$database = $env:POSTGRES_DB
$user = $env:POSTGRES_USER
$backupDir = ".\infra\backup\out"

if ([string]::IsNullOrWhiteSpace($database)) {
    $database = "invernadero_db"
}

if ([string]::IsNullOrWhiteSpace($user)) {
    $user = "admin"
}

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$output = Join-Path $backupDir "invernadero-$timestamp.sql"

docker exec -t $container pg_dump -U $user -d $database | Set-Content -Path $output -Encoding UTF8

Write-Host "Backup creado: $output" -ForegroundColor Green
