import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Role, PhaseStatus } from '@prisma/client';
import { PHASES_17_CATALOG } from '../../prisma/seed.js';

export async function checklistRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Obter as 17 fases de um projeto
  app.get('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const phases = await prisma.checklistPhase.findMany({
      where: { projectId },
      include: {
        checklistTasks: { orderBy: { order: 'asc' } },
        tasks: {
          select: { id: true, title: true, status: true, priority: true }
        }
      },
      orderBy: { phaseNumber: 'asc' }
    });

    return reply.send(phases);
  });

  // Atualizar tarefa do checklist (marcar como concluída, anexar evidência)
  app.put('/tasks/:taskId', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    const { isCompleted, evidenceUrl, evidenceNotes } = request.body as {
      isCompleted?: boolean;
      evidenceUrl?: string;
      evidenceNotes?: string;
    };

    const task = await prisma.checklistTask.findUnique({
      where: { id: taskId },
      include: { phase: true }
    });

    if (!task) return reply.status(404).send({ error: 'Item do checklist não encontrado' });

    const updated = await prisma.checklistTask.update({
      where: { id: taskId },
      data: {
        ...(isCompleted !== undefined && {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          completedById: isCompleted ? request.user!.id : null
        }),
        ...(evidenceUrl !== undefined && { evidenceUrl }),
        ...(evidenceNotes !== undefined && { evidenceNotes })
      }
    });

    // Checar se todas as tarefas da fase foram concluídas
    const totalPhaseTasks = await prisma.checklistTask.count({ where: { phaseId: task.phaseId } });
    const completedPhaseTasks = await prisma.checklistTask.count({ where: { phaseId: task.phaseId, isCompleted: true } });

    if (totalPhaseTasks > 0 && totalPhaseTasks === completedPhaseTasks) {
      await prisma.checklistPhase.update({
        where: { id: task.phaseId },
        data: { status: PhaseStatus.COMPLETED, completedAt: new Date() }
      });
    } else if (completedPhaseTasks > 0) {
      await prisma.checklistPhase.update({
        where: { id: task.phaseId },
        data: { status: PhaseStatus.IN_PROGRESS }
      });
    }

    return reply.send(updated);
  });

  // Homologar Fase (Apenas ADMIN ou MANAGER)
  app.post('/phases/:phaseId/approve', { preHandler: [authorizeRoles([Role.ADMIN, Role.MANAGER])] }, async (request, reply) => {
    const { phaseId } = request.params as { phaseId: string };
    const { approvalNotes } = request.body as { approvalNotes?: string };

    const phase = await prisma.checklistPhase.update({
      where: { id: phaseId },
      data: {
        status: PhaseStatus.COMPLETED,
        approvedById: request.user!.id,
        approvalNotes: approvalNotes || 'Fase aprovada pelo gestor.',
        completedAt: new Date()
      }
    });

    await logActivity({
      userId: request.user!.id,
      projectId: phase.projectId,
      action: 'PHASE_APPROVED',
      entityType: 'ChecklistPhase',
      entityId: phase.id,
      details: { phaseNumber: phase.phaseNumber, name: phase.name },
      ipAddress: request.ip
    });

    return reply.send(phase);
  });

  // Listar Templates Reutilizáveis
  app.get('/templates', async () => {
    return prisma.checklistTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  });

  // Criar Novo Template a partir de projeto ou customizado
  app.post('/templates', { preHandler: [authorizeRoles([Role.ADMIN, Role.MANAGER])] }, async (request, reply) => {
    const { name, description, phases } = request.body as {
      name: string;
      description?: string;
      phases?: any;
    };

    const template = await prisma.checklistTemplate.create({
      data: {
        name,
        description: description || null,
        phasesJson: JSON.stringify(phases || PHASES_17_CATALOG)
      }
    });

    return reply.status(201).send(template);
  });
}
