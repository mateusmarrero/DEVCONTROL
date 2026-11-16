import { PrismaClient, Priority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== ATUALIZANDO O DEVCONTROL: EXPANSÃO DO CHECKLIST PARA 170 TAREFAS ===');

  const admin = await prisma.user.findUnique({ where: { email: 'admin@devcontrol.io' } });
  const dev = await prisma.user.findUnique({ where: { email: 'dev@devcontrol.io' } });
  if (!admin || !dev) throw new Error('Usuários base não encontrados.');

  const newTasksDefinition = [
    {
      id: 'T166',
      phaseNumber: 7,
      title: '[T166] Auditoria automatizada de silos temáticos e eliminação de páginas órfãs',
      description: 'Garantir linkagem interna bidirecional e profundidade máxima de 3 cliques entre artigos e páginas pilares.',
      criteria: 'Nenhuma página com menos de 3 links internos contextuais e mapa de links sem becos sem saída.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T167',
      phaseNumber: 8,
      title: '[T167] Conversão de imagens para formatos de nova geração (AVIF/WebP) e otimização para Google Imagens',
      description: 'Compactação sem perdas, dimensões responsivas srcset e atributos alt contextuais para SEO visual e LCP < 1.8s.',
      criteria: '100% das imagens convertidas para AVIF/WebP com tags alt descritivas e tags width/height explícitas.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T168',
      phaseNumber: 7,
      title: '[T168] Implementação de Schema FAQPage e HowTo em JSON-LD para Rich Snippets expansíveis',
      description: 'Maximizar taxa de cliques (CTR) na SERP do Google com blocos expansíveis de perguntas frequentes e passos práticos.',
      criteria: 'Rich Snippets testados e validados na ferramenta Rich Results Test do Google.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T169',
      phaseNumber: 7,
      title: '[T169] Auditoria estrita de links canônicos absolutos e prevenção de canibalização e conteúdo duplicado',
      description: 'Prevenir diluição de autoridade e divisão de tráfego entre URLs com e sem barra final, parâmetros de rastreamento ou variantes.',
      criteria: 'Tag rel=canonical absoluta única em cada página apontando para a versão canônica oficial.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T170',
      phaseNumber: 16,
      title: '[T170] GEO - Otimização semântica para citações diretas em mecanismos de IA (Google AI Overviews e Perplexity)',
      description: 'Formatação de definições concisas (resumos de 40 a 50 palavras no primeiro parágrafo) e entidades de autoridade para citação em IAs generativas.',
      criteria: 'Trechos de resumo em formato de resposta direta e autoridade editorial EEAT validada.',
      priority: Priority.HIGH,
      isMandatory: true
    }
  ];

  const projects = await prisma.project.findMany({
    include: {
      phases: {
        include: {
          checklistTasks: true,
          tasks: true
        }
      }
    }
  });

  for (const project of projects) {
    console.log(`\nAtualizando projeto: ${project.name} (${project.domain || project.siteUrl})`);

    for (const taskDef of newTasksDefinition) {
      const phase = project.phases.find(p => p.phaseNumber === taskDef.phaseNumber);
      if (!phase) {
        console.warn(`Fase ${taskDef.phaseNumber} não encontrada no projeto ${project.name}`);
        continue;
      }

      // 1. ChecklistTask
      const existingChecklist = await prisma.checklistTask.findFirst({
        where: {
          phaseId: phase.id,
          title: { startsWith: `[${taskDef.id}]` }
        }
      });

      if (!existingChecklist) {
        const orderCount = await prisma.checklistTask.count({ where: { phaseId: phase.id } });
        await prisma.checklistTask.create({
          data: {
            phaseId: phase.id,
            title: taskDef.title,
            description: taskDef.description,
            criteria: taskDef.criteria,
            evidenceRequired: taskDef.isMandatory,
            isCompleted: false, // DEIXADO DESMARCADO PARA O USUÁRIO ACOMPANHAR
            order: orderCount + 1
          }
        });
        console.log(`  -> Adicionada ChecklistTask ${taskDef.id} (Pendente [ ])`);
      }

      // 2. Task (Kanban)
      const existingTask = await prisma.task.findFirst({
        where: {
          projectId: project.id,
          title: { startsWith: `[${taskDef.id}]` }
        }
      });

      if (!existingTask) {
        const taskCount = await prisma.task.count({ where: { projectId: project.id, phaseId: phase.id } });
        await prisma.task.create({
          data: {
            projectId: project.id,
            phaseId: phase.id,
            title: taskDef.title,
            description: taskDef.description,
            status: TaskStatus.TODO,
            priority: taskDef.priority,
            createdById: admin.id,
            assigneeId: dev.id,
            order: taskCount + 1
          }
        });
        console.log(`  -> Adicionada Task Kanban ${taskDef.id} (Status: TODO)`);
      }
    }

    // Recalcular progresso real do projeto
    const totalProjectChecklist = await prisma.checklistTask.count({
      where: { phase: { projectId: project.id } }
    });
    const completedProjectChecklist = await prisma.checklistTask.count({
      where: { phase: { projectId: project.id }, isCompleted: true }
    });

    const realProgress = totalProjectChecklist > 0
      ? Number(((completedProjectChecklist / totalProjectChecklist) * 100).toFixed(1))
      : 0;

    await prisma.project.update({
      where: { id: project.id },
      data: { progress: realProgress }
    });

    console.log(`  => Progresso atualizado: ${completedProjectChecklist}/${totalProjectChecklist} tarefas (${realProgress}%)`);
  }

  console.log('\n=== SINCRONIZAÇÃO DAS 170 TAREFAS CONCLUÍDA COM SUCESSO! ===');
}

main()
  .catch((e) => {
    console.error('Erro na sincronização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
