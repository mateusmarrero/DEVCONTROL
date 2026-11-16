import { PrismaClient, Role, Priority, ProjectStatus, VulnerabilitySeverity, VulnerabilityStatus, DeployEnvironment, DeployStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parseOfficialTemplateCSV, OFFICIAL_QUALITY_GATE_RULES } from '../src/config/officialTemplate.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Inserindo Novos Projetos no DEVCONTROL com o Modelo Oficial de 159 Tarefas ---');

  // Ler o template oficial
  const csvPath = path.resolve(process.cwd(), '../templates/DEVCONTROL_MODELO_OFICIAL.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { phases, allTasks } = parseOfficialTemplateCSV(csvContent);

  const admin = await prisma.user.findUnique({ where: { email: 'admin@devcontrol.io' } });
  const manager = await prisma.user.findUnique({ where: { email: 'gerente@devcontrol.io' } });
  const dev = await prisma.user.findUnique({ where: { email: 'dev@devcontrol.io' } });
  const auditor = await prisma.user.findUnique({ where: { email: 'auditor@devcontrol.io' } });

  if (!admin || !dev) {
    throw new Error('Usuários base não encontrados.');
  }

  // DEFINIÇÃO DOS 3 NOVOS PROJETOS COM SEUS ESTÁGIOS REAIS
  const projectsConfig = [
    {
      name: 'Site Institucional Grupo Alpha',
      description: 'Portal corporativo B2B com apresentação institucional, catálogo de serviços industriais, área de trabalhe conosco e conformidade rigorosa com a LGPD.',
      siteUrl: 'https://grupoalpha.com.br',
      domain: 'grupoalpha.com.br',
      technologies: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'MariaDB', 'Nginx']),
      priority: Priority.HIGH,
      status: ProjectStatus.PUBLISHED,
      completedPhasesUpTo: 14, // Fases 1 a 14 100% concluídas!
      inProgressPhase: 15,     // Fase 15 (Monitoramento) ativa
      qgApproved: true,        // Quality Gate 100% homologado
      uptime: { status: 'ONLINE', statusCode: 200, responseTimeMs: 95, sslValid: true, sslDaysRemaining: 140 },
      vulns: [
        { title: 'Header Permissions-Policy ausente', category: 'SESSION', severity: VulnerabilitySeverity.LOW, status: VulnerabilityStatus.MITIGATED, mitigation: 'Header adicionado no Nginx.' }
      ],
      deploys: [
        { version: 'v1.0.0', env: DeployEnvironment.PRODUCTION, status: DeployStatus.SUCCESS, commit: 'a4f91b2' },
        { version: 'v1.1.0', env: DeployEnvironment.PRODUCTION, status: DeployStatus.SUCCESS, commit: 'c89e22d' },
        { version: 'v1.2.0', env: DeployEnvironment.PRODUCTION, status: DeployStatus.SUCCESS, commit: 'f104d8c' }
      ]
    },
    {
      name: 'Landing Page Imobiliária Jardins',
      description: 'Landing page de alta conversão para lançamento imobiliário de alto padrão, com tour virtual integrado, integração de leads via webhook e Core Web Vitals nota 98.',
      siteUrl: 'https://jardinslancamento.com.br',
      domain: 'jardinslancamento.com.br',
      technologies: JSON.stringify(['React', 'Tailwind CSS', 'Vite', 'Cloudflare', 'WebP', 'RD Station']),
      priority: Priority.URGENT,
      status: ProjectStatus.READY_FOR_PRODUCTION,
      completedPhasesUpTo: 13, // Fases 1 a 13 concluídas, fase 14 pronta para disparo
      inProgressPhase: 14,
      qgApproved: false,       // 9 de 10 regras aprovadas, aguardando assinatura final do Admin no QG10
      uptime: { status: 'ONLINE', statusCode: 200, responseTimeMs: 110, sslValid: true, sslDaysRemaining: 88 },
      vulns: [
        { title: 'Exposição de metadados em imagens enviadas', category: 'API', severity: VulnerabilitySeverity.MEDIUM, status: VulnerabilityStatus.MITIGATED, mitigation: 'Strip de metadados EXIF ativado na pipeline de assets.' }
      ],
      deploys: [
        { version: 'v0.9.0-rc1', env: DeployEnvironment.STAGING, status: DeployStatus.SUCCESS, commit: 'b719401' }
      ]
    },
    {
      name: 'Portal Notícias TechPulse',
      description: 'Portal editorial de notícias de tecnologia e inovação, com categorias dinâmicas, feed RSS, integração de publicidade e motor de busca rápida.',
      siteUrl: 'https://techpulse.com.br',
      domain: 'techpulse.com.br',
      technologies: JSON.stringify(['Node.js', 'Fastify', 'MariaDB', 'React', 'Redis', 'Google AdSense']),
      priority: Priority.MEDIUM,
      status: ProjectStatus.PLANNING,
      completedPhasesUpTo: 1,  // Apenas Fase 1 concluída
      inProgressPhase: 2,      // Fase 2 e 3 em andamento
      qgApproved: false,
      uptime: { status: 'ONLINE', statusCode: 200, responseTimeMs: 180, sslValid: true, sslDaysRemaining: 60 },
      vulns: [],
      deploys: [
        { version: 'v0.1.0-alpha', env: DeployEnvironment.DEVELOPMENT, status: DeployStatus.SUCCESS, commit: 'e018a3f' }
      ]
    }
  ];

  for (const cfg of projectsConfig) {
    let proj = await prisma.project.findFirst({ where: { name: cfg.name } });

    if (!proj) {
      proj = await prisma.project.create({
        data: {
          name: cfg.name,
          description: cfg.description,
          siteUrl: cfg.siteUrl,
          domain: cfg.domain,
          technologies: cfg.technologies,
          priority: cfg.priority,
          status: cfg.status,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          progress: 0,
          isPrivate: true,
          createdById: admin.id,
          members: {
            create: [
              { userId: admin.id, role: Role.ADMIN },
              ...(manager ? [{ userId: manager.id, role: Role.MANAGER }] : []),
              { userId: dev.id, role: Role.DEVELOPER }
            ]
          },
          uptimeCheck: {
            create: cfg.uptime
          }
        }
      });
    }

    // Limpar tarefas/fases prévias se existirem
    await prisma.task.deleteMany({ where: { projectId: proj.id } });
    await prisma.checklistPhase.deleteMany({ where: { projectId: proj.id } });
    await prisma.qualityGateRule.deleteMany({ where: { projectId: proj.id } });
    await prisma.deployment.deleteMany({ where: { projectId: proj.id } });

    // Criar as 17 fases e 159 tarefas
    let completedCount = 0;
    let totalCount = 0;

    for (const phaseItem of phases) {
      const isCompleted = phaseItem.number <= cfg.completedPhasesUpTo;
      const isInProgress = phaseItem.number === cfg.inProgressPhase;

      const phase = await prisma.checklistPhase.create({
        data: {
          projectId: proj.id,
          phaseNumber: phaseItem.number,
          name: phaseItem.name,
          description: phaseItem.objective,
          status: isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED',
          completedAt: isCompleted ? new Date() : null,
          approvedById: isCompleted ? admin.id : null,
          approvalNotes: isCompleted ? 'Fase conferida e homologada conforme critérios de aceite.' : null,
          order: phaseItem.number
        }
      });

      for (let i = 0; i < phaseItem.tasks.length; i++) {
        const t = phaseItem.tasks[i];
        totalCount++;

        // Regra de conclusão: concluída se a fase estiver concluída, ou se for a fase em andamento com metade feita
        const taskDone = isCompleted || (isInProgress && i < Math.floor(phaseItem.tasks.length / 2));
        if (taskDone) completedCount++;

        await prisma.checklistTask.create({
          data: {
            phaseId: phase.id,
            title: `[${t.id}] ${t.taskTitle}`,
            description: t.description,
            criteria: phaseItem.generalCriteria,
            evidenceRequired: t.isMandatory,
            isCompleted: taskDone,
            completedAt: taskDone ? new Date() : null,
            completedById: taskDone ? dev.id : null,
            evidenceNotes: taskDone && t.isMandatory ? 'Evidência validada pelo responsável técnico.' : null,
            order: i + 1
          }
        });

        await prisma.task.create({
          data: {
            projectId: proj.id,
            phaseId: phase.id,
            title: `[${t.id}] ${t.taskTitle}`,
            description: t.description,
            status: taskDone ? 'DONE' : isInProgress ? 'IN_PROGRESS' : 'TODO',
            priority: t.priority,
            deadline: new Date(Date.now() + (phaseItem.number * 2) * 24 * 60 * 60 * 1000),
            estimatedHours: 4,
            actualHours: taskDone ? 4.0 : 0.5,
            createdById: admin.id,
            assigneeId: dev.id,
            order: i + 1
          }
        });
      }
    }

    // Cálculo exato de progresso
    const progress = Math.round((completedCount / totalCount) * 100 * 10) / 10;
    await prisma.project.update({
      where: { id: proj.id },
      data: { progress }
    });

    // Inserir os 10 controles de Quality Gate
    for (const qg of OFFICIAL_QUALITY_GATE_RULES) {
      const isPassed = cfg.qgApproved || (cfg.completedPhasesUpTo >= 11 && qg.id !== 'QG10');
      await prisma.qualityGateRule.create({
        data: {
          projectId: proj.id,
          ruleKey: qg.id,
          ruleName: `${qg.id} - ${qg.name}`,
          isMandatory: qg.isMandatory,
          isPassed,
          details: `${qg.rule} (Validador: ${qg.validator})`
        }
      });
    }

    // Se aprovado, criar registro formal do QualityGateApproval
    if (cfg.qgApproved) {
      await prisma.qualityGateApproval.create({
        data: {
          projectId: proj.id,
          approvedById: admin.id,
          status: 'APPROVED',
          notes: 'Quality Gate assinado formalmente pelo Administrador Master. Deploy para produção autorizado.'
        }
      });
    }

    // Inserir Deploys
    for (const d of cfg.deploys) {
      await prisma.deployment.create({
        data: {
          projectId: proj.id,
          environment: d.env,
          version: d.version,
          commitHash: d.commit,
          triggeredById: admin.id,
          status: d.status,
          backupCreated: true,
          rollbackAvailable: true,
          resultLog: `[DEPLOY REALIZADO]\nProjeto: ${cfg.name}\nVersão: ${d.version}\nAmbiente: ${d.env}\nStatus: ${d.status}\nIntegridade de arquivos e banco validada.`
        }
      });
    }

    // Inserir Vulnerabilidades se houver
    for (const v of cfg.vulns) {
      await prisma.vulnerability.create({
        data: {
          projectId: proj.id,
          title: v.title,
          description: 'Inspeção de segurança realizada.',
          severity: v.severity,
          category: v.category,
          status: v.status,
          mitigationPlan: v.mitigation,
          resolvedAt: new Date()
        }
      });
    }

    // Inserir Documento Técnico ADR
    await prisma.documentationDoc.create({
      data: {
        projectId: proj.id,
        title: `Especificações e Padrões de Engenharia — ${cfg.name}`,
        slug: `adr-${proj.id.substring(0, 6)}`,
        category: 'ARCHITECTURE',
        content: `# Padrões de Engenharia & Arquitetura — ${cfg.name}\n\n## 1. Stack e Infraestrutura\n- Domínio: ${cfg.domain}\n- Status: ${cfg.status}\n- Fases concluídas: até Fase ${cfg.completedPhasesUpTo.toString().padStart(2, '0')}\n\n## 2. Critérios de Homologação\nTodas as tarefas possuem critérios rastreados conforme o Modelo Oficial DEVCONTROL 1.0.`,
        createdById: admin.id
      }
    });

    console.log(`✔ Projeto "${cfg.name}" cadastrado com sucesso: ${completedCount}/${totalCount} tarefas concluídas (${progress}%).`);
  }

  console.log('--- Todos os Projetos Foram Inseridos e Atualizados no MariaDB 10.11 com Sucesso! ---');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
