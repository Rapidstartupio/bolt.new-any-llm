import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getDatabaseConfig } from '~/lib/db/config';

interface TestResults {
  success: boolean;
  database: {
    connected: boolean;
    error: string | null;
    connectionString?: string;
    host?: string;
    port?: string;
    database?: string;
    ssl?: boolean;
  };
  n8n: {
    connected: boolean;
    error: string | null;
    apiUrl: string;
    apiKey: string;
  };
}

/**
 * API endpoint to test database and n8n connections
 * GET /api/db-test - Test connections and return status
 */
export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env as unknown as Record<string, string | undefined>;
  const config = getDatabaseConfig(env);

  if (!config) {
    return json(
      {
        success: false,
        database: {
          connected: false,
          error: 'No database connection string configured',
        },
        n8n: {
          connected: false,
          error: 'No n8n configuration found',
        },
      },
      { status: 500 },
    );
  }

  const results: TestResults = {
    success: true,
    database: {
      connected: false,
      error: null,
      connectionString: config.connectionString ? '***configured***' : 'not configured',
    },
    n8n: {
      connected: false,
      error: null,
      apiUrl: config.n8nApiUrl || 'not configured',
      apiKey: config.n8nApiKey ? '***configured***' : 'not configured',
    },
  };

  /*
   * Test PostgreSQL connection using HTTP-based approach
   * Since we're on Cloudflare Workers, we can't use traditional PostgreSQL drivers
   * We'll need to use a service like Neon or Supabase that provides HTTP API
   * For now, we'll just check if the connection string is valid
   */
  try {
    const url = new URL(config.connectionString);
    results.database.connected = true;
    results.database.host = url.hostname;
    results.database.port = url.port || '5432';
    results.database.database = url.pathname.slice(1);
    results.database.ssl = url.searchParams.get('sslmode') !== 'disable';
  } catch {
    results.database.error = 'Invalid connection string format';
    results.success = false;
  }

  // Test n8n connection
  if (config.n8nApiUrl && config.n8nApiKey) {
    try {
      // Test n8n webhook endpoint
      const testUrl = new URL('/webhook-test/bolt-connection-test', config.n8nApiUrl).toString();

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': config.n8nApiKey,
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'bolt-db-test',
        }),
      });

      results.n8n.connected = response.ok;

      if (!response.ok) {
        results.n8n.error = `n8n returned status ${response.status}`;

        // If 404, the webhook might not be set up yet
        if (response.status === 404) {
          results.n8n.error = 'n8n webhook not found. Create a webhook workflow at /webhook-test/bolt-connection-test';
        }
      }
    } catch (error) {
      results.n8n.error = error instanceof Error ? error.message : 'Failed to connect to n8n';
      results.success = false;
    }
  } else {
    results.n8n.error = 'n8n configuration missing';
    results.success = false;
  }

  return json(results);
}

/**
 * POST endpoint to test writing to database
 */
export async function action({ context }: ActionFunctionArgs) {
  const env = context.cloudflare?.env as unknown as Record<string, string | undefined>;
  const config = getDatabaseConfig(env);

  if (!config) {
    return json(
      {
        success: false,
        error: 'Database not configured',
      },
      { status: 500 },
    );
  }

  /*
   * For Cloudflare Workers, we need an HTTP-based PostgreSQL solution
   * Options:
   * 1. Use Neon serverless driver: @neondatabase/serverless
   * 2. Use Supabase REST API
   * 3. Use a proxy service that converts HTTP to PostgreSQL protocol
   */

  // For now, return a message about what needs to be done
  return json({
    success: false,
    error: 'PostgreSQL direct connection not available in Cloudflare Workers',
    solution: 'Use one of: Neon serverless, Supabase REST API, or PostgreSQL HTTP proxy',
    connectionString: config.connectionString ? 'configured' : 'not configured',
  });
}
