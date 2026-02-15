import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { env } from '../env.js';

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
    return { token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } };
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

    // Suporte a usuários legados (sem hash bcrypt): no primeiro login, gera hash com a senha informada
    if (!user.passwordHash.startsWith('$2')) {
      const newHash = await bcrypt.hash(parsed.data.password, 10);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      const token = tokenForUser(updated);
      return { token, user: { id: updated.id, email: updated.email, name: updated.name, avatarUrl: updated.avatarUrl } };
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: 'Credenciais inválidas' });
    }

    const token = tokenForUser(user);
    return { token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } };
  });

  // Update profile (name, avatar)
  app.put('/profile', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ error: 'Não autorizado' });
    }
    const [, token] = authHeader.split(' ');
    let payload: { sub: string };
    try {
      payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    } catch {
      return reply.code(401).send({ error: 'Token inválido' });
    }

    const parts = request.parts();

    let name: string | undefined;
    let avatarUrl: string | null | undefined;

    try {
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'avatar') {
          try {
            // Read file into buffer
            const chunks: Buffer[] = [];
            for await (const chunk of part.file) {
              chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            // Max 5MB for avatar
            if (buffer.length > 5 * 1024 * 1024) {
              return reply.code(400).send({ error: 'Imagem muito grande. Máximo 5MB' });
            }

            // Convert to base64 with media type
            const base64 = buffer.toString('base64');
            const mimeType = part.mimetype || 'image/jpeg';
            avatarUrl = `data:${mimeType};base64,${base64}`;
          } catch (fileErr) {
            app.log.error(fileErr, 'Erro ao processar avatar');
            return reply.code(500).send({ error: 'Erro ao fazer upload da imagem', details: (fileErr as any)?.message });
          }
        } else if (part.type === 'field') {
          if (part.fieldname === 'name') {
            name = part.value as string;
          } else if (part.fieldname === 'removeAvatar' && part.value === 'true') {
            avatarUrl = null;
          }
        }
      }

      const updated = await prisma.user.update({
        where: { id: payload.sub },
        data: {
          ...(name && { name }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
      });

      return { user: { id: updated.id, email: updated.email, name: updated.name, avatarUrl: updated.avatarUrl } };
    } catch (err: any) {
      app.log.error(err, 'Erro ao atualizar perfil');
      return reply.code(500).send({ error: 'Erro ao atualizar perfil', message: err?.message });
    }
  });
};
