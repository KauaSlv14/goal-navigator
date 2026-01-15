import { FastifyInstance } from 'fastify';
import { processDueRecurrences } from '../services/recurringService';

export const recurringRoutes = async (app: FastifyInstance) => {
  app.post('/run', async () => {
    const processed = await processDueRecurrences();
    return { processed };
  });
};
