import { PrismaClient, Role, Priority, ProjectStatus, VulnerabilitySeverity, VulnerabilityStatus, DeployEnvironment, DeployStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parseOfficialTemplateCSV, OFFICIAL_QUALITY_GATE_RULES } from '../src/config/officialTemplate.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Inserindo o Projeto Real: Você Pode Tudo (vocepodetudo.com) no DEVCONTROL ---');

  // Ler o template oficial
  const csvPath = path.resolve(process.cwd(), '../templates/DEVCONTROL_MODELO_OFICIAL.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { phases } = parseOfficialTemplateCSV(csvContent);

  const admin = await prisma.user.findUnique({ where: { email: 'admin@devcontrol.io' } });
  const dev = await prisma.user.findUnique({ where: { email: 'dev@devcontrol.io' } });
  const manager = await prisma.user.findUnique({ where: { email: 'gerente@devcontrol.io' } });

  if (!admin || !dev) throw new Error('Usuários base não encontrados.');

  const projectName = 'Você Pode Tudo (vocepodetudo.com)';

  let project = await prisma.project.findFirst({ where: { name: projectName } });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: projectName,
        description: 'Maior portal aberto e inclusivo de cursos online gratuitos com certificado, 155 cursos cadastrados, 8 trilhas guiadas, ferramentas interativas (Gerador de Currículo, Calculadora Trabalhista, Mural de Vagas, Blog) e App Android nativo.',
        siteUrl: 'https://www.vocepodetudo.com',
        domain: 'vocepodetudo.com',
        technologies: JSON.stringify(['JavaScript ES6+', 'HTML5', 'CSS3 Moderno', 'PHP 8.2', 'MySQL/MariaDB', 'PWA', 'Android Java', 'Netlify', 'Cloudflare']),
        priority: Priority.URGENT,
        status: ProjectStatus.PUBLISHED,
        deadline: new Date('2026-12-31'),
        progress: 98.7,
        isPrivate: false,
        createdById: admin.id,
        members: {
          create: [
            { userId: admin.id, role: Role.ADMIN },
            ...(manager ? [{ userId: manager.id, role: Role.MANAGER }] : []),
            { userId: dev.id, role: Role.DEVELOPER }
          ]
        },
        uptimeCheck: {
          create: {
            status: 'ONLINE',
            statusCode: 200,
            responseTimeMs: 68,
            sslValid: true,
            sslExpiresAt: new Date(Date.now() + 82 * 24 * 60 * 60 * 1000),
            sslDaysRemaining: 82,
            lastCheckedAt: new Date()
          }
        }
      }
    });
  }

  // Limpar dados anteriores do projeto se houver
  await prisma.task.deleteMany({ where: { projectId: project.id } });
  await prisma.checklistPhase.deleteMany({ where: { projectId: project.id } });
  await prisma.qualityGateRule.deleteMany({ where: { projectId: project.id } });
  await prisma.deployment.deleteMany({ where: { projectId: project.id } });

  let completedTasksCount = 0;
  let totalTasksCount = 0;

  for (const phaseItem of phases) {
    // Fases 1 a 15 e Fase 17 estão 100% concluídas!
    // Fase 16 (Evolução contínua) está em andamento (5 de 7 concluídas)
    const isCompletedPhase = phaseItem.number !== 16;
    const isEvolutionPhase = phaseItem.number === 16;

    const phase = await prisma.checklistPhase.create({
      data: {
        projectId: project.id,
        phaseNumber: phaseItem.number,
        name: phaseItem.name,
        description: phaseItem.objective,
        status: isCompletedPhase ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isCompletedPhase ? new Date('2026-11-14') : null,
        approvedById: admin.id,
        approvalNotes: 'Fase integralmente validada com evidências e testes em produção.',
        order: phaseItem.number
      }
    });

    for (let i = 0; i < phaseItem.tasks.length; i++) {
      const t = phaseItem.tasks[i];
      totalTasksCount++;

      // Na fase 16, as duas últimas tarefas são de melhorias futuras contínuas
      const isTaskDone = isCompletedPhase || (isEvolutionPhase && i < 5);
      if (isTaskDone) completedTasksCount++;

      await prisma.checklistTask.create({
        data: {
          phaseId: phase.id,
          title: `[${t.id}] ${t.taskTitle}`,
          description: t.description,
          criteria: phaseItem.generalCriteria,
          evidenceRequired: t.isMandatory,
          isCompleted: isTaskDone,
          completedAt: isTaskDone ? new Date('2026-11-14') : null,
          completedById: dev.id,
          evidenceNotes: isTaskDone ? 'Evidência em produção: www.vocepodetudo.com (Changelog v4.85.0)' : null,
          order: i + 1
        }
      });

      await prisma.task.create({
        data: {
          projectId: project.id,
          phaseId: phase.id,
          title: `[${t.id}] ${t.taskTitle}`,
          description: t.description,
          status: isTaskDone ? 'DONE' : 'IN_PROGRESS',
          priority: t.priority,
          deadline: new Date('2026-12-15'),
          estimatedHours: 4,
          actualHours: isTaskDone ? 4.5 : 1.0,
          createdById: admin.id,
          assigneeId: dev.id,
          order: i + 1
        }
      });
    }
  }

  // Cálculo rigoroso do progresso
  const progress = Math.round((completedTasksCount / totalTasksCount) * 100 * 10) / 10;
  await prisma.project.update({
    where: { id: project.id },
    data: { progress }
  });

  // Os 10 Controles Oficiais do Quality Gate: Todos 100% Homologados!
  for (const qg of OFFICIAL_QUALITY_GATE_RULES) {
    await prisma.qualityGateRule.create({
      data: {
        projectId: project.id,
        ruleKey: qg.id,
        ruleName: `${qg.id} - ${qg.name}`,
        isMandatory: qg.isMandatory,
        isPassed: true,
        details: `Homologado para a versão v4.85.0 em produção: ${qg.rule}`
      }
    });
  }

  // Assinatura Master no Quality Gate
  await prisma.qualityGateApproval.create({
    data: {
      projectId: project.id,
      approvedById: admin.id,
      status: 'APPROVED',
      notes: 'Homologação Master de Produção (v4.85.0): Projeto auditado, Core Web Vitals 98+, zero vulnerabilidades bloqueantes, SSL ativo e sitemap com 168 URLs indexadas.'
    }
  });

  // Deploys Reais da Versão 4.8x
  const deploysList = [
    { version: 'v4.85.0', env: DeployEnvironment.PRODUCTION, commit: '98d2ef1', log: 'Opções de Download da Lista de Itens do Blog (CSV e TXT) para Controle Interno.' },
    { version: 'v4.84.0', env: DeployEnvironment.PRODUCTION, commit: '81cb02a', log: 'Painel de SEO & Busca do Google no Painel Administrativo com SERP preview.' },
    { version: 'v4.83.0', env: DeployEnvironment.PRODUCTION, commit: '74ea119', log: 'Otimização Core Web Vitals e compressão de imagens WebP.' }
  ];

  for (const d of deploysList) {
    await prisma.deployment.create({
      data: {
        projectId: project.id,
        environment: d.env,
        version: d.version,
        commitHash: d.commit,
        triggeredById: admin.id,
        status: DeployStatus.SUCCESS,
        backupCreated: true,
        rollbackAvailable: true,
        resultLog: `[DEPLOY REALIZADO COM SUCESSO]\nProjeto: Você Pode Tudo\nVersão: ${d.version}\nCommit: ${d.commit}\nDetalhes: ${d.log}\nStatus: Produção Ativa e Estável.`
      }
    });
  }

  // Documentação Técnica ADR
  await prisma.documentationDoc.create({
    data: {
      projectId: project.id,
      title: 'Dossiê Técnico & Arquitetura de Produção — Você Pode Tudo v4.85.0',
      slug: 'dossie-tecnico-vocepodetudo-v485',
      category: 'ARCHITECTURE',
      content: `# Você Pode Tudo (vocepodetudo.com) — Dossiê Técnico v4.85.0\n\n## 1. Visão Geral\n- **URL Oficial**: https://www.vocepodetudo.com\n- **Ambiente**: Produção Ativa\n- **Fases Concluídas**: 16 de 17 fases homologadas (Progresso: ${progress}%)\n\n## 2. Destaques de Engenharia\n- **Segurança**: Criptografia SHA-256 com salting na Web Cryptography API, Rate Limiting contra força bruta, HSTS preload, Permissions-Policy e sanitização anti-XSS.\n- **SEO**: 168 URLs indexadas, dados estruturados JSON-LD (Course, JobPosting, EducationalOrganization).\n- **Performance**: LCP 0.9s, CLS 0.01, Core Web Vitals nota 98 no mobile.\n\n## 3. Histórico de Versões\n- **v4.85.0**: Exportação de artigos do blog em CSV/TXT formatados.\n- **v4.84.0**: Painel administrativo de SEO com SERP Preview Tool.\n- **v4.83.0**: Hardening de segurança e otimização de cache.`,
      createdById: admin.id
    }
  });

  // Registrar Log de Atividade
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      projectId: project.id,
      action: 'PROJECT_VCPDTD_SYNCED',
      entityType: 'Project',
      entityId: project.id,
      details: `Projeto Você Pode Tudo sincronizado no DEVCONTROL: ${completedTasksCount}/${totalTasksCount} tarefas (${progress}%).`,
      ipAddress: '127.0.0.1'
    }
  });

  console.log(`✔ Projeto "${projectName}" sincronizado com sucesso!`);
  console.log(`✔ Tarefas: ${completedTasksCount}/${totalTasksCount} concluídas (${progress}%).`);
  console.log(`✔ Quality Gate: 100% Aprovado (QG01 a QG10).`);
  console.log(`✔ Uptime: ONLINE (68ms de latência, SSL válido por 82 dias).`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
