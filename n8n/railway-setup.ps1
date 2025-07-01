#!/usr/bin/env pwsh
# Railway Setup Script for n8n with PostgreSQL
# This script provides the environment variables needed for Railway deployment

Write-Host "Railway n8n + PostgreSQL Setup Guide" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Deploy PostgreSQL Service in Railway" -ForegroundColor Yellow
Write-Host "- Add a new PostgreSQL service to your Railway project"
Write-Host "- Railway will automatically provision it with these variables:"
Write-Host "  - PGDATABASE"
Write-Host "  - PGHOST"
Write-Host "  - PGPASSWORD"
Write-Host "  - PGPORT"
Write-Host "  - PGUSER"
Write-Host "  - DATABASE_URL"
Write-Host ""

Write-Host "Step 2: Configure n8n Service Environment Variables" -ForegroundColor Yellow
Write-Host "In your n8n service on Railway, set these environment variables:"
Write-Host ""

Write-Host "# Basic Auth (change these!)" -ForegroundColor Cyan
Write-Host "N8N_BASIC_AUTH_ACTIVE=true"
Write-Host "N8N_BASIC_AUTH_USER=admin"
Write-Host "N8N_BASIC_AUTH_PASSWORD=your-secure-password"
Write-Host ""

Write-Host "# Database Configuration (using Railway's PostgreSQL variables)" -ForegroundColor Cyan
Write-Host "DB_TYPE=postgresdb"
Write-Host 'DB_POSTGRESDB_HOST=${{RAILWAY_PRIVATE_DOMAIN}}' -ForegroundColor White
Write-Host 'DB_POSTGRESDB_DATABASE=${{PGDATABASE}}' -ForegroundColor White
Write-Host 'DB_POSTGRESDB_USER=${{PGUSER}}' -ForegroundColor White
Write-Host 'DB_POSTGRESDB_PASSWORD=${{PGPASSWORD}}' -ForegroundColor White
Write-Host "DB_POSTGRESDB_PORT=5432"
Write-Host ""

Write-Host "# Alternative: Use DATABASE_URL directly" -ForegroundColor Cyan
Write-Host 'DATABASE_URL=${{DATABASE_URL}}' -ForegroundColor White
Write-Host ""

Write-Host "# Other n8n Configuration" -ForegroundColor Cyan
Write-Host "NODE_FUNCTION_ALLOW_EXTERNAL=*"
Write-Host "N8N_ENCRYPTION_KEY=your-encryption-key-here"
Write-Host ""

Write-Host "Step 3: Internal Networking" -ForegroundColor Yellow
Write-Host "If PostgreSQL service name is 'postgres', you can also use:"
Write-Host "DB_POSTGRESDB_HOST=postgres.railway.internal"
Write-Host ""

Write-Host "Step 4: Deploy" -ForegroundColor Yellow
Write-Host "Push your code and Railway will handle the deployment!"
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "- Make sure both services are in the SAME Railway project"
Write-Host "- PostgreSQL must be deployed BEFORE n8n"
Write-Host "- Use Railway's variable references (with $ and {{}}) to link services"
Write-Host ""
