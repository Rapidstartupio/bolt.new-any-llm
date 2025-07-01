# n8n Workflows for Bolt Integration

This document describes the n8n workflows needed to integrate with Bolt.

## Required Workflows

### 1. Connection Test Webhook

**Path**: `/webhook-test/bolt-connection-test`

This webhook is used by Bolt to test the n8n connection.

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "bolt-connection-test",
        "responseMode": "onReceived",
        "responseData": "{ \"status\": \"ok\", \"message\": \"n8n connection successful\" }",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    }
  ]
}
```

### 2. Chat Analysis Workflow

Analyzes chat messages and extracts insights.

**Path**: `/webhook/analyze-chat`

Steps:
1. Receive chat data via webhook
2. Extract key topics using AI
3. Store analysis in PostgreSQL
4. Return insights to Bolt

### 3. User Activity Logger

Logs user activities for analytics.

**Path**: `/webhook/log-activity`

Features:
- Records user actions
- Timestamps activities
- Stores in PostgreSQL
- Generates daily summaries

### 4. AI Enhancement Pipeline

Enhances Bolt's AI responses with additional context.

**Path**: `/webhook/enhance-response`

Process:
1. Receive AI response from Bolt
2. Query knowledge base
3. Add relevant context
4. Return enhanced response

### 5. Scheduled Tasks

Daily maintenance and reporting tasks.

- **Database Cleanup**: Remove old chat snapshots
- **Usage Reports**: Generate user activity reports
- **Backup**: Backup critical data

## Authentication

All webhooks should include API key validation:

```javascript
// In n8n Function node
const apiKey = $input.first().headers['x-n8n-api-key'];
const validKey = $env.N8N_API_KEY;

if (apiKey !== validKey) {
  throw new Error('Invalid API key');
}
```

## PostgreSQL Integration

### Tables Used by n8n

```sql
-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat analysis
CREATE TABLE chat_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID,
  topics TEXT[],
  sentiment VARCHAR(50),
  insights JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(255),
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Example Webhook Payloads

### Chat Analysis Request

```json
{
  "chatId": "123e4567-e89b-12d3-a456-426614174000",
  "messages": [
    {
      "role": "user",
      "content": "How do I deploy to Vercel?"
    },
    {
      "role": "assistant",
      "content": "To deploy to Vercel..."
    }
  ],
  "metadata": {
    "userId": "user123",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Activity Log Request

```json
{
  "userId": "user123",
  "action": "chat_created",
  "metadata": {
    "chatId": "123e4567-e89b-12d3-a456-426614174000",
    "messageCount": 5,
    "duration": 300
  }
}
```

## Error Handling

All workflows should include error handling:

1. **Try-Catch blocks** in Function nodes
2. **Error workflows** for failed executions
3. **Logging** of errors to PostgreSQL
4. **Notifications** for critical failures

## Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
// In n8n Function node
const userId = $input.first().json.userId;
const key = `rate_limit:${userId}`;
const limit = 100; // requests per hour

// Check rate limit (implement with Redis or in-memory cache)
```

## Monitoring

Set up monitoring for:

- Webhook response times
- Error rates
- Database query performance
- API usage by user

## Development Tips

1. **Test locally**: Use n8n's built-in testing features
2. **Version control**: Export workflows as JSON and commit to git
3. **Documentation**: Document each workflow's purpose and dependencies
4. **Backup**: Regularly export all workflows

## Deployment

1. Import workflows to production n8n instance
2. Set environment variables
3. Test all webhooks from Bolt
4. Monitor logs for errors
5. Set up alerts for failures 
