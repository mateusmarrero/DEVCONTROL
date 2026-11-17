import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Role } from '@prisma/client';
import { sendInviteEmail } from '../services/mail.service.js';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

const inviteRegisterSchema = z.object({
  code: z.string().min(4, 'Código de convite obrigatório'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

const createInviteSchema = z.object({
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).default(Role.DEVELOPER),
  expiresInDays: z.number().default(7)
});

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors[0].message });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'Credenciais inválidas ou conta desativada' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const token = app.jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      { expiresIn: '7d' }
    );

    await logActivity({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: request.ip
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  });

  // Obter usuário atual (Me)
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    return reply.send(user);
  });

  // Criar convite (Apenas ADMIN)
  app.post('/invites', { preHandler: [authenticate, authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const parseResult = createInviteSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors[0].message });
    }

    const { email, role, expiresInDays } = parseResult.data;

    // Gerar código único aleatório
    const code = 'DEV-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const invite = await prisma.inviteToken.create({
      data: {
        code,
        email: email || null,
        role,
        expiresAt,
        createdById: request.user!.id
      }
    });

    await logActivity({
      userId: request.user!.id,
      action: 'INVITE_CREATED',
      entityType: 'InviteToken',
      entityId: invite.id,
      details: { code, role, email },
      ipAddress: request.ip
    });

    if (email) {
      const adminUser = await prisma.user.findUnique({ where: { id: request.user!.id } });
      await sendInviteEmail({
        to: email,
        code,
        role,
        invitedByName: adminUser?.name || 'Administrador Master'
      });
    }

    return reply.status(201).send(invite);
  });

  // Listar convites ativos (Apenas ADMIN)
  app.get('/invites', { preHandler: [authenticate, authorizeRoles([Role.ADMIN])] }, async () => {
    return prisma.inviteToken.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true, email: true } } }
    });
  });

  // Registro via Convite
  app.post('/register-invite', async (request, reply) => {
    const parseResult = inviteRegisterSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors[0].message });
    }

    const { code, name, email, password } = parseResult.data;

    const invite = await prisma.inviteToken.findUnique({ where: { code } });
    if (!invite || invite.isUsed || new Date() > invite.expiresAt) {
      return reply.status(400).send({ error: 'Convite inválido ou expirado' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(400).send({ error: 'Já existe um usuário cadastrado com este e-mail' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: invite.role
        }
      });

      await tx.inviteToken.update({
        where: { id: invite.id },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      });

      return user;
    });

    const token = app.jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      { expiresIn: '7d' }
    );

    return reply.status(201).send({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  });

  // Listar usuários do time
  app.get('/users', { preHandler: [authenticate] }, async (request, reply) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return reply.send(users);
  });
}
