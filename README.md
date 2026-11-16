# DEVCONTROL 1.0 — Hub Privado de Gestão de Projetos & Sites

Plataforma profissional de engenharia de software e gestão do ciclo de vida completo de sites (planejamento, arquitetura, desenvolvimento frontend/backend, conformidade LGPD, segurança OWASP, deploy, monitoramento e auditoria 360°).

---

## 🚀 Arquitetura e Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts.
- **Backend**: Node.js + Fastify + Prisma ORM + TypeScript rigoroso.
- **Banco de Dados**: MariaDB 10.11 nativo/portátil dedicado com persistência transacional ACID.
- **Design System**: Interface SaaS Premium com **tema escuro nativo como padrão** e alternância opcional para tema claro.
- **Segurança**: Fastify Helmet, CORS restrito, Rate Limiting, senhas com Hash Bcrypt, JWT assinado, RBAC em todas as rotas e proteção contra OWASP Top 10 (SQLi, XSS, CSRF, IDOR/BOLA).

---

## 📦 Módulos Implementados

1. **Dashboard Executivo**:
   - Total de projetos, projetos em andamento e concluídos.
   - Tarefas pendentes e atrasadas.
   - Central de vulnerabilidades abertas e críticas.
   - Gráficos interativos de tarefas por status e prioridade.
   - Monitor de sites em tempo real com indicador de Uptime e dias restantes de expiração de SSL.
   - Trilha de auditoria (`AuditLog`) em tempo real.

2. **Gerenciamento de Projetos**:
   - Criação com importação automática das 17 fases e tarefas operacionais.
   - Edição, exclusão (exclusiva do Administrador), controle de privacidade e membros.
   - Cálculo de progresso automático baseado nas tarefas concluídas.

3. **Gerenciamento de Tarefas & Importador**:
   - Visualização em **Quadro Kanban** e **Lista organizada**.
   - Subtarefas, comentários, dependências e apontamento de horas.
   - **Módulo de Importação Estruturada**: Suporte a importação via upload ou colagem de **CSV**, **JSON** e **Checklist em tópicos de texto livre**.

4. **Checklist Master (17 Fases Oficiais)**:
   - 01. Planejamento e estratégia
   - 02. Arquitetura e estrutura
   - 03. Planejamento técnico
   - 04. Desenvolvimento frontend
   - 05. Desenvolvimento backend
   - 06. Segurança da informação
   - 07. SEO e indexação
   - 08. Desempenho e velocidade
   - 09. LGPD e conformidade legal
   - 10. Monetização
   - 11. Testes e homologação
   - 12. Backup e recuperação
   - 13. Preparação para produção
   - 14. Deploy e publicação
   - 15. Monitoramento e manutenção
   - 16. Evolução do projeto
   - 17. Auditoria final 360°
   - Critérios de aceitação e registro de evidências obrigatórias por fase.

5. **Central de Segurança OWASP**:
   - Painel de auditorias OWASP Top 10.
   - Gestão de vulnerabilidades por severidade (Crítica, Alta, Média, Baixa).
   - Planos de mitigação documentados e registro de evidências.

6. **Documentação & Editor de Texto Interno**:
   - Editor integrado com suporte a Markdown, decisões arquiteturais (ADRs), manuais operacionais e versionamento automático.

7. **Controle de Deploy**:
   - Ambientes: Desenvolvimento, Homologação e Produção.
   - **Regra de Segurança Inegociável**: Deploy em Produção bloqueado para colaboradores e restrito ao Administrador com aprovação compulsória do Quality Gate.
   - Snapshots automáticos de banco e Rollback com 1 clique.

8. **Manutenção & Uptime**:
   - Uptime Watcher e verificador de certificado SSL do domínio.
   - Geração e catálogo de snapshots do banco de dados MariaDB 10.11.

9. **Quality Gate de Produção**:
   - Matriz compulsória de liberação: testes funcionais, auditoria de segurança, zero vulnerabilidades críticas, backup validado e autorização de publicação.
   - Assinatura formal pelo Administrador Master.

10. **Usuários, Convites & RBAC**:
    - 5 Perfis de Acesso: Administrador Master, Gerente, Desenvolvedor, Auditor 360° e Visualizador.
    - Sistema privado de geração de convites por token único.
    - Proteção da conta Master contra auto-promoção de colaboradores e exclusão indevida.
    - **Cofre Seguro (.env Vault)**: Armazenamento criptografado de credenciais de produção acessíveis unicamente pelo Administrador.

---

## 🔑 Credenciais Padrão de Homologação

| Perfil | E-mail | Senha Padrão |
| :--- | :--- | :--- |
| **👑 Administrador Master** | `admin@devcontrol.io` | `DevControl@2026` |
| **💼 Gerente** | `gerente@devcontrol.io` | `DevControl@2026` |
| **💻 Desenvolvedor** | `dev@devcontrol.io` | `DevControl@2026` |
| **🛡️ Auditor 360°** | `auditor@devcontrol.io` | `DevControl@2026` |
| **👁️ Visualizador** | `leitor@devcontrol.io` | `DevControl@2026` |

---

## 🛠️ Como Iniciar a Plataforma

Para iniciar os serviços completos (MariaDB 10.11, Backend Fastify e Frontend React):

1. **Iniciar MariaDB 10.11**:
   ```powershell
   & "database\mariadb-10.11\bin\mysqld.exe" --defaults-file="database\my.ini" --console
   ```

2. **Iniciar Backend**:
   ```powershell
   cd backend
   npm run dev
   ```
   *Servidor disponível em: `http://localhost:4000`*

3. **Iniciar Frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```
   *Interface disponível em: `http://localhost:5173`*
