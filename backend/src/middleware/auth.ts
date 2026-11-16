import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token de autenticação não fornecido ou inválido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await request.jwtVerify<AuthUser>();
    request.user = decoded;

    // Verificar se o usuário ainda existe e está ativo no MariaDB
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, isActive: true }
    });

    if (!dbUser || !dbUser.isActive) {
      return reply.status(401).send({ error: 'Usuário inativo ou inexistente' });
    }

    request.user = dbUser;
  } catch (err) {
    return reply.status(401).send({ error: 'Sessão expirada ou token inválido' });
  }
}

export function authorizeRoles(allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ 
        error: 'Acesso negado: seu perfil não possui permissão para executar esta ação',
        requiredRoles: allowedRoles,
        currentRole: request.user.role
      });
    }
  };
}

export async function authorizeProjectAccess(request: FastifyRequest<{ Params: { projectId?: string; id?: string } }>, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Não autenticado' });
  }

  // Administrador tem acesso global irrestrito
  if (request.user.role === Role.ADMIN) {
    return;
  }

  const projectId = request.params.projectId || request.params.id;
  if (!projectId) return;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { isPrivate: true, createdById: true }
  });

  if (!project) {
    return reply.status(404).send({ error: 'Projeto não encontrado' });
  }

  if (project.isPrivate) {
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: request.user.id
        }
      }
    });

    if (!isMember && project.createdById !== request.user.id) {
      return reply.status(403).send({ error: 'Acesso negado: projeto privado restrito a membros autorizados' });
    }
  }
}
