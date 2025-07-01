# n8n Railway Deployment Troubleshooting Guide

## Common Issue: "connect ECONNREFUSED ::1:5432"

This error means n8n is trying to connect to PostgreSQL on localhost instead of using Railway's internal networking.

## Quick Fix Checklist

### 1. Verify PostgreSQL Service Name
In your Railway project, check the exact name of your PostgreSQL service. It's shown at the top of the service card (e.g., "Postgres", "postgres", "PostgreSQL", etc.).

### 2. Set Environment Variables Correctly

In your n8n service on Railway, go to Variables tab and add these **exact** variables:

```bash
# IMPORTANT: Replace 'Postgres' with your actual PostgreSQL service name
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{Postgres.RAILWAY_PRIVATE_DOMAIN}}
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}

# Also add these
PORT=${{PORT}}
N8N_PORT=${{PORT}}
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
```

### 3. Alternative: Use Direct Internal Domain

If the above doesn't work, try using the direct internal domain:

```bash
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres.railway.internal
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}
```

### 4. Check Variable Resolution

After setting variables, click on any variable with the `${{}}` syntax. Railway should show you:
- "Resolved from: Postgres" (or your service name)
- The actual value it resolves to

If it shows "Unresolved", then:
- Check the PostgreSQL service name spelling
- Make sure PostgreSQL is in the same project
- Ensure PostgreSQL is deployed and running

### 5. Verify PostgreSQL is Running

1. Go to your PostgreSQL service
2. Check the logs - it should show "database system is ready to accept connections"
3. Check the Variables tab - you should see PGHOST, PGUSER, etc.

### 6. Debug Environment Variables

Add this temporary variable to see what n8n is receiving:

```bash
DEBUG=n8n:*
```

Then check n8n logs for what database configuration it's trying to use.

## Still Not Working?

### Option 1: Use DATABASE_URL

PostgreSQL provides a complete connection string. Try using it directly:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Option 2: Create TCP Proxy (Last Resort)

1. Go to PostgreSQL service → Settings → Networking
2. Create a TCP Proxy
3. Use the public proxy URL instead of internal networking

### Option 3: Check Service Names

Run this in your local terminal to verify service names:
```bash
railway status
```

## Common Mistakes

1. **Wrong Service Name**: The namespace in `${{Postgres.VARIABLE}}` must match your PostgreSQL service name exactly
2. **Missing Variables**: Both `PORT` and `N8N_PORT` must be set
3. **Not in Same Project**: PostgreSQL and n8n must be in the same Railway project
4. **Deployment Order**: PostgreSQL should be deployed before n8n

## Example Working Configuration

Here's what a working configuration looks like in Railway:

```bash
# If your PostgreSQL service is named "Postgres"
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{Postgres.RAILWAY_PRIVATE_DOMAIN}}
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}

# Required for Railway
PORT=${{PORT}}
N8N_PORT=${{PORT}}

# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-password-here

# Other settings
NODE_FUNCTION_ALLOW_EXTERNAL=*
N8N_ENCRYPTION_KEY=your-32-char-key-here
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
```

## Need More Help?

1. Check Railway's system status: https://status.railway.com
2. Join Railway's Discord for community support
3. Review n8n's documentation on environment variables 
