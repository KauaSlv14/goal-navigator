import cron from 'node-cron';
import { FastifyInstance } from 'fastify';
import { processDueRecurrences } from '../services/recurringService';

export const registerRecurrenceJob = (app: FastifyInstance) => {
  // Run once on startup
  app.addHook('onReady', async () => {
    try {
      const processed = await processDueRecurrences();
      app.log.info({ processed }, 'Recorrências processadas na inicialização');
    } catch (err) {
      app.log.error({ err }, 'Falha ao processar recorrências na inicialização');
    }
  });

  // Schedule every minute
  cron.schedule('* * * * *', async () => {
    try {
      const processed = await processDueRecurrences();
      if (processed > 0) {
        app.log.info({ processed }, 'Recorrências processadas pelo cron');
      }
    } catch (err) {
      app.log.error({ err }, 'Falha ao processar recorrências pelo cron');
    }
  });
};
