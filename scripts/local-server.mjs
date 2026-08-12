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
