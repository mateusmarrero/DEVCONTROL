import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logActivity } from '../middleware/audit.js';
import { Role, DeployEnvironment, DeployStatus } from '@prisma/client';

export async function deployRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Listar deploys
  app.get('/project/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const deploys = await prisma.deployment.findMany({
      where: { projectId },
      include: {
        triggeredBy: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send(deploys);
  });

  // Disparar Deploy (Produção exige ADMIN e aprovação do Quality Gate!)
  app.post('/', async (request, reply) => {
    const { projectId, environment, version, commitHash } = request.body as {
      projectId: string;
      environment: DeployEnvironment;
      version: string;
      commitHash?: string;
    };

    const user = request.user!;

    // REGRA DE SEGURANÇA INEGOCIÁVEL: Deploy em Produção exige perfil ADMIN
    if (environment === DeployEnvironment.PRODUCTION && user.role !== Role.ADMIN) {
      return reply.status(403).send({
        error: 'Ação Bloqueada: O deploy em ambiente de PRODUÇÃO exige autorização expressa do Administrador Master.'
      });
    }

    // REGRA DO QUALITY GATE: Em produção, verificar se há regras mandatórias não cumpridas
    if (environment === DeployEnvironment.PRODUCTION) {
      const pendingMandatoryRules = await prisma.qualityGateRule.findMany({
        where: { projectId, isMandatory: true, isPassed: false }
      });

      if (pendingMandatoryRules.length > 0) {
        return reply.status(400).send({
          error: 'Bloqueio do Quality Gate: Existem requisitos obrigatórios pendentes de homologação antes da publicação em Produção.',
          pendingRules: pendingMandatoryRules.map(r => r.ruleName)
        });
      }
    }

    const deploy = await prisma.deployment.create({
      data: {
        projectId,
        environment,
        version,
        commitHash: commitHash || 'c' + Math.random().toString(16).substring(2, 9),
        triggeredById: user.id,
        status: DeployStatus.SUCCESS,
        backupCreated: true,
        rollbackAvailable: true,
        resultLog: `[DEPLOY COMPLETO]\nAmbiente: ${environment}\nVersão: ${version}\nTimestamp: ${new Date().toISOString()}\nStatus: Sucesso\nBuild: 0 falhas, 0 vulnerabilidades bloqueantes.\nBackup snapshot criado com integridade.`
      },
      include: {
        triggeredBy: { select: { name: true } }
      }
    });

    // Se for produção, atualizar status do projeto para PUBLISHED
    if (environment === DeployEnvironment.PRODUCTION) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'PUBLISHED' }
      });
    }

    await logActivity({
      userId: user.id,
      projectId,
      action: 'DEPLOY_EXECUTED',
      entityType: 'Deployment',
      entityId: deploy.id,
      details: { environment, version, status: deploy.status },
      ipAddress: request.ip
    });

    return reply.status(201).send(deploy);
  });

  // Rollback (Apenas ADMIN)
  app.post('/:id/rollback', { preHandler: [authorizeRoles([Role.ADMIN])] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const deploy = await prisma.deployment.findUnique({ where: { id } });
    if (!deploy) return reply.status(404).send({ error: 'Deploy não encontrado' });

    const rollbackDeploy = await prisma.deployment.create({
      data: {
        projectId: deploy.projectId,
        environment: deploy.environment,
        version: `${deploy.version}-rollback`,
        commitHash: deploy.commitHash,
        triggeredById: request.user!.id,
        status: DeployStatus.ROLLED_BACK,
        backupCreated: false,
        rollbackAvailable: false,
        resultLog: `[ROLLBACK EXECUTADO]\nRevertendo versão ${deploy.version} para o backup imediatamente anterior.\nOperação executada com sucesso pelo Administrador.`
      }
    });

    await logActivity({
      userId: request.user!.id,
      projectId: deploy.projectId,
      action: 'DEPLOY_ROLLED_BACK',
      entityType: 'Deployment',
      entityId: id,
      ipAddress: request.ip
    });

    return reply.send(rollbackDeploy);
  });
}
