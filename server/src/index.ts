import Fastify from 'fastify';
import cors from '@fastify/cors';
import { goalsRoutes } from './routes/goals';
import { recurringRoutes } from './routes/recurring';
import { authRoutes } from './routes/auth';
import { env } from './env';
import { registerRecurrenceJob } from './jobs/recurrenceJob';

const buildServer = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: env.corsOrigin === '*' ? true : env.corsOrigin,
  });

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(goalsRoutes, { prefix: '/api/goals' });
  app.register(recurringRoutes, { prefix: '/api/recurring' });

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
