import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { API_PREFIX } from './config/api.js';
import { logger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import v1Routes from './routes/v1/index.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Render (and other reverse proxies) set X-Forwarded-For. Required by express-rate-limit.
app.set('trust proxy', 1);

// 1. Security Middleware
app.use(helmet());

// 2. CORS Middleware
const defaultAllowedOrigins = [
  'https://djempireproductions.com',
  'https://www.djempireproductions.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const envOrigins = (env.CORS_ORIGIN || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const normalizeOrigin = (val) => (val || '').trim().replace(/\/+$/, '').toLowerCase();

const allowedOriginsSet = new Set(
  [...defaultAllowedOrigins, ...envOrigins].map(normalizeOrigin)
);

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (mobile apps, curl, server-to-server, Render health checks)
  if (!origin) return true;

  const cleanOrigin = normalizeOrigin(origin);

  if (allowedOriginsSet.has('*') || allowedOriginsSet.has(cleanOrigin)) {
    return true;
  }

  // Allow main domain and any subdomains for djempireproductions.com
  try {
    const parsed = new URL(cleanOrigin);
    if (
      parsed.hostname === 'djempireproductions.com' ||
      parsed.hostname.endsWith('.djempireproductions.com')
    ) {
      return true;
    }
  } catch {
    // Ignore URL parse error
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      logger.warn(`CORS: Origin ${origin} not allowed`);
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Disposition'],
  })
);

// 3. Compression Middleware
app.use(compression());

// 4. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Morgan Request Logging Middleware stream to Winston
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 6. Favicon Handler (Prevents browser 404 logs)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 7. Swagger API Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// 7. Root health-check route (Render pings HEAD / to verify the service is up)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: env.APP_NAME,
    version: env.API_VERSION,
    docs: `${env.API_PUBLIC_URL || ''}/api-docs`,
  });
});
// Render also uses HEAD / — respond with 200 and no body
app.head('/', (req, res) => res.status(200).end());

// 8. API Routes
app.use(API_PREFIX, v1Routes);

// 8. 404 Not Found Handler
app.use(notFoundHandler);

// 9. Global Error Handler
app.use(errorHandler);

export default app;
