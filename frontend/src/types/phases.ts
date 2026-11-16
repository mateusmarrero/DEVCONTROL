export interface OfficialTask {
  id: string;
  title: string;
  criteria: string;
  isMandatory: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  suggestedRole: string;
}

export interface OfficialPhase {
  number: number;
  code: string;
  name: string;
  objective: string;
  isMandatory: boolean;
  generalCriteria: string;
  tasks: OfficialTask[];
}

export const PHASES_17_CATALOG: OfficialPhase[] = [
  {
    number: 1,
    code: '01',
    name: '01. Planejamento e Estratégia',
    objective: 'Definir propósito, público, escopo e viabilidade do projeto.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T001', title: 'Definir objetivo principal e problema que o site resolve', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T002', title: 'Definir público-alvo e necessidades dos usuários', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T003', title: 'Definir escopo inicial e o que ficará fora do projeto', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T004', title: 'Pesquisar concorrentes e referências', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T005', title: 'Definir diferencial e proposta de valor', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T006', title: 'Definir modelo operacional e monetização, se aplicável', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T007', title: 'Definir nome, domínio e identidade visual inicial', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T008', title: 'Definir métricas de sucesso e critérios de aceite', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T009', title: 'Registrar riscos, dependências e premissas', criteria: 'Definir propósito, público, escopo e viabilidade do projeto.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 2,
    code: '02',
    name: '02. Arquitetura e Estrutura',
    objective: 'Organizar páginas, navegação, conteúdo e experiência do usuário.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T010', title: 'Criar sitemap com páginas e hierarquia', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T011', title: 'Definir menus, navegação e rodapé', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T012', title: 'Definir estrutura de URLs', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T013', title: 'Planejar categorias, filtros e busca, se aplicável', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T014', title: 'Desenhar wireframes das páginas principais', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T015', title: 'Definir jornadas e fluxos críticos do usuário', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T016', title: 'Planejar estados vazios, erros e confirmações', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T017', title: 'Planejar experiência mobile e acessibilidade', criteria: 'Organizar páginas, navegação, conteúdo e UX.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 3,
    code: '03',
    name: '03. Planejamento Técnico',
    objective: 'Definir tecnologias, arquitetura, infraestrutura e padrões.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T018', title: 'Definir stack frontend, backend e banco de dados', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T019', title: 'Documentar arquitetura e limites dos componentes', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T020', title: 'Definir ambientes de desenvolvimento, homologação e produção', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T021', title: 'Configurar repositório Git e estratégia de branches', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T022', title: 'Definir padrão de código, lint e formatação', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T023', title: 'Modelar banco de dados, relações, índices e restrições', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T024', title: 'Definir estratégia de migrações e seed de desenvolvimento', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T025', title: 'Definir gestão de segredos e variáveis de ambiente', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T026', title: 'Definir estratégia de logs, monitoramento e backup', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T027', title: 'Documentar dependências externas e integrações', criteria: 'Definir padrões arquiteturais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 4,
    code: '04',
    name: '04. Desenvolvimento Frontend',
    objective: 'Construir a interface e validar responsividade e acessibilidade.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T028', title: 'Implementar layout base, cabeçalho, navegação e rodapé', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T029', title: 'Implementar componentes reutilizáveis', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T030', title: 'Implementar páginas e estados previstos no sitemap', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T031', title: 'Validar formulários no frontend sem depender apenas deles', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T032', title: 'Implementar feedback de carregamento, sucesso e erro', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T033', title: 'Validar responsividade em celular, tablet e desktop', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T034', title: 'Validar navegação por teclado e foco visível', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T035', title: 'Validar contraste, rótulos e textos alternativos', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T036', title: 'Verificar console do navegador e remover erros', criteria: 'Construir interface responsiva.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 5,
    code: '05',
    name: '05. Desenvolvimento Backend',
    objective: 'Implementar regras de negócio, APIs, dados e integrações.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T037', title: 'Implementar APIs e regras de negócio', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T038', title: 'Validar entradas no backend', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T039', title: 'Implementar autenticação e recuperação de conta, se aplicável', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T040', title: 'Implementar autorização por recurso e por ação', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T041', title: 'Implementar acesso ao banco com consultas seguras', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T042', title: 'Implementar paginação, filtros e limites de consulta', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T043', title: 'Implementar tratamento padronizado de erros', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T044', title: 'Implementar logs sem registrar segredos ou dados desnecessários', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T045', title: 'Testar integrações externas e falhas de dependências', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T046', title: 'Documentar endpoints e contratos de API', criteria: 'Implementar APIs, dados e integrações.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 6,
    code: '06',
    name: '06. Segurança da Informação',
    objective: 'Verificar aplicação, APIs, infraestrutura, permissões e dependências.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T047', title: 'Revisar autenticação, autorização e privilégios', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T048', title: 'Testar controle de acesso horizontal e vertical (IDOR/BOLA)', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T049', title: 'Verificar SQL Injection e validação de consultas', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T050', title: 'Verificar XSS armazenado, refletido e baseado em DOM', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T051', title: 'Verificar CSRF quando aplicável', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T052', title: 'Verificar SSRF quando houver busca de URLs ou chamadas externas', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T053', title: 'Revisar upload de arquivos, tipos, tamanho e armazenamento', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T054', title: 'Revisar sessões, cookies, tokens, expiração e logout', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T055', title: 'Revisar rate limiting e proteção contra força bruta', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T056', title: 'Revisar CORS e cabeçalhos HTTP de segurança', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T057', title: 'Verificar exposição de arquivos, backups, logs e variáveis', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T058', title: 'Analisar dependências e corrigir vulnerabilidades relevantes', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T059', title: 'Executar testes de segurança autorizados e registrar evidências', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T060', title: 'Revalidar correções e documentar risco residual', criteria: 'Verificar segurança da aplicação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 7,
    code: '07',
    name: '07. SEO e Indexação',
    objective: 'Preparar páginas para rastreamento, indexação e descoberta.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T061', title: 'Definir palavra-chave e intenção de busca por página', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T062', title: 'Configurar title e meta description únicos', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T063', title: 'Revisar hierarquia H1, H2 e H3', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T064', title: 'Configurar URLs amigáveis e canonical', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T065', title: 'Criar e validar sitemap.xml', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T066', title: 'Revisar robots.txt e diretivas de indexação', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T067', title: 'Implementar dados estruturados adequados ao conteúdo', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T068', title: 'Configurar Open Graph e metadados sociais', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T069', title: 'Revisar links internos, links quebrados e redirecionamentos', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T070', title: 'Configurar página 404 e breadcrumbs quando aplicável', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T071', title: 'Configurar Google Search Console e enviar sitemap', criteria: 'Preparar páginas para descoberta e SEO.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T160', title: 'Auditoria contínua de indexação e envio dinâmico via Google Indexing API / Bing IndexNow', criteria: 'Monitorar rastreamento, envio dinâmico de sitemap e indexação instantânea.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T161', title: 'Implementar Schema Markup avançado JSON-LD (Rich Snippets & EEAT)', criteria: 'Configurar schemas Breadcrumbs, Organization, Article, FAQPage e Rich Snippets no Google.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T162', title: 'Otimização semântica para Respostas de IA do Google (AI Overviews / SGE)', criteria: 'Estruturação de respostas diretas, tabelas comparativas e autoridade EEAT para ser citado pela IA do Google.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T163', title: 'Arquitetura de Topic Clusters e Silos de links internos sem canibalização de palavras-chave', criteria: 'Garantir autoridade tópica e direcionamento correto de PageRank interno.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 8,
    code: '08',
    name: '08. Desempenho e Velocidade',
    objective: 'Medir e otimizar carregamento, interatividade e estabilidade visual.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T072', title: 'Medir desempenho inicial com Lighthouse/PageSpeed', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T073', title: 'Otimizar imagens e utilizar formatos modernos quando adequado', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T074', title: 'Implementar lazy loading para mídia fora da primeira tela', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T075', title: 'Reduzir JavaScript e CSS não utilizados', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T076', title: 'Configurar cache e compressão', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T077', title: 'Revisar fontes e recursos que bloqueiam renderização', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T078', title: 'Otimizar consultas e chamadas de API', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T079', title: 'Medir Core Web Vitals: LCP, INP e CLS', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T080', title: 'Testar em dispositivo e conexão de desempenho limitado', criteria: 'Medir e otimizar carregamento.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T164', title: 'Otimização estrita de Core Web Vitals para ranking Google (LCP < 2.0s, INP < 150ms, CLS < 0.05)', criteria: 'Atingir notas verdes no Google PageSpeed Insights e dados de campo CrUX em dispositivos móveis.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 9,
    code: '09',
    name: '09. LGPD e Conformidade Legal',
    objective: 'Mapear dados pessoais, finalidades, bases legais e transparência.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T081', title: 'Mapear dados pessoais coletados e seus fluxos', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T082', title: 'Documentar finalidade e base legal aplicável por tratamento', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T083', title: 'Revisar minimização e retenção dos dados', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T084', title: 'Publicar política de privacidade clara e atualizada', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T085', title: 'Implementar consentimento quando necessário', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T086', title: 'Revisar cookies, analytics e serviços de terceiros', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T087', title: 'Definir canal para solicitações dos titulares', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T088', title: 'Definir procedimentos de acesso, correção e exclusão', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T089', title: 'Restringir acesso e proteger dados pessoais', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T090', title: 'Documentar incidentes e procedimento de resposta', criteria: 'Mapear finalidades e bases legais.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 10,
    code: '10',
    name: '10. Monetização',
    objective: 'Planejar e implementar monetização, quando fizer parte do projeto.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T091', title: 'Definir se monetização faz parte do escopo', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T092', title: 'Revisar requisitos e políticas da plataforma de anúncios/afiliados', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T093', title: 'Preparar transparência sobre publicidade e conteúdo patrocinado', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T094', title: 'Validar experiência do usuário e evitar anúncios enganosos', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T095', title: 'Configurar ads.txt quando aplicável', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T096', title: 'Verificar consentimento e privacidade para tecnologias de publicidade', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T097', title: 'Registrar métricas e custos de monetização', criteria: 'Planejar e implementar monetização.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 11,
    code: '11',
    name: '11. Testes e Homologação',
    objective: 'Validar funcionalidades, compatibilidade, acessibilidade e estabilidade.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T098', title: 'Testar fluxos principais de ponta a ponta', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T099', title: 'Testar formulários, validações e mensagens de erro', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T100', title: 'Testar cadastro, login, logout e recuperação, se aplicável', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T101', title: 'Testar permissões com perfis diferentes', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T102', title: 'Testar APIs e integração com banco', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T103', title: 'Testar estados de falha e indisponibilidade externa', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T104', title: 'Testar navegadores e dispositivos relevantes', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T105', title: 'Testar acessibilidade com teclado e leitor de tela', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T106', title: 'Executar testes automatizados e regressão', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T107', title: 'Corrigir defeitos e repetir os testes', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T108', title: 'Registrar evidências e aceite de homologação', criteria: 'Validar funcionalidades e estabilidade.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 12,
    code: '12',
    name: '12. Backup e Recuperação',
    objective: 'Criar backups, testar restauração e documentar recuperação.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T109', title: 'Configurar backup de arquivos e banco', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T110', title: 'Definir frequência, retenção e destino separado', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T111', title: 'Restringir acesso aos backups', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T112', title: 'Verificar integridade dos arquivos gerados', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T113', title: 'Executar restauração em ambiente controlado', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T114', title: 'Documentar procedimento e tempo estimado de recuperação', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' },
      { id: 'T115', title: 'Registrar data do último backup validado', criteria: 'Criar backups e documentar recuperação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 13,
    code: '13',
    name: '13. Preparação para Produção',
    objective: 'Revisar configurações, segredos, domínio, ambiente e prontidão.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T116', title: 'Configurar domínio, DNS e HTTPS', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T117', title: 'Confirmar variáveis e segredos exclusivos de produção', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T118', title: 'Desativar debug e mensagens internas', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T119', title: 'Remover arquivos, usuários e rotas de teste', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T120', title: 'Revisar permissões de arquivos e diretórios', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T121', title: 'Revisar CORS, cookies e cabeçalhos de produção', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T122', title: 'Executar migrações com plano de contingência', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T123', title: 'Confirmar monitoramento, logs e alertas', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T124', title: 'Preparar plano de rollback', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T125', title: 'Obter aprovação do Administrador para publicação', criteria: 'Revisar prontidão para deploy.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' }
    ]
  },
  {
    number: 14,
    code: '14',
    name: '14. Deploy e Publicação',
    objective: 'Publicar de forma controlada, validar produção e manter rollback.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T126', title: 'Registrar versão, commit e escopo do deploy', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T127', title: 'Executar backup imediatamente antes da publicação', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T128', title: 'Publicar no ambiente autorizado', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T129', title: 'Executar migrações previstas', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T130', title: 'Verificar inicialização e saúde dos serviços', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T131', title: 'Executar smoke tests em páginas e fluxos críticos', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T132', title: 'Verificar logs, erros HTTP e integrações', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T133', title: 'Confirmar funcionamento em dispositivos móveis', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T134', title: 'Registrar resultado, evidências e responsável', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T135', title: 'Executar rollback se critérios de falha forem atingidos', criteria: 'Publicar de forma controlada.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' }
    ]
  },
  {
    number: 15,
    code: '15',
    name: '15. Monitoramento e Manutenção',
    objective: 'Acompanhar disponibilidade, erros, segurança e atualizações.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T136', title: 'Configurar monitoramento de disponibilidade', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T137', title: 'Revisar logs e erros periodicamente', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T138', title: 'Monitorar alertas de segurança e dependências', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T139', title: 'Verificar formulários, APIs e fluxos críticos', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T140', title: 'Executar rotina de backup e conferir resultado', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T141', title: 'Aplicar atualizações de segurança com teste prévio', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T142', title: 'Revisar links quebrados e conteúdo desatualizado', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T143', title: 'Registrar incidentes, causa e correção', criteria: 'Acompanhar disponibilidade e erros.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 16,
    code: '16',
    name: '16. Evolução do Projeto',
    objective: 'Priorizar melhorias com base em dados e necessidades reais.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T144', title: 'Coletar feedback e necessidades dos usuários', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T145', title: 'Analisar métricas de uso e desempenho', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T146', title: 'Priorizar melhorias por impacto e esforço', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T147', title: 'Registrar solicitações e decisões', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T148', title: 'Planejar versão e critérios de aceite', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T149', title: 'Executar testes de regressão após mudanças', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T150', title: 'Atualizar documentação e histórico de versão', criteria: 'Priorizar melhorias contínuas.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' },
      { id: 'T165', title: 'Atualização contínua de conteúdo Evergreen e auditoria periódica de posicionamento SERP', criteria: 'Garantir frescor algorítmico do Google (Query Deserves Freshness) e testes de CTR nos títulos de busca.', isMandatory: false, priority: 'MEDIUM', suggestedRole: 'Editor' }
    ]
  },
  {
    number: 17,
    code: '17',
    name: '17. Auditoria Final 360°',
    objective: 'Consolidar evidências, pendências, riscos e decisão de liberação.',
    isMandatory: true,
    generalCriteria: 'Tarefas aplicáveis concluídas e evidências/aceite registrados.',
    tasks: [
      { id: 'T151', title: 'Conferir conclusão das fases obrigatórias', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T152', title: 'Conferir evidências dos testes funcionais', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T153', title: 'Conferir relatório de auditoria de segurança', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T154', title: 'Confirmar tratamento de vulnerabilidades críticas e altas', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T155', title: 'Confirmar backup e restauração testada', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T156', title: 'Confirmar revisão de SEO, acessibilidade e LGPD', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T157', title: 'Confirmar homologação e plano de rollback', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T158', title: 'Registrar riscos residuais e aceite formal', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' },
      { id: 'T159', title: 'Registrar decisão final: aprovado, reprovado ou aprovado com ressalvas', criteria: 'Consolidar decisão de liberação.', isMandatory: true, priority: 'HIGH', suggestedRole: 'Administrador' }
    ]
  }
];

export const OFFICIAL_QUALITY_GATE_RULES = [
  { id: 'QG01', name: 'Testes funcionais essenciais concluídos', isMandatory: true, validator: 'Administrador', rule: 'Sem falhas críticas nos fluxos essenciais.' },
  { id: 'QG02', name: 'Auditoria de segurança concluída', isMandatory: true, validator: 'Administrador/Auditor', rule: 'Escopo, resultados e evidências registrados.' },
  { id: 'QG03', name: 'Vulnerabilidades críticas tratadas', isMandatory: true, validator: 'Administrador', rule: 'Nenhuma crítica aberta; exceções não liberam automaticamente.' },
  { id: 'QG04', name: 'Vulnerabilidades altas tratadas ou formalmente aceitas', isMandatory: true, validator: 'Administrador', rule: 'Aceitação de risco documentada, com justificativa, responsável e prazo.' },
  { id: 'QG05', name: 'Backup pré-deploy realizado', isMandatory: true, validator: 'Administrador/Editor autorizado', rule: 'Backup identificado e armazenado em local protegido.' },
  { id: 'QG06', name: 'Restauração validada', isMandatory: true, validator: 'Administrador/Editor autorizado', rule: 'Teste de restauração documentado.' },
  { id: 'QG07', name: 'Homologação aprovada', isMandatory: true, validator: 'Administrador', rule: 'Evidências e aceite registrados.' },
  { id: 'QG08', name: 'Plano de rollback disponível', isMandatory: true, validator: 'Administrador/Editor autorizado', rule: 'Procedimento conhecido e executável.' },
  { id: 'QG09', name: 'Revisões de SEO, acessibilidade e privacidade realizadas', isMandatory: false, validator: 'Administrador/Editor', rule: 'Pendências e riscos documentados.' },
  { id: 'QG10', name: 'Autorização final de deploy em produção', isMandatory: true, validator: 'Administrador', rule: 'Aprovação explícita registrada no sistema.' }
];
