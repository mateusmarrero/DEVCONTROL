import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Role, VulnerabilitySeverity, VulnerabilityStatus } from '@prisma/client';

export async function qualityGateRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar regras e status do Quality Gate para um projeto
  app.get('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const rules = await prisma.qualityGateRule.findMany({
      where: { projectId },
      orderBy: { ruleKey: 'asc' }
    });

    const approvals = await prisma.qualityGateApproval.findMany({
      where: { projectId },
      include: { approvedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const allPassed = rules.every(r => !r.isMandatory || r.isPassed);

    return reply.send({
      rules,
      approvals,
      canPublishToProduction: allPassed
    });
  });

  // Reavaliar Regras do Quality Gate automaticamente baseado no estado real do banco
  app.post('/project/:projectId/evaluate', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    // 1. Checar vulnerabilidades críticas
    const criticalVulnsCount = await prisma.vulnerability.count({
      where: {
        projectId,
        severity: VulnerabilitySeverity.CRITICAL,
        status: { not: VulnerabilityStatus.MITIGATED }
      }
    });

    // 2. Checar vulnerabilidades altas pendentes
    const highVulnsCount = await prisma.vulnerability.count({
      where: {
        projectId,
        severity: VulnerabilitySeverity.HIGH,
        status: { in: [VulnerabilityStatus.OPEN, VulnerabilityStatus.IN_PROGRESS] }
      }
    });

    // 3. Checar status da fase 11 (Testes) e 12 (Backup)
    const testPhase = await prisma.checklistPhase.findFirst({
      where: { projectId, phaseNumber: 11 }
    });

    const backupPhase = await prisma.checklistPhase.findFirst({
      where: { projectId, phaseNumber: 12 }
    });

    // Atualizar regras no banco
    await prisma.qualityGateRule.updateMany({
      where: { projectId, ruleKey: 'CRITICAL_VULNS_ZERO' },
      data: {
        isPassed: criticalVulnsCount === 0,
        details: criticalVulnsCount === 0 ? 'Zero vulnerabilidades críticas.' : `${criticalVulnsCount} vulnerabilidade(s) crítica(s) em aberto.`
      }
    });

    await prisma.qualityGateRule.updateMany({
      where: { projectId, ruleKey: 'HIGH_VULNS_TREATED' },
      data: {
        isPassed: highVulnsCount === 0,
        details: highVulnsCount === 0 ? 'Todas vulnerabilidades altas tratadas ou aceitas.' : `${highVulnsCount} pendente(s) de tratamento.`
      }
    });

    if (testPhase) {
      await prisma.qualityGateRule.updateMany({
        where: { projectId, ruleKey: 'TESTS_PASSED' },
        data: {
          isPassed: testPhase.status === 'COMPLETED',
          details: testPhase.status === 'COMPLETED' ? 'Fase 11 de testes concluída.' : 'Testes em andamento.'
        }
      });
    }

    if (backupPhase) {
      await prisma.qualityGateRule.updateMany({
        where: { projectId, ruleKey: 'BACKUP_VALIDATED' },
        data: {
          isPassed: backupPhase.status === 'COMPLETED',
          details: backupPhase.status === 'COMPLETED' ? 'Rotina de backup validada.' : 'Fase 12 de backup não finalizada.'
        }
      });
    }

    const updatedRules = await prisma.qualityGateRule.findMany({ where: { projectId } });
    return reply.send(updatedRules);
  });

  // Alternar manualmente uma regra (Apenas ADMIN ou MANAGER)
  app.patch('/rules/:ruleId', { preHandler: [authorizeRoles([Role.ADMIN, Role.MANAGER])] }, async (request, reply) => {
    const { ruleId } = request.params as { ruleId: string };
    const { isPassed, details } = request.body as { isPassed: boolean; details?: string };

    const rule = await prisma.qualityGateRule.update({
      where: { id: ruleId },
      data: {
        isPassed,
        ...(details && { details }),
        checkedAt: new Date()
      }
    });

    return reply.send(rule);
  });

  // APROVAÇÃO FINAL DO QUALITY GATE (EXCLUSIVO: ADMINISTRADOR MASTER)
  app.post('/project/:projectId/approve', { preHandler: [authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { notes } = request.body as { notes?: string };

    // Verificar se todos os itens mandatórios estão aprovados
    const pendingMandatory = await prisma.qualityGateRule.findMany({
      where: { projectId, isMandatory: true, isPassed: false }
    });

    if (pendingMandatory.length > 0) {
      return reply.status(400).send({
        error: 'Não é possível aprovar o Quality Gate enquanto houver requisitos obrigatórios pendentes.',
        pending: pendingMandatory.map(r => r.ruleName)
      });
    }

    // Criar registro oficial de aprovação com data/hora e identificador do Admin
    const approval = await prisma.qualityGateApproval.create({
      data: {
        projectId,
        approvedById: request.user!.id,
        status: 'APPROVED',
        notes: notes || 'Quality Gate formalmente assinado e homologado pelo Administrador Master para publicação em Produção.'
      },
      include: { approvedBy: { select: { name: true, email: true } } }
    });

    // Atualizar status do projeto para READY_FOR_PRODUCTION
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'READY_FOR_PRODUCTION' }
    });

    await logActivity({
      userId: request.user!.id,
      projectId,
      action: 'QUALITY_GATE_MASTER_APPROVED',
      entityType: 'QualityGateApproval',
      entityId: approval.id,
      details: { approvedBy: request.user!.name },
      ipAddress: request.ip
    });

    return reply.status(201).send(approval);
  });
}
