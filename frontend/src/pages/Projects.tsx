import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  Trash2,
  Lock,
  Globe,
  AlertCircle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project, Priority, ProjectStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Projects: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newDeadline, setNewDeadline] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(true);
  const [importChecklist, setImportChecklist] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);

    try {
      await api.post('/projects', {
        name: newName,
        description: newDescription,
        siteUrl: newSiteUrl || undefined,
        domain: newDomain || undefined,
        priority: newPriority,
        deadline: newDeadline || undefined,
        isPrivate: newIsPrivate,
        importChecklist
      });

      setIsModalOpen(false);
      setNewName('');
      setNewDescription('');
      setNewSiteUrl('');
      setNewDomain('');
      loadProjects();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Erro ao criar projeto');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${name}" e todos os seus dados? Esta ação é irreversível.`)) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Falha ao excluir projeto');
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.domain?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || p.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getStatusBadge = (s: ProjectStatus) => {
    switch (s) {
      case 'PUBLISHED': return { label: 'Publicado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'READY_FOR_PRODUCTION': return { label: 'Pronto p/ Produção', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'AUDITING': return { label: 'Em Auditoria', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'IN_PROGRESS': return { label: 'Em Andamento', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      default: return { label: 'Planejamento', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
            <FolderKanban className="w-6 h-6 text-indigo-500" />
            <span>Gerenciamento de Projetos & Sites</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Controle do ciclo de vida completo: concepção, arquitetura, desenvolvimento, auditoria 360° e deploy.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Projeto</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou domínio..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400">Prioridade:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">Todas</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
      </div>

      {/* Grid de Cards de Projetos */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 p-8">
          <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Nenhum projeto encontrado</h2>
          <p className="text-xs text-gray-500 mt-1">Crie um novo projeto com o Checklist das 17 fases para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => {
            const statusBadge = getStatusBadge(proj.status);
            return (
              <div
                key={proj.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-gray-900 dark:text-white leading-tight group-hover:text-indigo-400 transition-colors">
                          {proj.name}
                        </h2>
                        {proj.domain && (
                          <span className="text-[11px] font-mono text-gray-400">
                            {proj.domain}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {proj.isPrivate && (
                        <span title="Projeto Privado" className="p-1 rounded-md bg-gray-500/10 text-gray-400">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          title="Excluir projeto"
                          className="p-1 text-gray-400 hover:text-rose-500 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {proj.description || 'Sem descrição cadastrada.'}
                  </p>

                  {/* Badges de Status e Prioridade */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(proj.priority)}`}>
                      {proj.priority}
                    </span>
                    {proj.uptimeCheck && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {proj.uptimeCheck.status}
                      </span>
                    )}
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-1 mb-5">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                      <span>Progresso do Site</span>
                      <span className="text-indigo-400 font-bold">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer do Card com Links Rápidos */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{proj._count?.tasks || 0} tarefas</span>
                  </div>

                  <Link
                    to={`/projects/${proj.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group-hover:underline"
                  >
                    <span>Abrir Projeto</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação de Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Criar Novo Projeto</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Projeto / Site *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Ex: Portal Corporativo Beta"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Descrição do Escopo
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Objetivos do site, público e escopo técnico..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    URL do Site (se houver)
                  </label>
                  <input
                    type="url"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    placeholder="https://exemplo.com.br"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Domínio Principal
                  </label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="exemplo.com.br"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Prazo Final
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Opções de Automação do Checklist */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importChecklist}
                    onChange={(e) => setImportChecklist(e.target.checked)}
                    className="rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-indigo-300">
                    Importar automaticamente o Checklist Master (17 Fases Oficiais)
                  </span>
                </label>
                <p className="text-[11px] text-gray-400 pl-5">
                  Cria todas as fases (Planejamento, Arquitetura, SEO, LGPD, Testes, Deploy, Auditoria 360°) e tarefas operacionais correspondentes.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {creating ? 'Criando Projeto...' : 'Salvar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
