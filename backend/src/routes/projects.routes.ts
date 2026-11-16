import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate, authorizeRoles, authorizeProjectAccess } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Role, Priority, ProjectStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parseOfficialTemplateCSV, OFFICIAL_QUALITY_GATE_RULES } from '../config/officialTemplate.js';

const createProjectSchema = z.object({
  name: z.string().min(3, 'O nome do projeto deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  siteUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  domain: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  deadline: z.string().optional(),
  isPrivate: z.boolean().default(true),
  importChecklist: z.boolean().default(true)
});

export async function projectRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar projetos (Admin vê todos; Colaborador vê autorizados/públicos)
  app.get('/', async (request, reply) => {
    const user = request.user!;

    let whereClause = {};
    if (user.role !== Role.ADMIN) {
      whereClause = {
        OR: [
          { isPrivate: false },
          { createdById: user.id },
          { members: { some: { userId: user.id } } }
        ]
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, role: true, avatar: true } } } },
        uptimeCheck: true,
        _count: {
          select: { tasks: true, vulnerabilities: true, securityAudits: true, deployments: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return reply.send(projects);
  });

  // Obter detalhes de um projeto
  app.get('/:id', { preHandler: [authorizeProjectAccess] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        phases: {
          orderBy: { phaseNumber: 'asc' },
          include: {
            checklistTasks: { orderBy: { order: 'asc' } },
            tasks: { orderBy: { order: 'asc' } }
          }
        },
        uptimeCheck: true,
        qualityGateRules: { orderBy: { ruleKey: 'asc' } },
        _count: { select: { tasks: true, vulnerabilities: true, docs: true } }
      }
    });

    if (!project) {
      return reply.status(404).send({ error: 'Projeto não encontrado' });
    }

    return reply.send(project);
  });

  // Criar Projeto com Importação Automática das 17 Fases & 159 Tarefas Oficiais
  app.post('/', { preHandler: [authorizeRoles([Role.ADMIN, Role.MANAGER])] }, async (request, reply) => {
    const parseResult = createProjectSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors[0].message });
    }

    const data = parseResult.data;
    const user = request.user!;

    // Carregar modelo oficial
    const csvPath = path.resolve(process.cwd(), '../templates/DEVCONTROL_MODELO_OFICIAL.csv');
    let officialPhases: any[] = [];
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      officialPhases = parseOfficialTemplateCSV(csvContent).phases;
    }

    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description || null,
          siteUrl: data.siteUrl || null,
          domain: data.domain || (data.siteUrl ? new URL(data.siteUrl).hostname : null),
          technologies: JSON.stringify(data.technologies),
          priority: data.priority,
          deadline: data.deadline ? new Date(data.deadline) : null,
          isPrivate: data.isPrivate,
          createdById: user.id,
          members: {
            create: {
              userId: user.id,
              role: user.role
            }
          },
          uptimeCheck: {
            create: {
              status: 'ONLINE',
              statusCode: 200,
              responseTimeMs: 120,
              sslValid: true,
              sslExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              sslDaysRemaining: 90
            }
          }
        }
      });

      // Importar automaticamente as 17 fases e 159 tarefas
      if (data.importChecklist && officialPhases.length > 0) {
        for (const phaseItem of officialPhases) {
          const phase = await tx.checklistPhase.create({
            data: {
              projectId: project.id,
              phaseNumber: phaseItem.number,
              name: phaseItem.name,
              description: phaseItem.objective,
              status: 'NOT_STARTED',
              order: phaseItem.number
            }
          });

          for (let i = 0; i < phaseItem.tasks.length; i++) {
            const t = phaseItem.tasks[i];
            await tx.checklistTask.create({
              data: {
                phaseId: phase.id,
                title: `[${t.id}] ${t.taskTitle}`,
                description: t.description,
                criteria: phaseItem.generalCriteria,
                evidenceRequired: t.isMandatory,
                isCompleted: false,
                order: i + 1
              }
            });

            await tx.task.create({
              data: {
                projectId: project.id,
                phaseId: phase.id,
                title: `[${t.id}] ${t.taskTitle}`,
                description: t.description,
                status: 'TODO',
                priority: t.priority,
                createdById: user.id,
                order: i + 1
              }
            });
          }
        }
      }

      // Inicializar os 10 Controles Oficiais do Quality Gate (QG01 a QG10)
      for (const qg of OFFICIAL_QUALITY_GATE_RULES) {
        await tx.qualityGateRule.create({
          data: {
            projectId: project.id,
            ruleKey: qg.id,
            ruleName: `${qg.id} - ${qg.name}`,
            isMandatory: qg.isMandatory,
            isPassed: false,
            details: `${qg.rule} (Validador: ${qg.validator})`
          }
        });
      }

      return project;
    });

    await logActivity({
      userId: user.id,
      projectId: newProject.id,
      action: 'PROJECT_CREATED_WITH_OFFICIAL_MODEL',
      entityType: 'Project',
      entityId: newProject.id,
      details: { name: newProject.name, tasksCount: 159, qgRulesCount: 10 },
      ipAddress: request.ip
    });

    return reply.status(201).send(newProject);
  });

  // Atualizar Projeto
  app.put('/:id', { preHandler: [authorizeRoles([Role.ADMIN, Role.MANAGER]), authorizeProjectAccess] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      name: string;
      description: string;
      siteUrl: string;
      domain: string;
      technologies: string[];
      priority: Priority;
      deadline: string;
      status: ProjectStatus;
      isPrivate: boolean;
    }>;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.siteUrl !== undefined && { siteUrl: body.siteUrl }),
        ...(body.domain !== undefined && { domain: body.domain }),
        ...(body.technologies && { technologies: JSON.stringify(body.technologies) }),
        ...(body.priority && { priority: body.priority }),
        ...(body.deadline && { deadline: new Date(body.deadline) }),
        ...(body.status && { status: body.status }),
        ...(body.isPrivate !== undefined && { isPrivate: body.isPrivate })
      }
    });

    return reply.send(updated);
  });

  // Excluir Projeto (Apenas ADMIN)
  app.delete('/:id', { preHandler: [authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.project.delete({ where: { id } });
    return reply.send({ success: true, message: 'Projeto excluído com sucesso' });
  });

  // Membros do Projeto
  app.post('/:id/members', { preHandler: [authorizeRoles([Role.ADMIN, Role.MANAGER])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId, role } = request.body as { userId: string; role?: Role };

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: id, userId } },
      update: { role: role || Role.DEVELOPER },
      create: { projectId: id, userId, role: role || Role.DEVELOPER }
    });

    return reply.status(201).send(member);
  });

  // Cofre de Credenciais (.env Vault) - Exclusivo ADMIN
  app.get('/:id/secrets', { preHandler: [authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return prisma.projectSecret.findMany({ where: { projectId: id } });
  });

  app.post('/:id/secrets', { preHandler: [authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { key, value, description } = request.body as { key: string; value: string; description?: string };

    const secret = await prisma.projectSecret.upsert({
      where: { projectId_key: { projectId: id, key } },
      update: { value, description },
      create: { projectId: id, key, value, description }
    });

    return reply.status(201).send(secret);
  });

  app.delete('/:id/secrets/:secretId', { preHandler: [authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const { secretId } = request.params as { secretId: string };
    await prisma.projectSecret.delete({ where: { id: secretId } });
    return reply.send({ success: true });
  });
}
