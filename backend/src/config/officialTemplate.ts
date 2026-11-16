import fs from 'fs';
import path from 'path';

export interface OfficialTaskItem {
  id: string; // T001
  phaseCode: string; // 01
  phaseName: string;
  taskTitle: string;
  description: string;
  isMandatory: boolean;
  suggestedRole: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
}

export interface OfficialPhaseItem {
  code: string;
  number: number;
  name: string;
  objective: string;
  isMandatory: boolean;
  generalCriteria: string;
  tasks: OfficialTaskItem[];
}

export interface QualityGateControl {
  id: string; // QG01
  name: string;
  isMandatory: boolean;
  validator: string;
  rule: string;
}

export const OFFICIAL_QUALITY_GATE_RULES: QualityGateControl[] = [
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

export function parseOfficialTemplateCSV(csvContent: string): {
  phases: OfficialPhaseItem[];
  allTasks: OfficialTaskItem[];
  qualityGateRules: QualityGateControl[];
} {
  const lines = csvContent.split(/\r?\n/);
  const phasesMap = new Map<string, OfficialPhaseItem>();
  const allTasks: OfficialTaskItem[] = [];

  let section: 'HEADER' | 'PHASES' | 'TASKS' | 'ROLES' | 'QUALITY_GATE' | 'PROCESSES' = 'HEADER';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('Código,Fase,Objetivo,Obrigatória,Critério geral de conclusão')) {
      section = 'PHASES';
      continue;
    }
    if (line.startsWith('ID,Código da fase,Fase,Tarefa,Descrição/objetivo')) {
      section = 'TASKS';
      continue;
    }
    if (line.startsWith('Perfil,Permissões sugeridas,Restrições')) {
      section = 'ROLES';
      continue;
    }
    if (line.startsWith('ID,Controle de liberação,Obrigatório,Quem valida,Regra de aprovação')) {
      section = 'QUALITY_GATE';
      continue;
    }
    if (line.startsWith('Processo,Passo,Regra')) {
      section = 'PROCESSES';
      continue;
    }

    if (section === 'PHASES') {
      // Formato: 01,Planejamento e estratégia,"Definir propósito...",Sim,Tarefas aplicáveis...
      const match = line.match(/^(\d{2}),([^,]+),(".*?"|[^,]+),([^,]+),(.*)$/);
      if (match) {
        const code = match[1];
        const name = match[2].trim();
        const objective = match[3].replace(/^"|"$/g, '').trim();
        const isMandatory = match[4].trim().toLowerCase() === 'sim';
        const generalCriteria = match[5].replace(/^"|"$/g, '').trim();

        phasesMap.set(code, {
          code,
          number: parseInt(code, 10),
          name: `${code}. ${name}`,
          objective,
          isMandatory,
          generalCriteria,
          tasks: []
        });
      }
    } else if (section === 'TASKS') {
      // Regex para campos CSV com aspas
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim());

      if (cols.length >= 8 && cols[0].startsWith('T')) {
        const id = cols[0];
        const phaseCode = cols[1];
        const phaseName = cols[2];
        const taskTitle = cols[3].replace(/^"|"$/g, '');
        const description = cols[4].replace(/^"|"$/g, '');
        const obrigatoriedade = cols[5];
        const suggestedRole = cols[6];
        const prioridadeSugerida = cols[7];

        const priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' =
          prioridadeSugerida === 'Alta' ? 'HIGH' :
          prioridadeSugerida === 'Crítica' ? 'URGENT' :
          prioridadeSugerida === 'Baixa' ? 'LOW' : 'MEDIUM';

        const taskItem: OfficialTaskItem = {
          id,
          phaseCode,
          phaseName,
          taskTitle,
          description,
          isMandatory: obrigatoriedade.toLowerCase() === 'sim',
          suggestedRole,
          priority,
          status: 'TODO'
        };

        allTasks.push(taskItem);
        if (phasesMap.has(phaseCode)) {
          phasesMap.get(phaseCode)!.tasks.push(taskItem);
        }
      }
    }
  }

  const phases = Array.from(phasesMap.values()).sort((a, b) => a.number - b.number);
  return { phases, allTasks, qualityGateRules: OFFICIAL_QUALITY_GATE_RULES };
}
