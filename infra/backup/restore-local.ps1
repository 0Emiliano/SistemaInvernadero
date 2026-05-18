# Restaura un backup SQL en la base local. Esto puede modificar datos existentes.
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\infra\backup\restore-local.ps1 -Path .\infra\backup\out\archivo.sql

param(
    [Parameter(Mandatory = $true)]
    [string] $Path
)

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

if (-not (Test-Path $Path)) {
    throw "No existe el archivo de backup: $Path"
}

Get-Content $Path | docker exec -i $container psql -U $user -d $database

Write-Host "Backup restaurado en $container/$database." -ForegroundColor Green
