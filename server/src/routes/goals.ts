import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  addRecurringPaymentToGoal,
  addTransactionToGoal,
  createGoal,
  getGoalById,
  getGoalsWithProgress,
  getNextRunDate,
  deleteGoal,
} from '../services/goalService';
import { processDueRecurrences } from '../services/recurringService';

export const goalsRoutes = async (app: FastifyInstance) => {
  app.get('/', async () => {
    const goals = await getGoalsWithProgress();
    return goals;
  });

  app.post('/', async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1),
      targetAmount: z.number().positive(),
      initialCash: z.number().min(0),
      initialPix: z.number().min(0),
      imageUrl: z.string().url().optional().or(z.literal('')),
      productLink: z.string().url().optional().or(z.literal('')),
      targetDate: z.string().optional(),
      safetyMargin: z.number().min(0).max(100).optional(),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const goal = await createGoal(parsed.data);
    return goal;
  });

  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const goal = await getGoalById(id);
    if (!goal) return reply.code(404).send({ error: 'Meta não encontrada' });
    return goal;
  });

  app.post('/:id/transactions', async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const schema = z.object({
      amount: z.number().positive(),
      type: z.enum(['cash', 'pix']),
      category: z.enum(['entrada', 'saida']),
      description: z.string().optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const tx = await addTransactionToGoal(params.id, parsed.data);
    if (!tx) return reply.code(404).send({ error: 'Meta não encontrada' });
    return tx;
  });

  app.post('/:id/recurring', async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const schema = z.object({
      name: z.string().min(1),
      amount: z.number().positive(),
      type: z.enum(['cash', 'pix']),
      category: z.enum(['entrada', 'saida']),
      frequency: z.enum(['diario', 'semanal', 'mensal', 'anual']),
      dayOfMonth: z.number().min(1).max(31).optional(),
      dayOfWeek: z.number().min(0).max(6).optional(),
      startsAt: z.string().optional(),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const rec = await addRecurringPaymentToGoal(params.id, parsed.data);
    if (!rec) return reply.code(404).send({ error: 'Meta não encontrada' });
    return rec;
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const deleted = await deleteGoal(id);
    if (!deleted) return reply.code(404).send({ error: 'Meta não encontrada' });
    return { ok: true };
  });

  app.post('/run-recurring', async () => {
    const processed = await processDueRecurrences();
    return { processed };
  });

  // Helper to preview next run date
  app.post('/preview-next-run', async (request, reply) => {
    const schema = z.object({
      frequency: z.enum(['diario', 'semanal', 'mensal', 'anual']),
      dayOfMonth: z.number().min(1).max(31).optional(),
      dayOfWeek: z.number().min(0).max(6).optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    return { nextRunAt: getNextRunDate(parsed.data) };
  });
};
