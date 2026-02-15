import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import cors from '@fastify/cors';
import { goalsRoutes } from './routes/goals.js';
import { recurringRoutes } from './routes/recurring.js';
import { authRoutes } from './routes/auth.js';
import { friendsRoutes } from './routes/friends.js';
import { env } from './env.js';
import { registerRecurrenceJob } from './jobs/recurrenceJob.js';
import { prisma } from './db.js';

const buildServer = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: env.corsOrigin === '*' ? true : env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.register(multipart);
  app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'server', 'uploads'),
    prefix: '/uploads/',
  });

  // Health check endpoint
  app.get('/api/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', message: 'Servidor e banco de dados estão online' };
    } catch (error) {
      return { status: 'error', message: 'Banco de dados indisponível', error: (error as any).message };
    }
  });

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(goalsRoutes, { prefix: '/api/goals' });
  app.register(recurringRoutes, { prefix: '/api/recurring' });
  app.register(friendsRoutes, { prefix: '/api/friends' });


  registerRecurrenceJob(app);

  return app;
};

const start = async () => {
  const app = buildServer();
  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    app.log.info(`API rodando na porta ${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}

export { buildServer };
