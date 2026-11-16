import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Role, VulnerabilitySeverity, VulnerabilityStatus } from '@prisma/client';

export async function securityRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar auditorias e vulnerabilidades de um projeto
  app.get('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const audits = await prisma.securityAudit.findMany({
      where: { projectId },
      include: {
        auditor: { select: { name: true, email: true } },
        vulnerabilities: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const vulnerabilities = await prisma.vulnerability.findMany({
      where: { projectId },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }]
    });

    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.CRITICAL && v.status !== VulnerabilityStatus.MITIGATED).length,
      high: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.HIGH && v.status !== VulnerabilityStatus.MITIGATED).length,
      medium: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.MEDIUM && v.status !== VulnerabilityStatus.MITIGATED).length,
      low: vulnerabilities.filter(v => v.severity === VulnerabilitySeverity.LOW && v.status !== VulnerabilityStatus.MITIGATED).length,
      mitigated: vulnerabilities.filter(v => v.status === VulnerabilityStatus.MITIGATED).length
    };

    return reply.send({ audits, vulnerabilities, summary });
  });

  // Criar Auditoria de Segurança
  app.post('/audits', { preHandler: [authorizeRoles([Role.ADMIN, Role.AUDITOR, Role.MANAGER])] }, async (request, reply) => {
    const { projectId, title, owaspCategory, reportNotes } = request.body as {
      projectId: string;
      title: string;
      owaspCategory?: string;
      reportNotes?: string;
    };

    const audit = await prisma.securityAudit.create({
      data: {
        projectId,
        title,
        auditorId: request.user!.id,
        owaspCategory: owaspCategory || 'OWASP Top 10',
        reportNotes: reportNotes || null,
        status: 'IN_PROGRESS'
      }
    });

    await logActivity({
      userId: request.user!.id,
      projectId,
      action: 'SECURITY_AUDIT_STARTED',
      entityType: 'SecurityAudit',
      entityId: audit.id,
      details: { title },
      ipAddress: request.ip
    });

    return reply.status(201).send(audit);
  });

  // Cadastrar Vulnerabilidade
  app.post('/vulnerabilities', { preHandler: [authorizeRoles([Role.ADMIN, Role.AUDITOR, Role.DEVELOPER, Role.MANAGER])] }, async (request, reply) => {
    const { projectId, auditId, title, description, severity, category, evidence, mitigationPlan } = request.body as {
      projectId: string;
      auditId?: string;
      title: string;
      description: string;
      severity: VulnerabilitySeverity;
      category: string;
      evidence?: string;
      mitigationPlan?: string;
    };

    const vuln = await prisma.vulnerability.create({
      data: {
        projectId,
        auditId: auditId || null,
        title,
        description,
        severity: severity || VulnerabilitySeverity.MEDIUM,
        category: category || 'OWASP',
        evidence: evidence || null,
        mitigationPlan: mitigationPlan || null,
        status: VulnerabilityStatus.OPEN
      }
    });

    // Se for crítica, gerar notificação para o Admin
    if (severity === VulnerabilitySeverity.CRITICAL) {
      const adminUsers = await prisma.user.findMany({ where: { role: Role.ADMIN } });
      for (const a of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: a.id,
            projectId,
            title: '🚨 Vulnerabilidade Crítica Detectada',
            message: `Atenção: "${title}" foi reportada e requer ação imediata.`,
            type: 'VULNERABILITY_CRITICAL'
          }
        });
      }
    }

    await logActivity({
      userId: request.user!.id,
      projectId,
      action: 'VULNERABILITY_REPORTED',
      entityType: 'Vulnerability',
      entityId: vuln.id,
      details: { title, severity, category },
      ipAddress: request.ip
    });

    return reply.status(201).send(vuln);
  });

  // Atualizar Vulnerabilidade / Mitigação
  app.put('/vulnerabilities/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status, mitigationPlan, evidence } = request.body as {
      status?: VulnerabilityStatus;
      mitigationPlan?: string;
      evidence?: string;
    };

    const updated = await prisma.vulnerability.update({
      where: { id },
      data: {
        ...(status && {
          status,
          ...(status === VulnerabilityStatus.MITIGATED && { resolvedAt: new Date() })
        }),
        ...(mitigationPlan !== undefined && { mitigationPlan }),
        ...(evidence !== undefined && { evidence })
      }
    });

    await logActivity({
      userId: request.user!.id,
      projectId: updated.projectId,
      action: 'VULNERABILITY_UPDATED',
      entityType: 'Vulnerability',
      entityId: id,
      details: { status },
      ipAddress: request.ip
    });

    return reply.send(updated);
  });
}
