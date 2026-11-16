import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';

export async function notificationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar notificações do usuário logado
  app.get('/', async (request, reply) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: request.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: request.user!.id, isRead: false }
    });

    return reply.send({ notifications, unreadCount });
  });

  // Marcar como lida
  app.patch('/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return reply.send(updated);
  });

  // Marcar todas como lidas
  app.post('/mark-all-read', async (request, reply) => {
    await prisma.notification.updateMany({
      where: { userId: request.user!.id, isRead: false },
      data: { isRead: true }
    });

    return reply.send({ success: true });
  });
}
