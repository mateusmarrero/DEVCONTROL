import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  ListOrdered,
  ShieldAlert,
  FileCode2,
  Rocket,
  ShieldCheck,
  Lock,
  Globe,
  ExternalLink,
  Plus,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  Sparkles,
  Save,
  Trash2,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Project, ChecklistPhase, Task, Vulnerability, Deployment, QualityGateRule, DocumentationDoc } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, isManager } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'phases' | 'tasks' | 'security' | 'docs' | 'deploy' | 'quality' | 'vault'>('phases');
  const [loading, setLoading] = useState(true);

  // Dados das abas
  const [phases, setPhases] = useState<ChecklistPhase[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [deploys, setDeploys] = useState<Deployment[]>([]);
  const [qualityRules, setQualityRules] = useState<QualityGateRule[]>([]);
  const [canPublish, setCanPublish] = useState<boolean>(false);
  const [docs, setDocs] = useState<DocumentationDoc[]>([]);
  const [secrets, setSecrets] = useState<any[]>([]);

  // Estados de Modais & Interações
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'TEXT' | 'CSV' | 'JSON'>('TEXT');
  const [importContent, setImportContent] = useState('');
  const [importing, setImporting] = useState(false);

  // Estado do Editor de Texto Interno
  const [activeDoc, setActiveDoc] = useState<DocumentationDoc | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [savingDoc, setSavingDoc] = useState(false);

  // Estado do Cofre de Credenciais
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');

  // Deploy Form
  const [deployEnv, setDeployEnv] = useState<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'>('DEVELOPMENT');
  const [deployVersion, setDeployVersion] = useState('v1.0.1');

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projRes, phasesRes, tasksRes, secRes, depRes, qgRes, docsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/checklist/project/${id}`),
        api.get(`/tasks?projectId=${id}`),
        api.get(`/security/project/${id}`),
        api.get(`/deploy/project/${id}`),
        api.get(`/quality-gate/project/${id}`),
        api.get(`/docs/project/${id}`)
      ]);

      setProject(projRes.data);
      setPhases(phasesRes.data);
      setTasks(tasksRes.data);
      setVulnerabilities(secRes.data.vulnerabilities || []);
      setDeploys(depRes.data);
      setQualityRules(qgRes.data.rules || []);
      setCanPublish(qgRes.data.canPublishToProduction || false);
      setDocs(docsRes.data);

      if (docsRes.data.length > 0) {
        setActiveDoc(docsRes.data[0]);
        setDocTitle(docsRes.data[0].title);
        setDocContent(docsRes.data[0].content);
      }

      if (isAdmin) {
        try {
          const secretsRes = await api.get(`/projects/${id}/secrets`);
          setSecrets(secretsRes.data);
        } catch {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  // Interações de Checklist
  const handleToggleChecklistTask = async (taskId: string, currentVal: boolean) => {
    try {
      await api.put(`/checklist/tasks/${taskId}`, { isCompleted: !currentVal });
      const phasesRes = await api.get(`/checklist/project/${id}`);
      setPhases(phasesRes.data);
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovePhase = async (phaseId: string) => {
    try {
      await api.post(`/checklist/phases/${phaseId}/approve`, {
        approvalNotes: 'Fase homologada conforme critérios de auditoria.'
      });
      loadProjectData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao aprovar fase');
    }
  };

  // Importador de Tarefas
  const handleImportTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !importContent.trim()) return;

    setImporting(true);
    try {
      await api.post('/tasks/import', {
        projectId: id,
        type: importType,
        data: importContent
      });
      setIsImportModalOpen(false);
      setImportContent('');
      loadProjectData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Falha ao importar tarefas');
    } finally {
      setImporting(false);
    }
  };

  // Salvar Documento / Editor Interno
  const handleSaveDoc = async () => {
    if (!id || !docTitle) return;
    setSavingDoc(true);
    try {
      if (activeDoc) {
        const res = await api.put(`/docs/${activeDoc.id}`, {
          title: docTitle,
          content: docContent
        });
        setActiveDoc(res.data);
      } else {
        const res = await api.post('/docs', {
          projectId: id,
          title: docTitle,
          content: docContent,
          category: 'TECHNICAL'
        });
        setActiveDoc(res.data);
      }
      const docsRes = await api.get(`/docs/project/${id}`);
      setDocs(docsRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar documento');
    } finally {
      setSavingDoc(false);
    }
  };

  // Disparar Deploy
  const handleTriggerDeploy = async () => {
    if (!id) return;
    try {
      await api.post('/deploy', {
        projectId: id,
        environment: deployEnv,
        version: deployVersion
      });
      loadProjectData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao executar deploy');
    }
  };

  // Salvar Credencial no Cofre
  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newSecretKey || !newSecretValue) return;

    try {
      await api.post(`/projects/${id}/secrets`, {
        key: newSecretKey,
        value: newSecretValue
      });
      setNewSecretKey('');
      setNewSecretValue('');
      const secretsRes = await api.get(`/projects/${id}/secrets`);
      setSecrets(secretsRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar credencial');
    }
  };

  // Aprovação Master do Quality Gate
  const handleApproveQualityGate = async () => {
    if (!id) return;
    try {
      await api.post(`/quality-gate/project/${id}/approve`, {
        notes: 'Quality Gate aprovado pelo Administrador Master. Projeto liberado para produção definitiva.'
      });
      alert('Quality Gate assinado e aprovado com sucesso!');
      loadProjectData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao aprovar Quality Gate');
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner do Projeto */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {project.isPrivate && (
                  <span className="p-1 rounded-md bg-gray-500/10 text-gray-400 text-xs flex items-center space-x-1" title="Projeto Privado">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-400 mt-0.5">
                {project.domain && <span className="font-mono">{project.domain}</span>}
                {project.siteUrl && (
                  <a href={project.siteUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-0.5">
                    <span>Visitar Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Badges de Status e Uptime */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[11px] font-bold text-gray-400 block">Progresso Geral</span>
              <span className="text-xl font-black text-indigo-400">{project.progress}%</span>
            </div>
            <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Abas de Navegação do Projeto */}
        <div className="flex items-center space-x-1 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 overflow-x-auto">
          {[
            { id: 'phases', label: '17 Fases (Checklist Master)', icon: ListOrdered },
            { id: 'tasks', label: 'Tarefas & Importador', icon: CheckSquare },
            { id: 'security', label: 'Central de Segurança', icon: ShieldAlert },
            { id: 'docs', label: 'Documentação & Editor', icon: FileCode2 },
            { id: 'deploy', label: 'Controle de Deploy', icon: Rocket },
            { id: 'quality', label: 'Quality Gate', icon: ShieldCheck },
            ...(isAdmin ? [{ id: 'vault', label: 'Cofre (.env)', icon: Lock }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* ABA 1: AS 17 FASES DO CHECKLIST MASTER */}
      {activeTab === 'phases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <ListOrdered className="w-5 h-5 text-indigo-500" />
              <span>Checklist Master — As 17 Fases Oficiais do Ciclo de Vida</span>
            </h2>
            <span className="text-xs text-gray-400 font-semibold">
              Progresso calculado automaticamente com base nas tarefas
            </span>
          </div>

          <div className="space-y-3">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Fase {phase.phaseNumber.toString().padStart(2, '0')}
                      </span>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {phase.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          phase.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : phase.status === 'IN_PROGRESS'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}
                      >
                        {phase.status === 'COMPLETED' ? 'Homologada' : phase.status === 'IN_PROGRESS' ? 'Em Execução' : 'Não Iniciada'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {phase.description}
                    </p>
                  </div>

                  {isManager && phase.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleApprovePhase(phase.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center space-x-1 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Homologar Fase</span>
                    </button>
                  )}
                </div>

                {/* Sub-itens de auditoria da Fase */}
                {phase.checklistTasks && phase.checklistTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-2">
                    {phase.checklistTasks.map((ct) => (
                      <div
                        key={ct.id}
                        className="flex items-start justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 text-xs"
                      >
                        <label className="flex items-start space-x-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={ct.isCompleted}
                            onChange={() => handleToggleChecklistTask(ct.id, ct.isCompleted)}
                            className="mt-0.5 rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className={`font-semibold ${ct.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              {ct.title}
                            </span>
                            {ct.criteria && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Critério: {ct.criteria}
                              </p>
                            )}
                          </div>
                        </label>

                        {ct.evidenceRequired && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Evidência Obrigatória
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: TAREFAS & IMPORTADOR ESTRUTURADO */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-indigo-500" />
              <span>Gerenciamento Operacional de Tarefas ({tasks.length})</span>
            </h2>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Importar Lista de Tarefas (CSV / JSON / Texto)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Coluna A Fazer */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
                <span>A Fazer (TODO)</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400">
                  {tasks.filter((t) => t.status === 'TODO').length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks.filter((t) => t.status === 'TODO').map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                    <span className="font-bold text-gray-900 dark:text-white block">{task.title}</span>
                    <span className="text-[10px] text-gray-400 block">{task.description}</span>
                    <div className="flex items-center justify-between pt-2 text-[10px] text-gray-500">
                      <span>Prioridade: {task.priority}</span>
                      <button
                        onClick={async () => {
                          await api.put(`/tasks/${task.id}`, { status: 'IN_PROGRESS' });
                          loadProjectData();
                        }}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        Iniciar &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna Em Andamento */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-indigo-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
                <span>Em Execução</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                  {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks.filter((t) => t.status === 'IN_PROGRESS').map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-1">
                    <span className="font-bold text-gray-900 dark:text-white block">{task.title}</span>
                    <span className="text-[10px] text-gray-400 block">{task.description}</span>
                    <div className="flex items-center justify-between pt-2 text-[10px]">
                      <span className="text-indigo-400 font-bold">{task.actualHours || 0}h dedicadas</span>
                      <button
                        onClick={async () => {
                          await api.put(`/tasks/${task.id}`, { status: 'DONE' });
                          loadProjectData();
                        }}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        Concluir &check;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna Concluídas */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-emerald-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-gray-800">
                <span>Concluídas</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  {tasks.filter((t) => t.status === 'DONE').length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks.filter((t) => t.status === 'DONE').map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-800/50 text-xs space-y-1 opacity-80">
                    <span className="font-bold line-through text-gray-400 block">{task.title}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">&check; Finalizada</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CENTRAL DE SEGURANÇA */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Auditorias de Segurança OWASP & Análise de Vulnerabilidades</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vulnerabilities.map((v) => (
              <div key={v.id} className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      v.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      v.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    }`}>
                      {v.severity} • {v.category}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1.5">{v.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.status === 'MITIGATED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {v.status === 'MITIGATED' ? 'Mitigada' : 'Em Aberto'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">{v.description}</p>
                {v.mitigationPlan && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs">
                    <span className="font-bold text-gray-400 block text-[10px] uppercase">Plano de Mitigação:</span>
                    <p className="text-gray-300 mt-0.5">{v.mitigationPlan}</p>
                  </div>
                )}

                {v.status !== 'MITIGATED' && (
                  <button
                    onClick={async () => {
                      await api.put(`/security/vulnerabilities/${v.id}`, { status: 'MITIGATED' });
                      loadProjectData();
                    }}
                    className="w-full py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                  >
                    Marcar como Mitigada
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: DOCUMENTAÇÃO & EDITOR DE TEXTO INTERNO */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
              <FileCode2 className="w-5 h-5 text-indigo-500" />
              <span>Editor de Texto Interno & Registros Arquiteturais (ADRs)</span>
            </h2>
            <button
              onClick={() => {
                setActiveDoc(null);
                setDocTitle('Novo Documento Técnico');
                setDocContent('# Título\n\nDescreva a documentação ou decisão arquitetural...');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Artigo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Lista Lateral de Documentos */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Artigos Salvos</span>
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDoc(d);
                    setDocTitle(d.title);
                    setDocContent(d.content);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeDoc?.id === d.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="block truncate">{d.title}</span>
                  <span className="text-[10px] opacity-75 block">v{d.version} • {new Date(d.updatedAt).toLocaleDateString()}</span>
                </button>
              ))}
            </div>

            {/* Painel do Editor de Texto */}
            <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Título do Documento..."
                  className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white focus:outline-none border-b border-gray-200 dark:border-gray-800 pb-1"
                />
                <button
                  onClick={handleSaveDoc}
                  disabled={savingDoc}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shrink-0 shadow-lg shadow-indigo-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingDoc ? 'Salvando...' : 'Salvar Documento'}</span>
                </button>
              </div>

              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                rows={14}
                className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                placeholder="Escreva em Markdown formatado..."
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: CONTROLE DE DEPLOY */}
      {activeTab === 'deploy' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-indigo-500" />
                <span>Esteira de Deploy & Publicação de Sites</span>
              </h2>
              <p className="text-xs text-gray-400">
                Regra: Deploy em Produção exige autorização do Administrador e aprovação do Quality Gate.
              </p>
            </div>

            {/* Painel de Disparo de Deploy */}
            <div className="flex items-center space-x-2">
              <select
                value={deployEnv}
                onChange={(e) => setDeployEnv(e.target.value as any)}
                className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-200"
              >
                <option value="DEVELOPMENT">Desenvolvimento</option>
                <option value="STAGING">Homologação</option>
                <option value="PRODUCTION">Produção Definitiva</option>
              </select>

              <input
                type="text"
                value={deployVersion}
                onChange={(e) => setDeployVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-24 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-200 font-mono"
              />

              <button
                onClick={handleTriggerDeploy}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Publicar Deploy</span>
              </button>
            </div>
          </div>

          {/* Histórico de Deploys */}
          <div className="space-y-3">
            {deploys.map((dep) => (
              <div
                key={dep.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{dep.version}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {dep.environment}
                    </span>
                    <span className="text-xs text-gray-400">commit: <code className="font-mono text-gray-300">{dep.commitHash}</code></span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Disparado por {dep.triggeredBy?.name || 'Administrador'} em {new Date(dep.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Deploy com Sucesso</span>
                  </span>
                  {isAdmin && dep.rollbackAvailable && (
                    <button
                      onClick={async () => {
                        await api.post(`/deploy/${dep.id}/rollback`);
                        loadProjectData();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 6: QUALITY GATE */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Quality Gate Obrigatório para Produção</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Nenhum projeto pode ser publicado em Produção sem 100% dos requisitos mandatórios cumpridos.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleApproveQualityGate}
                disabled={!canPublish}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40"
              >
                👑 Assinar Homologação Master
              </button>
            )}
          </div>

          <div className="space-y-2">
            {qualityRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${rule.isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {rule.isPassed ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">{rule.ruleName}</span>
                    <span className="text-[11px] text-gray-400">{rule.details || 'Verificação automatizada.'}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  rule.isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {rule.isPassed ? 'APROVADO' : 'PENDENTE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 7: COFRE DE CREDENCIAIS (.ENV VAULT) - ADMIN ONLY */}
      {activeTab === 'vault' && isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                <span>Cofre Seguro de Variáveis & Credenciais de Produção (.env Vault)</span>
              </h2>
              <p className="text-xs text-gray-400">
                Acesso estritamente restrito ao Administrador Master. Protegido com criptografia.
              </p>
            </div>
          </div>

          {/* Form de Cadastro de Nova Variável */}
          <form onSubmit={handleSaveSecret} className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newSecretKey}
              onChange={(e) => setNewSecretKey(e.target.value)}
              placeholder="NOME_DA_VARIAVEL (ex: STRIPE_SECRET_KEY)"
              required
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
            <input
              type="password"
              value={newSecretValue}
              onChange={(e) => setNewSecretValue(e.target.value)}
              placeholder="Valor secreto..."
              required
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Guardar no Cofre
            </button>
          </form>

          {/* Lista de Segredos */}
          <div className="space-y-2">
            {secrets.map((sec) => (
              <div
                key={sec.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 text-xs font-mono"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-indigo-400">{sec.key}</span>
                  <span className="text-gray-500">=</span>
                  <span className="text-gray-400">••••••••••••••••••••</span>
                </div>
                <button
                  onClick={async () => {
                    await api.delete(`/projects/${id}/secrets/${sec.id}`);
                    const secretsRes = await api.get(`/projects/${id}/secrets`);
                    setSecrets(secretsRes.data);
                  }}
                  className="text-gray-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DO IMPORTADOR ESTRUTURADO DE TAREFAS */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2 mb-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              <span>Importar Tarefas para o Andamento do Projeto</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Cole sua lista de tarefas em tópicos, CSV ou JSON para inserção transacional no MariaDB 10.11 com recálculo automático de progresso.
            </p>

            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setImportType('TEXT')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  importType === 'TEXT' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
                }`}
              >
                Colar Texto / Tópicos
              </button>
              <button
                type="button"
                onClick={() => setImportType('CSV')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  importType === 'CSV' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
                }`}
              >
                Planilha CSV
              </button>
              <button
                type="button"
                onClick={() => setImportType('JSON')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  importType === 'JSON' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
                }`}
              >
                Formato JSON
              </button>
            </div>

            <form onSubmit={handleImportTasks} className="space-y-4">
              <textarea
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                rows={8}
                required
                placeholder={
                  importType === 'TEXT'
                    ? '- Configurar SSL no domínio\n- Criar banner promocional\n- Testar checkout com Stripe\n- Validar consentimento de cookies LGPD'
                    : importType === 'CSV'
                    ? 'Título;Descrição;Prioridade;Horas\nCriar Header;Layout responsivo;HIGH;4\nConfigurar MariaDB;Persistência 10.11;URGENT;3'
                    : '[\n  { "title": "Criar componente", "priority": "HIGH" },\n  { "title": "Revisar SEO", "priority": "MEDIUM" }\n]'
                }
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 text-xs font-mono text-gray-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              ></textarea>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {importing ? 'Importando...' : 'Processar e Importar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
