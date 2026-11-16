import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';

export async function docRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar documentos de um projeto
  app.get('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const docs = await prisma.documentationDoc.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { name: true, avatar: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return reply.send(docs);
  });

  // Obter documento individual
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const doc = await prisma.documentationDoc.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true, email: true } } }
    });

    if (!doc) return reply.status(404).send({ error: 'Documento não encontrado' });
    return reply.send(doc);
  });

  // Criar Documento (Editor de Texto Interno)
  app.post('/', async (request, reply) => {
    const { projectId, title, content, category } = request.body as {
      projectId: string;
      title: string;
      content: string;
      category?: string;
    };

    if (!title || !projectId) {
      return reply.status(400).send({ error: 'Título e ID do projeto são obrigatórios' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const doc = await prisma.documentationDoc.create({
      data: {
        projectId,
        title,
        slug,
        content: content || '# ' + title,
        category: category || 'TECHNICAL',
        createdById: request.user!.id,
        version: 1
      }
    });

    await logActivity({
      userId: request.user!.id,
      projectId,
      action: 'DOC_CREATED',
      entityType: 'DocumentationDoc',
      entityId: doc.id,
      details: { title, category },
      ipAddress: request.ip
    });

    return reply.status(201).send(doc);
  });

  // Atualizar Documento (com versionamento automático)
  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, content, category } = request.body as {
      title?: string;
      content?: string;
      category?: string;
    };

    const doc = await prisma.documentationDoc.findUnique({ where: { id } });
    if (!doc) return reply.status(404).send({ error: 'Documento não encontrado' });

    const updated = await prisma.documentationDoc.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(category && { category }),
        version: { increment: 1 }
      }
    });

    await logActivity({
      userId: request.user!.id,
      projectId: doc.projectId,
      action: 'DOC_UPDATED',
      entityType: 'DocumentationDoc',
      entityId: id,
      details: { version: updated.version },
      ipAddress: request.ip
    });

    return reply.send(updated);
  });

  // Excluir documento
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.documentationDoc.delete({ where: { id } });
    return reply.send({ success: true });
  });
}
