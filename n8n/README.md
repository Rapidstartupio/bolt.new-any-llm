# n8n Railway Deployment Guide

This guide will help you deploy n8n with PostgreSQL on Railway.

## The Problem

When deploying n8n on Railway, the error `connect ECONNREFUSED ::1:5432` occurs because n8n is trying to connect to PostgreSQL on localhost. In Railway, services run in separate containers and must communicate through Railway's internal networking.

## Solution Overview

Railway provides internal networking between services in the same project. Services can communicate using:
1. Internal domain names (`servicename.railway.internal`)
2. Railway's environment variable references

## Step-by-Step Deployment

### 1. Create a New Railway Project

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Name it something like "n8n-automation"

### 2. Deploy PostgreSQL

1. Click "New Service" in your Railway project
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision PostgreSQL with these environment variables:
   - `PGDATABASE`
   - `PGHOST`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGPORT`
   - `DATABASE_URL`

### 3. Deploy n8n

1. Click "New Service" again
2. Select "GitHub Repo" and connect your repository
3. Point to the `/n8n` directory in your repo
4. Set the root directory to `/n8n` in the service settings

### 4. Configure n8n Environment Variables

In your n8n service settings, go to "Variables" and add:

```bash
# Basic Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password-here

# Database Configuration (Reference PostgreSQL variables)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{RAILWAY_PRIVATE_DOMAIN}}
DB_POSTGRESDB_DATABASE=${{PGDATABASE}}
DB_POSTGRESDB_USER=${{PGUSER}}
DB_POSTGRESDB_PASSWORD=${{PGPASSWORD}}
DB_POSTGRESDB_PORT=5432

# Alternative: Use the connection string directly
DATABASE_URL=${{DATABASE_URL}}

# n8n Configuration
NODE_FUNCTION_ALLOW_EXTERNAL=*
N8N_ENCRYPTION_KEY=your-32-char-encryption-key-here

# Port Configuration (Railway sets this automatically)
PORT=${{PORT}}
N8N_PORT=${{PORT}}

# Disable file permissions warning (optional)
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
```

### 5. Using Internal Networking

If your PostgreSQL service is named "postgres", you can also use:
```bash
DB_POSTGRESDB_HOST=postgres.railway.internal
```

## Important Notes

1. **Service Order**: PostgreSQL must be deployed before n8n
2. **Same Project**: Both services must be in the same Railway project
3. **Variable References**: Use `${{VARIABLE_NAME}}` syntax to reference variables from other services
4. **Encryption Key**: Generate a secure 32-character encryption key for `N8N_ENCRYPTION_KEY`
5. **Port Binding**: Make sure both `PORT` and `N8N_PORT` are set to `${{PORT}}` for Railway

## Troubleshooting

### "command n8n not found" Error
This happens when the Dockerfile overrides the official n8n image's entrypoint. The official n8n Docker image should be used as-is without custom CMD or ENTRYPOINT directives.

### Connection Refused Error
If you see `connect ECONNREFUSED ::1:5432`, it means n8n is trying to connect to localhost. Check:
- Environment variables are set correctly
- You're using Railway's variable references
- Both services are in the same project

### Permission Errors
The warning about file permissions can be safely ignored. To enforce permissions:
```bash
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
```

### Database Not Found
Ensure PostgreSQL is fully deployed before starting n8n. You can check the PostgreSQL logs to confirm it's running.

## Local Development

For local development, use the provided `docker-compose.yml`:

```bash
docker-compose up
```

This will start both n8n and PostgreSQL locally with the correct networking configuration.

## Scripts

- `railway-setup.ps1` - PowerShell script with setup instructions (Windows)
- `railway-setup.sh` - Bash script with setup instructions (Linux/Mac)

Run these scripts to see the environment variables you need to configure.

# n8n on RailwayThis folder contains configuration for deploying n8n to Railway using the official Docker image.## Setup1. Edit the `.env` file to set your admin username, password, and webhook URL.2. (Optional) Customize the `Dockerfile` if you need to extend n8n.## Deploy to Railway1. Make sure you have the [Railway CLI](https://docs.railway.app/develop/cli) installed and authenticated (`railway login`).2. Set your `RAILWAY_TOKEN` in the root `.env` file.3. From the `n8n` directory, run:   ```powershell   railway up   ```4. n8n will be deployed and accessible at the Railway-provided URL.## Security- Basic authentication is enabled by default. Change the default credentials in `.env`.- For production, consider additional security (e.g., Railway IP allowlist, Cloudflare Access).

# n8n Railway Automated Setup (Windows/PowerShell)

This folder contains a PowerShell script to automate the setup and deployment of n8n and Postgres on Railway using the Railway CLI.

## Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed (`npm install -g railway`)
- Node.js installed on Windows
- A Railway account and API key ([get your key here](https://railway.app/settings/account))

## Setup Steps

1. **Clone the repository**

2. **Set your Railway API key as an environment variable in PowerShell:**
   ```powershell
   $env:RAILWAY_TOKEN = "your_railway_api_key_here"
   ```
   Or, add it to a `.env` file in the `n8n` directory:
   ```
   RAILWAY_TOKEN=your_railway_api_key_here
   ```

3. **Run the setup script in PowerShell:**
   ```powershell
   cd n8n
   .\railway-setup.ps1
   ```

This will:
- Create (or select) a Railway project
- Add a Postgres plugin if not already present
- Deploy the n8n service from this folder
- Set all required environment variables for n8n to connect to Postgres

## Customization
- Edit `railway-setup.ps1` to change the project name or n8n basic auth credentials.

## Notes
- You only need to run this script once per Railway project setup.
- You can re-run it safely; it is idempotent.

## Troubleshooting

- **Railway CLI must be installed globally in Windows.**
  - Install with:
    ```powershell
    npm install -g railway
    ```
  - To check, run:
    ```powershell
    railway --version
    ```
    and ensure you see a version number.
- **Node.js must also be installed on Windows.**
- If you see errors about `railway: command not found` or `node: not found`, install Node.js and Railway CLI as above.
- If the script cannot find your `RAILWAY_TOKEN`, ensure it is set in your environment or in a correctly formatted `.env` file in the `n8n` directory.

# n8n Railway Automated Setup

This folder contains scripts to automate the setup and deployment of n8n and Postgres on Railway using the Railway CLI.

## Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed (`npm install -g railway`)
- A Railway account and API key ([get your key here](https://railway.app/settings/account))

## Setup Steps

1. **Clone the repository**

2. **Set your Railway API key as an environment variable:**
   ```sh
   export RAILWAY_TOKEN=your_railway_api_key_here
   ```
   Or, add it to a `.env` file in the `n8n` directory:
   ```
   RAILWAY_TOKEN=your_railway_api_key_here
   ```

3. **Run the setup script:**
   ```sh
   cd n8n
   bash railway-setup.sh
   ```

This will:
- Create (or select) a Railway project
- Add a Postgres plugin if not already present
- Deploy the n8n service from this folder
- Set all required environment variables for n8n to connect to Postgres

## Customization
- Edit `railway-setup.sh` to change the project name or n8n basic auth credentials.

## Notes
- You only need to run this script once per Railway project setup.
- You can re-run it safely; it is idempotent.

## Troubleshooting

- **Railway CLI must be installed in the same environment where you run the script.**
  - If you are using **WSL** or **Git Bash**, install Railway CLI there:
    ```sh
    npm install -g railway
    ```
  - If you only install Railway CLI in Windows, it will not be available in Bash/WSL.
  - To check, run:
    ```sh
    railway --version
    ```
    and ensure you see a version number.
- **Node.js must also be installed in your Bash/WSL environment.**
- If you see errors about `node: not found` or `railway: command not found`, install Node.js and Railway CLI as above. 
