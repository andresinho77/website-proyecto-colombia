// Default local development environment variables targeting LocalStack
process.env.AWS_ENDPOINT_URL = process.env.AWS_ENDPOINT_URL || 'http://localhost:4566';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test';
process.env.DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'proyecto-colombia-local-listings';
process.env.MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'proyecto-colombia-local-media-storage';
process.env.USE_LOCALSTACK = 'true';

import { createServer } from 'http';
import { handler } from '../../infra-proyecto-colombia/lambda/listings/index.mjs';

const PORT = process.env.PORT || 4000;

const server = createServer(async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  
  req.on('end', async () => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Convert HTTP request to AWS Lambda event format
    const event = {
      requestContext: {
        http: {
          method: req.method,
          path: url.pathname,
        }
      },
      path: url.pathname,
      httpMethod: req.method,
      queryStringParameters: Object.fromEntries(url.searchParams),
      headers: req.headers,
      body: body || null,
    };

    try {
      const response = await handler(event);
      res.writeHead(response.statusCode || 200, response.headers || {});
      res.end(response.body || '');
    } catch (err) {
      console.error('Local Server Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Local Serverless API running at http://localhost:${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/listings\n`);
});
