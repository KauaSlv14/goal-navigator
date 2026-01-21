import Fastify from 'fastify';
// Restart trigger
import cors from '@fastify/cors';
import { goalsRoutes } from './routes/goals.js';
import { recurringRoutes } from './routes/recurring.js';
import { authRoutes } from './routes/auth.js';
import { friendsRoutes } from './routes/friends.js';
import { env } from './env.js';
import { registerRecurrenceJob } from './jobs/recurrenceJob.js';

const buildServer = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: env.corsOrigin === '*' ? true : env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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

start();

export type AppInstance = ReturnType<typeof buildServer>;
