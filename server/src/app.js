import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'express-async-errors';

import apiRoutes from './routes/index.js';
import { WebhookController } from './controllers/webhookController.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security & utility middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 2. Stripe Webhook route MUST receive raw Buffer BEFORE express.json() parses body
app.post(
  '/api/v1/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  WebhookController.handleStripeWebhook
);

// 3. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Health check & SEO endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const publicPath = path.resolve(__dirname, '../../client/public');
const clientDistPath = path.resolve(__dirname, '../../client/dist');

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const target = fs.existsSync(path.join(clientDistPath, 'sitemap.xml'))
    ? path.join(clientDistPath, 'sitemap.xml')
    : path.join(publicPath, 'sitemap.xml');
  res.sendFile(target);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const target = fs.existsSync(path.join(clientDistPath, 'robots.txt'))
    ? path.join(clientDistPath, 'robots.txt')
    : path.join(publicPath, 'robots.txt');
  res.sendFile(target);
});

// 5. API routes
app.use('/api/v1', apiRoutes);

// 6. Serve React frontend build if present
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.svg') || filePath.endsWith('.png') || filePath.endsWith('.woff2')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 7. 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// 8. Centralized Error Handler
app.use(errorHandler);

export default app;
