import { FastifyInstance } from 'fastify';
import { prisma } from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';

export async function aiRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Gerar Tarefas com IA para um Site
  app.post('/generate-tasks', async (request, reply) => {
    const { prompt, projectId } = request.body as { prompt: string; projectId: string };

    if (!prompt) return reply.status(400).send({ error: 'Prompt obrigatório' });

    // Estrutura inteligente gerada pela inteligência de arquitetura
    const suggestedTasks = [
      {
        title: `[Otimização] Implementar lazy-loading de componentes para ${prompt}`,
        description: 'Reduzir First Contentful Paint e tamanho do bundle inicial.',
        priority: 'HIGH',
        estimatedHours: 4
      },
      {
        title: `[SEO] Configuração de dados estruturados JSON-LD para ${prompt}`,
        description: 'Enriquecer snippets nos motores de busca do Google.',
        priority: 'MEDIUM',
        estimatedHours: 3
      },
      {
        title: `[Segurança] Blindagem contra brute-force nas rotas de autenticação`,
        description: 'Configurar teto de requisições por IP e captcha opcional.',
        priority: 'HIGH',
        estimatedHours: 5
      }
    ];

    await prisma.aiLog.create({
      data: {
        prompt,
        action: 'GENERATE_TASKS',
        response: JSON.stringify(suggestedTasks)
      }
    });

    return reply.send({
      message: 'Sugestões de tarefas geradas com base nas melhores práticas de engenharia web.',
      suggestedTasks,
      guardrailNotice: 'Regra de Segurança: Ações de publicação e aprovação de auditorias exigem intervenção humana do Administrador.'
    });
  });

  // Resumir Projeto e Identificar Gargalos
  app.post('/project-analysis/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: { where: { status: { not: 'DONE' } } },
        vulnerabilities: { where: { status: { not: 'MITIGATED' } } },
        qualityGateRules: { where: { isPassed: false } }
      }
    });

    if (!project) return reply.status(404).send({ error: 'Projeto não encontrado' });

    const analysis = {
      summary: `O projeto "${project.name}" está com ${project.progress}% de conclusão. Existem ${project.tasks.length} tarefas pendentes e ${project.vulnerabilities.length} vulnerabilidades em aberto.`,
      bottlenecks: [
        project.vulnerabilities.length > 0 ? `Atenção: ${project.vulnerabilities.length} vulnerabilidade(s) bloqueiam a aprovação do Quality Gate.` : null,
        project.qualityGateRules.length > 0 ? `${project.qualityGateRules.length} regra(s) do Quality Gate ainda não foram satisfeitas.` : null
      ].filter(Boolean),
      recommendations: [
        'Priorizar a mitigação das vulnerabilidades de severidade alta.',
        'Finalizar a homologação da fase de testes funcionais.',
        'Executar simulação de restore do backup pré-deploy.'
      ]
    };

    await prisma.aiLog.create({
      data: {
        prompt: `Análise do projeto ${projectId}`,
        action: 'SUMMARIZE_PROJECT',
        response: JSON.stringify(analysis)
      }
    });

    return reply.send(analysis);
  });
}
