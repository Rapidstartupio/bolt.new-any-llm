import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { toast } from 'react-toastify';

export default function TestConnection() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnections = async () => {
    setLoading(true);

        try {
      const response = await fetch('/api/db-test');
      const data = await response.json() as any;
      setResults(data);

      if (data.success) {
        toast.success('Connection test completed successfully!');
      } else {
        toast.error('Some connections failed. Check the results below.');
      }
    } catch (error) {
      toast.error('Failed to test connections');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-bolt-elements-textPrimary">Test Database & n8n Connections</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-bolt-elements-textSecondary">
            Click the button below to test your database and n8n connections.
          </p>
          <Button onClick={testConnections} disabled={loading}>
            {loading ? 'Testing...' : 'Test Connections'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>PostgreSQL Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span className={results.database.connected ? 'text-green-600' : 'text-red-600'}>
                    {results.database.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {results.database.error && (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold">Error:</span>
                    <span className="text-red-600">{results.database.error}</span>
                  </div>
                )}
                {results.database.host && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Host:</span>
                      <span>{results.database.host}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Database:</span>
                      <span>{results.database.database}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Port:</span>
                      <span>{results.database.port}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">SSL:</span>
                      <span>{results.database.ssl ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>n8n Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span className={results.n8n.connected ? 'text-green-600' : 'text-red-600'}>
                    {results.n8n.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {results.n8n.error && (
                  <div className="flex items-start gap-2">
                    <span className="font-semibold">Error:</span>
                    <span className="text-red-600">{results.n8n.error}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">API URL:</span>
                  <span>{results.n8n.apiUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">API Key:</span>
                  <span>{results.n8n.apiKey}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Important: PostgreSQL in Cloudflare Workers
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Cloudflare Workers cannot directly connect to PostgreSQL databases. You need to use one of:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          <li>Neon serverless driver (@neondatabase/serverless)</li>
          <li>Supabase REST API</li>
          <li>A PostgreSQL HTTP proxy service</li>
          <li>D1 (Cloudflare's SQLite database)</li>
        </ul>
      </div>
    </div>
  );
}
