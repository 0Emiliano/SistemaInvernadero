$ErrorActionPreference = "Stop"

$schemaPath = Join-Path $PSScriptRoot "schema.sql"

if (-not (Test-Path -LiteralPath $schemaPath)) {
    throw "No se encontro schema.sql en $PSScriptRoot"
}

if (-not $env:SUPABASE_DB_URL) {
    throw "Define SUPABASE_DB_URL con el connection string PostgreSQL o JDBC de Supabase antes de ejecutar este script."
}

$connectionString = $env:SUPABASE_DB_URL
if ($connectionString.StartsWith("jdbc:postgresql://")) {
    $connectionString = $connectionString.Replace("jdbc:postgresql://", "postgresql://")
}

Get-Content -LiteralPath $schemaPath -Raw | psql $connectionString
