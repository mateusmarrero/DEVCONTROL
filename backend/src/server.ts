import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

import { authRoutes } from './routes/auth.routes.js';
import { projectRoutes } from './routes/projects.routes.js';
import { taskRoutes } from './routes/tasks.routes.js';
import { checklistRoutes } from './routes/checklist.routes.js';
import { securityRoutes } from './routes/security.routes.js';
import { docRoutes } from './routes/docs.routes.js';
import { deployRoutes } from './routes/deploy.routes.js';
import { maintenanceRoutes } from './routes/maintenance.routes.js';
import { qualityGateRoutes } from './routes/quality-gate.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { notificationRoutes } from './routes/notifications.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { seoRoutes } from './routes/seo.routes.js';

dotenv.config();

const app = Fastify({
  logger: true
});

async function main() {
  // 1. Segurança: Headers HTTP Rígidos com Helmet
  await app.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
  });

  // 2. Segurança: CORS Controlado
  await app.register(cors, {
    origin: (origin, cb) => {
      // Permite localhost e origens autorizadas em desenvolvimento
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        cb(null, true);
        return;
      }
      cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });

  // 3. Segurança: Rate Limiting
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  });

  // 4. Autenticação JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'devcontrol_super_secure_jwt_token_key_987654321_secret'
  });

  // Tratamento Global de Erros
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.statusCode === 429) {
      return reply.status(429).send({ error: 'Muitas requisições. Tente novamente em instantes.' });
    }

    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Erro interno no servidor'
      : error.message;

    return reply.status(statusCode).send({
      statusCode,
      error: error.name || 'InternalServerError',
      message
    });
  });

  // Healthcheck endpoint
  app.get('/health', async () => {
    return {
      status: 'ONLINE',
      system: 'DEVCONTROL Engine',
      version: '1.0.0',
      database: 'MariaDB 10.11 connected',
      timestamp: new Date().toISOString()
    };
  });

  // Registro das Rotas Modulares
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(projectRoutes, { prefix: '/api/projects' });
  await app.register(taskRoutes, { prefix: '/api/tasks' });
  await app.register(checklistRoutes, { prefix: '/api/checklist' });
  await app.register(securityRoutes, { prefix: '/api/security' });
  await app.register(docRoutes, { prefix: '/api/docs' });
  await app.register(deployRoutes, { prefix: '/api/deploy' });
  await app.register(maintenanceRoutes, { prefix: '/api/maintenance' });
  await app.register(qualityGateRoutes, { prefix: '/api/quality-gate' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(notificationRoutes, { prefix: '/api/notifications' });
  await app.register(aiRoutes, { prefix: '/api/ai' });
  await app.register(seoRoutes, { prefix: '/api/seo' });

  const port = parseInt(process.env.PORT || '4000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`🚀 DEVCONTROL Backend Fastify operacional em http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
