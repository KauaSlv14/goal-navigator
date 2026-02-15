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
  deleteRecurringPayment,
} from '../services/goalService.js';
import { processDueRecurrences } from '../services/recurringService.js';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

const getUserFromAuth = (authorization?: string) => {
  if (!authorization) return null;
  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; email: string; name?: string };
    return payload;
  } catch {
    return null;
  }
};

export const goalsRoutes = async (app: FastifyInstance) => {
  app.get('/', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }

    try {
      const goals = await getGoalsWithProgress(user.email, user.name);
      return goals;
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
  });

  app.post('/', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }

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

    try {
      const goal = await createGoal({ ...parsed.data, userEmail: user.email, userName: user.name });
      return goal;
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
  });

  app.get('/:id', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }
    const params = z.object({ id: z.string().min(1) }).parse(request.params);

    try {
      const goal = await getGoalById(params.id, user.email, user.name);
      if (!goal) return reply.code(404).send({ error: 'Meta não encontrada' });
      return goal;
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
  });

  app.post('/:id/transactions', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }
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

    try {
      const tx = await addTransactionToGoal(params.id, user.email, parsed.data, user.name);
      if (!tx) return reply.code(404).send({ error: 'Meta não encontrada' });
      return tx;
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
  });

  app.post('/:id/recurring', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }
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

    try {
      const rec = await addRecurringPaymentToGoal(params.id, { ...parsed.data, userEmail: user.email, userName: user.name });
      if (!rec) return reply.code(404).send({ error: 'Meta não encontrada' });
      return rec;
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
  });

  app.delete('/:id/recurring/:recurringId', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }
    const params = z.object({ id: z.string().min(1), recurringId: z.string().min(1) }).parse(request.params);

    try {
      const deleted = await deleteRecurringPayment(params.id, params.recurringId, user.email, user.name);
      if (!deleted) return reply.code(404).send({ error: 'Recorrência não encontrada' });
      return { ok: true };
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
  });

  app.delete('/:id', async (request, reply) => {
    const user = getUserFromAuth(request.headers.authorization);
    if (!user?.email) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);

    try {
      const deleted = await deleteGoal(id, user.email, user.name);
      if (!deleted) return reply.code(404).send({ error: 'Meta não encontrada' });
      return { ok: true };
    } catch (err: any) {
      if (err?.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ error: 'Usuário não encontrado' });
      }
      throw err;
    }
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
