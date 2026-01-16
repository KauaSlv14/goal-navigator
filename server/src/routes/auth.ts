import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { env } from '../env';

const tokenForUser = (user: { id: string; email: string; name: string }) =>
  jwt.sign({ sub: user.id, email: user.email, name: user.name }, env.jwtSecret, { expiresIn: '7d' });

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(6),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      return reply.code(400).send({ error: 'E-mail já registrado' });
    }

    const hash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash: hash,
      },
    });

    const token = tokenForUser(user);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post('/login', async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return reply.code(401).send({ error: 'Credenciais inválidas' });
    }

    if (!user.passwordHash.startsWith('$2')) {
      return reply.code(401).send({ error: 'Credenciais inválidas' });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: 'Credenciais inválidas' });
    }

    const token = tokenForUser(user);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });
};
