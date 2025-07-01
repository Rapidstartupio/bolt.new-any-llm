/**
 * Database configuration for PostgreSQL connection
 * Uses environment variables for Cloudflare Pages deployment
 */

export interface DatabaseConfig {
  connectionString: string;
  n8nApiUrl: string;
  n8nApiKey: string;
}

/**
 * Get database configuration from environment variables
 * These should be set in Cloudflare Pages dashboard
 */
export function getDatabaseConfig(env?: Record<string, string | undefined>): DatabaseConfig | null {
  // In Cloudflare Workers/Pages, env vars are passed differently
  const envVars = env || (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {});

  // Try different possible env var names
  const connectionString = envVars.DB_POSTGRESDB_CONNECTION_STRING || envVars.DATABASE_URL || '';

  const n8nApiUrl = envVars.N8N_API_URL || envVars.N8N_WEBHOOK_URL || '';

  const n8nApiKey = envVars.N8N_API_KEY || '';

  if (!connectionString) {
    console.warn('No database connection string found in environment variables');
    return null;
  }

  return {
    connectionString,
    n8nApiUrl,
    n8nApiKey,
  };
}

/**
 * Parse PostgreSQL connection string into components
 */
export function parseConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1),
      user: url.username,
      password: decodeURIComponent(url.password),
      ssl: url.searchParams.get('sslmode') !== 'disable',
    };
  } catch (error) {
    console.error('Failed to parse connection string:', error);
    return null;
  }
}
