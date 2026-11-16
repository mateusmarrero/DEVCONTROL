import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Priority, TaskStatus } from '@prisma/client';

// Função utilitária para recalcular o progresso do projeto
// Fórmula oficial: número de tarefas concluídas dividido pelo número de tarefas aplicáveis.
export async function recalculateProjectProgress(projectId: string) {
  const totalTasks = await prisma.task.count({ where: { projectId } });
  if (totalTasks === 0) {
    await prisma.project.update({ where: { id: projectId }, data: { progress: 0 } });
    return 0;
  }

  const completedTasks = await prisma.task.count({
    where: { projectId, status: TaskStatus.DONE }
  });

  const progress = Math.round((completedTasks / totalTasks) * 100 * 10) / 10;
  await prisma.project.update({
    where: { id: projectId },
    data: { progress }
  });
  return progress;
}

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  phaseId: z.string().uuid().optional(),
  title: z.string().min(2, 'Título obrigatório'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  deadline: z.string().optional(),
  estimatedHours: z.number().optional(),
  assigneeId: z.string().uuid().optional()
});

export async function taskRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar tarefas de um projeto ou globais
  app.get('/', async (request, reply) => {
    const { projectId, status, priority, assigneeId, phaseId } = request.query as {
      projectId?: string;
      status?: TaskStatus;
      priority?: Priority;
      assigneeId?: string;
      phaseId?: string;
    };

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId && { assigneeId }),
        ...(phaseId && { phaseId })
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        phase: { select: { id: true, phaseNumber: true, name: true } },
        subtasks: true,
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        },
        dependencies: {
          include: { dependsOnTask: { select: { id: true, title: true, status: true } } }
        }
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    return reply.send(tasks);
  });

  // Criar tarefa individual
  app.post('/', async (request, reply) => {
    const parseResult = createTaskSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors[0].message });
    }

    const data = parseResult.data;
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        phaseId: data.phaseId || null,
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline ? new Date(data.deadline) : null,
        estimatedHours: data.estimatedHours || null,
        assigneeId: data.assigneeId || null,
        createdById: request.user!.id
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        phase: { select: { name: true } }
      }
    });

    await recalculateProjectProgress(data.projectId);

    await logActivity({
      userId: request.user!.id,
      projectId: data.projectId,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      details: { title: task.title, priority: task.priority },
      ipAddress: request.ip
    });

    return reply.status(201).send(task);
  });

  // Atualizar tarefa
  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: Priority;
      deadline: string;
      estimatedHours: number;
      actualHours: number;
      assigneeId: string | null;
      phaseId: string | null;
    }>;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: 'Tarefa não encontrada' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.deadline && { deadline: new Date(body.deadline) }),
        ...(body.estimatedHours !== undefined && { estimatedHours: body.estimatedHours }),
        ...(body.actualHours !== undefined && { actualHours: body.actualHours }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
        ...(body.phaseId !== undefined && { phaseId: body.phaseId })
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        subtasks: true
      }
    });

    if (body.status && body.status !== existing.status) {
      await recalculateProjectProgress(existing.projectId);
    }

    return reply.send(updated);
  });

  // Excluir tarefa
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return reply.status(404).send({ error: 'Tarefa não encontrada' });

    await prisma.task.delete({ where: { id } });
    await recalculateProjectProgress(task.projectId);

    return reply.send({ success: true });
  });

  // MÓDULO DE IMPORTAÇÃO ESTRUTURADA DE TAREFAS (COM SUPORTE NATIVO AO MODELO DEVCONTROL)
  app.post('/import', async (request, reply) => {
    const { projectId, type, data: rawData } = request.body as {
      projectId: string;
      type: 'JSON' | 'CSV' | 'TEXT';
      data: any;
    };

    if (!projectId || !rawData) {
      return reply.status(400).send({ error: 'projectId e data são obrigatórios' });
    }

    const tasksToInsert: Array<{
      title: string;
      description?: string;
      priority: Priority;
      deadline?: Date;
      estimatedHours?: number;
    }> = [];

    if (type === 'JSON') {
      const items = Array.isArray(rawData) ? rawData : (typeof rawData === 'string' ? JSON.parse(rawData) : [rawData]);
      for (const item of items) {
        if (item.title || item.taskTitle) {
          tasksToInsert.push({
            title: item.title || item.taskTitle,
            description: item.description,
            priority: item.priority in Priority ? item.priority : Priority.MEDIUM,
            deadline: item.deadline ? new Date(item.deadline) : undefined,
            estimatedHours: item.estimatedHours ? Number(item.estimatedHours) : 4
          });
        }
      }
    } else if (type === 'CSV') {
      const lines = (typeof rawData === 'string' ? rawData : '').split(/\r?\n/).filter(l => l.trim().length > 0);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Ignora headers comuns
        if (line.toLowerCase().includes('código') || line.toLowerCase().includes('finalidade') || line.toLowerCase().includes('status padrão')) continue;

        // Suporte a separador vírgula com aspas ou ponto e vírgula
        let cols: string[] = [];
        if (line.includes('","') || line.startsWith('"') || line.includes('T0')) {
          // Parser CSV robusto com regex
          const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
          if (matches) {
            cols = matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').trim());
          }
        } else {
          cols = line.split(';').length > 1 ? line.split(';') : line.split(',');
        }

        // Se for a linha oficial do DEVCONTROL: ID (T001), Código da fase, Fase, Tarefa, Descrição, Obrigatoriedade, Perfil, Prioridade...
        if (cols[0]?.startsWith('T') && cols.length >= 5) {
          const id = cols[0];
          const taskName = cols[3];
          const desc = cols[4];
          const prioStr = cols[7] || 'Média';
          const priority: Priority =
            prioStr.toLowerCase().includes('alta') ? Priority.HIGH :
            prioStr.toLowerCase().includes('crítica') ? Priority.URGENT :
            prioStr.toLowerCase().includes('baixa') ? Priority.LOW : Priority.MEDIUM;

          tasksToInsert.push({
            title: `[${id}] ${taskName}`,
            description: desc,
            priority,
            estimatedHours: 4
          });
        } else if (cols[0] && !cols[0].toLowerCase().includes('id') && !cols[0].toLowerCase().includes('código')) {
          // CSV Genérico: Título; Descrição; Prioridade
          const title = cols[0].trim();
          if (title.length > 0) {
            tasksToInsert.push({
              title,
              description: cols[1]?.trim() || undefined,
              priority: (cols[2]?.trim().toUpperCase() as Priority) in Priority ? (cols[2]?.trim().toUpperCase() as Priority) : Priority.MEDIUM,
              estimatedHours: cols[3] ? parseFloat(cols[3].trim()) : 4
            });
          }
        }
      }
    } else if (type === 'TEXT') {
      // Quick Paste de checklist em tópicos
      const lines = (typeof rawData === 'string' ? rawData : '').split(/\r?\n/);
      for (const line of lines) {
        const clean = line.replace(/^[\s*\-•\d\.\(\)\[\]xX]+/, '').trim();
        if (clean.length > 0) {
          tasksToInsert.push({
            title: clean,
            priority: Priority.MEDIUM,
            estimatedHours: 4
          });
        }
      }
    }

    if (tasksToInsert.length === 0) {
      return reply.status(400).send({ error: 'Nenhuma tarefa válida pôde ser extraída dos dados informados' });
    }

    const created = await prisma.$transaction(
      tasksToInsert.map(t =>
        prisma.task.create({
          data: {
            projectId,
            title: t.title,
            description: t.description || null,
            priority: t.priority || Priority.MEDIUM,
            deadline: t.deadline || null,
            estimatedHours: t.estimatedHours || 4,
            status: TaskStatus.TODO,
            createdById: request.user!.id
          }
        })
      )
    );

    await recalculateProjectProgress(projectId);

    await logActivity({
      userId: request.user!.id,
      projectId,
      action: 'TASKS_IMPORTED_FROM_MODEL',
      entityType: 'Task',
      details: { count: created.length, type },
      ipAddress: request.ip
    });

    return reply.status(201).send({
      success: true,
      importedCount: created.length,
      tasks: created
    });
  });
}
