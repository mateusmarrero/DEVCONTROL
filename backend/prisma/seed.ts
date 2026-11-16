import { PrismaClient, Role, Priority, ProjectStatus, VulnerabilitySeverity, VulnerabilityStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { parseOfficialTemplateCSV, OFFICIAL_QUALITY_GATE_RULES } from '../src/config/officialTemplate.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Atualizando DEVCONTROL com o Modelo Oficial de 159 Tarefas e 10 Quality Gates ---');

  // Ler o arquivo oficial
  const csvPath = path.resolve(process.cwd(), '../templates/DEVCONTROL_MODELO_OFICIAL.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { phases, allTasks, qualityGateRules } = parseOfficialTemplateCSV(csvContent);

  console.log(`Carregadas ${phases.length} fases oficiais e ${allTasks.length} tarefas estruturadas.`);

  // Senha padrão segura para testes
  const defaultPasswordHash = await bcrypt.hash('DevControl@2026', 10);

  // 1. Criar/Atualizar Usuários dos perfis
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devcontrol.io' },
    update: {},
    create: {
      name: 'Administrador Master',
      email: 'admin@devcontrol.io',
      password: defaultPasswordHash,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gerente@devcontrol.io' },
    update: {},
    create: {
      name: 'Carlos Gerente',
      email: 'gerente@devcontrol.io',
      password: defaultPasswordHash,
      role: Role.MANAGER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  });

  const dev = await prisma.user.upsert({
    where: { email: 'dev@devcontrol.io' },
    update: {},
    create: {
      name: 'Lucas Desenvolvedor',
      email: 'dev@devcontrol.io',
      password: defaultPasswordHash,
      role: Role.DEVELOPER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    }
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@devcontrol.io' },
    update: {},
    create: {
      name: 'Renata Auditora',
      email: 'auditor@devcontrol.io',
      password: defaultPasswordHash,
      role: Role.AUDITOR,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    }
  });

  // 2. Salvar Template Master Oficial com todas as 159 tarefas
  await prisma.checklistTemplate.upsert({
    where: { id: 'template-master-oficial-159' },
    update: {
      phasesJson: JSON.stringify(phases)
    },
    create: {
      id: 'template-master-oficial-159',
      name: 'DEVCONTROL — Modelo Oficial 1.0 (17 Fases & 159 Tarefas)',
      description: 'Modelo-base corporativo oficial para gestão de sites com 159 tarefas detalhadas e 10 regras de Quality Gate.',
      isDefault: true,
      phasesJson: JSON.stringify(phases)
    }
  });

  console.log('✔ Template Master Oficial das 17 Fases & 159 Tarefas registrado!');

  // 3. Atualizar o projeto modelo: "Portal TechStore Pro"
  let project = await prisma.project.findFirst({
    where: { name: 'Portal TechStore Pro' }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Portal TechStore Pro',
        description: 'Desenvolvimento e publicação de e-commerce com conformidade LGPD e segurança OWASP.',
        siteUrl: 'https://techstore-pro.exemplo.com.br',
        domain: 'techstore-pro.exemplo.com.br',
        technologies: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Fastify', 'MariaDB 10.11', 'Stripe']),
        priority: Priority.HIGH,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: ProjectStatus.IN_PROGRESS,
        progress: 17.0,
        isPrivate: true,
        createdById: admin.id,
        members: {
          create: [
            { userId: admin.id, role: Role.ADMIN },
            { userId: manager.id, role: Role.MANAGER },
            { userId: dev.id, role: Role.DEVELOPER },
            { userId: auditor.id, role: Role.AUDITOR }
          ]
        },
        uptimeCheck: {
          create: {
            status: 'ONLINE',
            statusCode: 200,
            responseTimeMs: 140,
            sslValid: true,
            sslExpiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
            sslDaysRemaining: 75
          }
        }
      }
    });
  }

  // Limpar fases e tarefas antigas do projeto para inserir o catálogo completo oficial
  await prisma.task.deleteMany({ where: { projectId: project.id } });
  await prisma.checklistPhase.deleteMany({ where: { projectId: project.id } });
  await prisma.qualityGateRule.deleteMany({ where: { projectId: project.id } });

  // Inserir as 17 fases e as 159 tarefas
  let taskCounter = 0;
  for (const phaseItem of phases) {
    const isCompletedPhase = phaseItem.number <= 2;
    const isInProgressPhase = phaseItem.number === 3 || phaseItem.number === 4;

    const createdPhase = await prisma.checklistPhase.create({
      data: {
        projectId: project.id,
        phaseNumber: phaseItem.number,
        name: phaseItem.name,
        description: phaseItem.objective,
        status: isCompletedPhase ? 'COMPLETED' : isInProgressPhase ? 'IN_PROGRESS' : 'NOT_STARTED',
        completedAt: isCompletedPhase ? new Date() : null,
        approvedById: isCompletedPhase ? admin.id : null,
        approvalNotes: isCompletedPhase ? 'Fase homologada conforme critérios de aceite.' : null,
        order: phaseItem.number
      }
    });

    for (let i = 0; i < phaseItem.tasks.length; i++) {
      const t = phaseItem.tasks[i];
      taskCounter++;
      const isDone = isCompletedPhase || (phaseItem.number === 3 && i < 4);

      await prisma.checklistTask.create({
        data: {
          phaseId: createdPhase.id,
          title: `[${t.id}] ${t.taskTitle}`,
          description: t.description,
          criteria: phaseItem.generalCriteria,
          evidenceRequired: t.isMandatory,
          isCompleted: isDone,
          completedAt: isDone ? new Date() : null,
          completedById: isDone ? dev.id : null,
          order: i + 1
        }
      });

      await prisma.task.create({
        data: {
          projectId: project.id,
          phaseId: createdPhase.id,
          title: `[${t.id}] ${t.taskTitle}`,
          description: t.description,
          status: isDone ? 'DONE' : isInProgressPhase ? 'IN_PROGRESS' : 'TODO',
          priority: t.priority,
          deadline: new Date(Date.now() + (phaseItem.number * 2) * 24 * 60 * 60 * 1000),
          estimatedHours: 4,
          actualHours: isDone ? 3.5 : 0.5,
          createdById: admin.id,
          assigneeId: dev.id
        }
      });
    }
  }

  // Recalcular progresso com base na fórmula exata do documento:
  // "Calcular pelo número de tarefas concluídas dividido pelo número de tarefas aplicáveis."
  const totalTasksCount = await prisma.task.count({ where: { projectId: project.id } });
  const completedTasksCount = await prisma.task.count({ where: { projectId: project.id, status: 'DONE' } });
  const calculatedProgress = Math.round((completedTasksCount / totalTasksCount) * 100 * 10) / 10;

  await prisma.project.update({
    where: { id: project.id },
    data: { progress: calculatedProgress }
  });

  // Cadastrar os 10 Controles Oficiais do Quality Gate (QG01 a QG10)
  for (const qg of OFFICIAL_QUALITY_GATE_RULES) {
    const isPassed = qg.id === 'QG01' || qg.id === 'QG05' || qg.id === 'QG06';
    await prisma.qualityGateRule.create({
      data: {
        projectId: project.id,
        ruleKey: qg.id,
        ruleName: `${qg.id} - ${qg.name}`,
        isMandatory: qg.isMandatory,
        isPassed,
        details: `${qg.rule} (Validador: ${qg.validator})`
      }
    });
  }

  console.log(`✔ Populadas com sucesso ${phases.length} fases e ${taskCounter} tarefas operacionais no MariaDB 10.11!`);
  console.log(`✔ Progresso recalculado: ${calculatedProgress}% (${completedTasksCount}/${totalTasksCount} tarefas concluídas).`);
  console.log(`✔ 10 Regras Oficiais do Quality Gate (QG01 - QG10) registradas!`);
  console.log('--- Seed Concluído com Êxito! ---');
}

main()
  .catch((e) => {
    console.error('Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
