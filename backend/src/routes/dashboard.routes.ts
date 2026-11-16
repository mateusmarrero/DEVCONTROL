import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { ProjectStatus, TaskStatus, VulnerabilityStatus } from '@prisma/client';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/metrics', async (request, reply) => {
    const now = new Date();

    const [
      totalProjects,
      inProgressProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      overdueTasks,
      openVulnerabilities,
      criticalVulnerabilities,
      recentActivities
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: ProjectStatus.IN_PROGRESS } }),
      prisma.project.count({ where: { status: { in: [ProjectStatus.PUBLISHED, ProjectStatus.ARCHIVED] } } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW] } } }),
      prisma.task.count({
        where: {
          status: { not: TaskStatus.DONE },
          deadline: { lt: now }
        }
      }),
      prisma.vulnerability.count({ where: { status: { in: [VulnerabilityStatus.OPEN, VulnerabilityStatus.IN_PROGRESS] } } }),
      prisma.vulnerability.count({
        where: {
          severity: 'CRITICAL',
          status: { not: VulnerabilityStatus.MITIGATED }
        }
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatar: true } },
          project: { select: { name: true } }
        }
      })
    ]);

    // Distribuição de tarefas por prioridade
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: { id: true }
    });

    // Distribuição de tarefas por status
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Projetos ativos com progresso
    const activeProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        domain: true,
        progress: true,
        status: true,
        priority: true,
        uptimeCheck: {
          select: { status: true, responseTimeMs: true, sslDaysRemaining: true }
        }
      }
    });

    return reply.send({
      kpis: {
        totalProjects,
        inProgressProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
        overdueTasks,
        openVulnerabilities,
        criticalVulnerabilities
      },
      tasksByPriority: tasksByPriority.map(t => ({ priority: t.priority, count: t._count.id })),
      tasksByStatus: tasksByStatus.map(t => ({ status: t.status, count: t._count.id })),
      activeProjects,
      recentActivities
    });
  });
}
