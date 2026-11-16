import { prisma } from '../config/prisma.js';

export async function logActivity(params: {
  userId?: string;
  projectId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string | object;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        projectId: params.projectId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: typeof params.details === 'object' ? JSON.stringify(params.details) : params.details || null,
        ipAddress: params.ipAddress || '127.0.0.1'
      }
    });
  } catch (error) {
    console.error('Falha ao registrar log de auditoria:', error);
  }
}
