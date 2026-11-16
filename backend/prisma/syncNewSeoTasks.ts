import { PrismaClient, Priority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== ATUALIZANDO O DEVCONTROL: EXPANSÃO DO CHECKLIST PARA RANKING GOOGLE (165 TAREFAS) ===');

  const admin = await prisma.user.findUnique({ where: { email: 'admin@devcontrol.io' } });
  const dev = await prisma.user.findUnique({ where: { email: 'dev@devcontrol.io' } });
  if (!admin || !dev) throw new Error('Usuários base não encontrados.');

  // Definição das 6 novas tarefas de SEO, Core Web Vitals e Posicionamento no Google
  const newTasksDefinition = [
    {
      id: 'T160',
      phaseNumber: 7,
      title: '[T160] Auditoria contínua de indexação e envio dinâmico via Google Indexing API / Bing IndexNow',
      description: 'Configuração e monitoramento automático de rastreamento no Google Search Console, envio dinâmico de sitemap e indexação instantânea de novas URLs.',
      criteria: 'Monitorar rastreamento, envio dinâmico de sitemap e indexação instantânea sem erros 404/5xx.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T161',
      phaseNumber: 7,
      title: '[T161] Implementar Schema Markup avançado JSON-LD (Rich Snippets & EEAT)',
      description: 'Estruturação completa de microdados Schema.org (BreadcrumbList, Organization, Article, FAQPage e Rich Snippets) para conquistar estrelas, perguntas frequentes e destaque na SERP.',
      criteria: 'Validador de dados estruturados do Google 100% sem erros em todas as páginas públicas.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T162',
      phaseNumber: 7,
      title: '[T162] Otimização semântica para Respostas de IA do Google (AI Overviews / SGE)',
      description: 'Formatação semântica de respostas diretas, tabelas comparativas, listas ordenadas e autoridade editorial (EEAT) para ser citado como fonte primária nos resumos de IA do Google.',
      criteria: 'Presença de definições diretas no primeiro parágrafo e cabeçalhos em formato de pergunta frequente.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T163',
      phaseNumber: 7,
      title: '[T163] Arquitetura de Topic Clusters e Silos de links internos sem canibalização de palavras-chave',
      description: 'Estruturação de páginas pilares e clusters temáticos com links internos ancorados e cálculo de PageRank interno, evitando concorrência interna entre termos.',
      criteria: 'Mapeamento de palavras-chave sem canibalização e 100% das páginas com no mínimo 3 links internos contextuais.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T164',
      phaseNumber: 8,
      title: '[T164] Otimização estrita de Core Web Vitals para ranking Google (LCP < 2.0s, INP < 150ms, CLS < 0.05)',
      description: 'Atingir notas verdes no Google PageSpeed Insights e dados de campo CrUX em dispositivos móveis, eliminando bloqueadores de renderização para benefício direto no algoritmo do Google.',
      criteria: 'LCP menor que 2.0s, INP menor que 150ms e CLS menor que 0.05 no teste móvel de campo.',
      priority: Priority.HIGH,
      isMandatory: true
    },
    {
      id: 'T165',
      phaseNumber: 16,
      title: '[T165] Atualização contínua de conteúdo Evergreen e auditoria periódica de posicionamento SERP',
      description: 'Revisão periódica de artigos e páginas para manter frescor algorítmico do Google (Query Deserves Freshness), monitoramento de posições e testes de CTR nos títulos de busca.',
      criteria: 'Histórico de revisões semestrais e monitoramento de posições médias das 20 principais palavras-chave.',
      priority: Priority.MEDIUM,
      isMandatory: false
    }
  ];

  const projects = await prisma.project.findMany({
    include: {
      phases: {
        include: { checklistTasks: true, tasks: true }
      }
    }
  });

  console.log(`Aplicando atualização em ${projects.length} projetos cadastrados...`);

  for (const project of projects) {
    console.log(`\n-> Processando projeto: ${project.name} (${project.domain})`);

    const isVcpdtd = project.name.includes('Você Pode Tudo') || project.domain === 'vocepodetudo.com';
    const isSobrevivencia = project.name.includes('Sobrevivência') || project.domain === 'prontoparaoimprevisto.com.br';
    const isJtpcd = project.name.includes('Já Te Contaram') || project.domain === 'jtpcd.vercel.app';

    for (const taskDef of newTasksDefinition) {
      const phase = project.phases.find((ph) => ph.phaseNumber === taskDef.phaseNumber);
      if (!phase) {
        console.warn(`  ! Fase ${taskDef.phaseNumber} não encontrada no projeto ${project.name}`);
        continue;
      }

      // Determinar se já foi realizado no projeto específico
      let isTaskDone = false;
      let evidenceNotes: string | null = null;

      if (isVcpdtd) {
        if (taskDef.id === 'T161') {
          isTaskDone = true;
          evidenceNotes = 'Evidência em produção: JSON-LD Schema (Course, EducationalOrganization) ativo em vocepodetudo.com.';
        } else if (taskDef.id === 'T164') {
          isTaskDone = true;
          evidenceNotes = 'Evidência em produção: LCP 0.9s, WebP e nota 98 no Core Web Vitals móvel.';
        } else {
          isTaskDone = false;
          evidenceNotes = 'Pendente de implementação neste projeto — Meta de Posicionamento Orgânico no Google.';
        }
      } else if (isSobrevivencia) {
        if (taskDef.id === 'T164') {
          isTaskDone = true;
          evidenceNotes = 'Evidência em produção: logo -94.5%, imagens médicas reduzidas em 5.3MB e cache imutável de 1 ano.';
        } else {
          isTaskDone = false;
          evidenceNotes = 'Pendente de implementação neste projeto — Meta de Posicionamento Orgânico no Google.';
        }
      } else if (isJtpcd) {
        if (taskDef.id === 'T164') {
          isTaskDone = true;
          evidenceNotes = 'Evidência em produção: CSS puro otimizado, sem dependências pesadas e LCP < 1.5s na Vercel.';
        } else {
          isTaskDone = false;
          evidenceNotes = 'Pendente de implementação neste projeto — Meta de Posicionamento Orgânico no Google.';
        }
      } else {
        isTaskDone = false;
        evidenceNotes = 'Pendente de implementação neste projeto — Meta de Posicionamento Orgânico no Google.';
      }

      // Upsert na ChecklistTask
      const existingChecklistTask = phase.checklistTasks.find((ct) => ct.title.startsWith(`[${taskDef.id}]`));
      if (!existingChecklistTask) {
        await prisma.checklistTask.create({
          data: {
            phaseId: phase.id,
            title: taskDef.title,
            description: taskDef.description,
            criteria: taskDef.criteria,
            evidenceRequired: taskDef.isMandatory,
            isCompleted: isTaskDone,
            completedAt: isTaskDone ? new Date() : null,
            completedById: isTaskDone ? dev.id : null,
            evidenceNotes,
            order: 99
          }
        });
      }

      // Upsert na Task Operacional
      const existingTask = phase.tasks.find((t) => t.title.startsWith(`[${taskDef.id}]`));
      if (!existingTask) {
        await prisma.task.create({
          data: {
            projectId: project.id,
            phaseId: phase.id,
            title: taskDef.title,
            description: taskDef.description,
            status: isTaskDone ? TaskStatus.DONE : TaskStatus.TODO,
            priority: taskDef.priority,
            deadline: new Date('2026-12-31'),
            estimatedHours: 4,
            actualHours: isTaskDone ? 4.0 : 0,
            createdById: admin.id,
            assigneeId: dev.id,
            order: 99
          }
        });
      }
    }

    // Atualizar o status da Fase 07, 08 e 16 se houver tarefas pendentes
    for (const phNum of [7, 8, 16]) {
      const ph = await prisma.checklistPhase.findFirst({
        where: { projectId: project.id, phaseNumber: phNum },
        include: { checklistTasks: true }
      });
      if (ph) {
        const hasPending = ph.checklistTasks.some((t) => !t.isCompleted);
        const newStatus = hasPending ? 'IN_PROGRESS' : 'COMPLETED';
        if (ph.status !== newStatus) {
          await prisma.checklistPhase.update({
            where: { id: ph.id },
            data: {
              status: newStatus,
              completedAt: newStatus === 'COMPLETED' ? new Date() : null
            }
          });
        }
      }
    }

    // Recalcular rigorosamente o progresso do projeto
    const totalAllTasks = await prisma.checklistTask.count({
      where: { phase: { projectId: project.id } }
    });
    const completedAllTasks = await prisma.checklistTask.count({
      where: { phase: { projectId: project.id }, isCompleted: true }
    });

    const newProgress = Math.round((completedAllTasks / totalAllTasks) * 100 * 10) / 10;

    await prisma.project.update({
      where: { id: project.id },
      data: { progress: newProgress }
    });

    console.log(`  ✔ Concluídas: ${completedAllTasks}/${totalAllTasks} tarefas (${newProgress}% de progresso).`);
  }

  // Registrar no AuditLog
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEO_EXPANSION_APPLIED',
      entityType: 'ChecklistTemplate',
      details: 'Catálogo de tarefas expandido para 165 itens com foco em Posicionamento Orgânico no Google, Core Web Vitals e AI Overviews. Tarefas não implementadas deixadas desmarcadas nos projetos para acompanhamento.',
      ipAddress: '127.0.0.1'
    }
  });

  console.log('\n✔ Expansão do Checklist Master para Ranking Google sincronizada com sucesso em todos os projetos!');
}

main()
  .catch((e) => {
    console.error('Erro na sincronização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
