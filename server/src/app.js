import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'express-async-errors';

import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security & utility middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow modern frontend asset bundling
}));
app.use(cors({
  origin: '*', // Allow frontend development
  credentials: true
}));
app.use(morgan('dev'));

// 2. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Health check & SEO endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Explicit SEO files handlers with correct MIME types
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

// 4. API routes
app.use('/api/v1', apiRoutes);

// 5. Serve React frontend build if present
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

// 6. 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// 7. Centralized Error Handler
app.use(errorHandler);

export default app;
