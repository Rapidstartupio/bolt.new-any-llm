#!/bin/bash

# Railway Setup Script for n8n with PostgreSQL
# This script provides the environment variables needed for Railway deployment

echo -e "\033[32mRailway n8n + PostgreSQL Setup Guide\033[0m"
echo -e "\033[32m====================================\033[0m"
echo ""

echo -e "\033[33mStep 1: Deploy PostgreSQL Service in Railway\033[0m"
echo "- Add a new PostgreSQL service to your Railway project"
echo "- Railway will automatically provision it with these variables:"
echo "  - PGDATABASE"
echo "  - PGHOST"
echo "  - PGPASSWORD"
echo "  - PGPORT"
echo "  - PGUSER"
echo "  - DATABASE_URL"
echo ""

echo -e "\033[33mStep 2: Configure n8n Service Environment Variables\033[0m"
echo "In your n8n service on Railway, set these environment variables:"
echo ""

echo -e "\033[36m# Basic Auth (change these!)\033[0m"
echo "N8N_BASIC_AUTH_ACTIVE=true"
echo "N8N_BASIC_AUTH_USER=admin"
echo "N8N_BASIC_AUTH_PASSWORD=your-secure-password"
echo ""

echo -e "\033[36m# Database Configuration (using Railway's PostgreSQL variables)\033[0m"
echo "DB_TYPE=postgresdb"
echo -e "\033[37mDB_POSTGRESDB_HOST=\${{RAILWAY_PRIVATE_DOMAIN}}\033[0m"
echo -e "\033[37mDB_POSTGRESDB_DATABASE=\${{PGDATABASE}}\033[0m"
echo -e "\033[37mDB_POSTGRESDB_USER=\${{PGUSER}}\033[0m"
echo -e "\033[37mDB_POSTGRESDB_PASSWORD=\${{PGPASSWORD}}\033[0m"
echo "DB_POSTGRESDB_PORT=5432"
echo ""

echo -e "\033[36m# Alternative: Use DATABASE_URL directly\033[0m"
echo -e "\033[37mDATABASE_URL=\${{DATABASE_URL}}\033[0m"
echo ""

echo -e "\033[36m# Other n8n Configuration\033[0m"
echo "NODE_FUNCTION_ALLOW_EXTERNAL=*"
echo "N8N_ENCRYPTION_KEY=your-encryption-key-here"
echo ""

echo -e "\033[33mStep 3: Internal Networking\033[0m"
echo "If PostgreSQL service name is 'postgres', you can also use:"
echo "DB_POSTGRESDB_HOST=postgres.railway.internal"
echo ""

echo -e "\033[33mStep 4: Deploy\033[0m"
echo "Push your code and Railway will handle the deployment!"
echo ""

echo -e "\033[31mIMPORTANT:\033[0m"
echo "- Make sure both services are in the SAME Railway project"
echo "- PostgreSQL must be deployed BEFORE n8n"
echo "- Use Railway's variable references (with \$ and {{}}) to link services"
echo ""
