import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Task, Project, Priority, TaskStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal de Criação de Tarefa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newEstimatedHours, setNewEstimatedHours] = useState<number>(4);
  const [creating, setCreating] = useState(false);

  // Modal do Importador
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importProjectId, setImportProjectId] = useState('');
  const [importType, setImportType] = useState<'TEXT' | 'CSV' | 'JSON'>('TEXT');
  const [importContent, setImportContent] = useState('');
  const [importing, setImporting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projsRes] = await Promise.all([
        api.get(`/tasks${selectedProjectId ? `?projectId=${selectedProjectId}` : ''}`),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projsRes.data);
      if (projsRes.data.length > 0 && !newProjectId) {
        setNewProjectId(projsRes.data[0].id);
        setImportProjectId(projsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProjectId) return;

    setCreating(true);
    try {
      await api.post('/tasks', {
        projectId: newProjectId,
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        estimatedHours: Number(newEstimatedHours)
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar tarefa');
    } finally {
      setCreating(false);
    }
  };

  const handleImportTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importProjectId || !importContent.trim()) return;

    setImporting(true);
    try {
      await api.post('/tasks/import', {
        projectId: importProjectId,
        type: importType,
        data: importContent
      });
      setIsImportModalOpen(false);
      setImportContent('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Falha ao importar tarefas');
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    return matchesPriority;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            <span>Gerenciamento de Tarefas & Entregáveis</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Visualização em Kanban e Lista, acompanhamento de horas, subtarefas e importador integrado.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Importar Tarefas</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">Todos os Projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">Todas Prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        {/* Alternador Kanban / Lista */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
            }`}
          >
            Quadro Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
            }`}
          >
            Visualização em Lista
          </button>
        </div>
      </div>

      {/* Conteúdo Kanban */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { status: 'TODO', label: 'A Fazer', color: 'border-t-gray-500' },
            { status: 'IN_PROGRESS', label: 'Em Execução', color: 'border-t-indigo-500' },
            { status: 'REVIEW', label: 'Revisão / Testes', color: 'border-t-amber-500' },
            { status: 'DONE', label: 'Concluídas', color: 'border-t-emerald-500' }
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 border-t-4 ${col.color} shadow-sm space-y-3 min-h-[500px]`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-gray-700 dark:text-gray-300 uppercase pb-2 border-b border-gray-100 dark:border-gray-800">
                  <span>{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 hover:border-indigo-500/50 transition-all text-xs space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`font-bold ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </span>
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{task.estimatedHours || 0}h est.</span>
                        </span>

                        <div className="flex items-center space-x-1">
                          {col.status !== 'TODO' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'TODO')}
                              title="Mover para A Fazer"
                              className="hover:text-white"
                            >
                              &larr;
                            </button>
                          )}
                          {col.status !== 'DONE' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                              title="Avançar Tarefa"
                              className="text-indigo-400 font-bold hover:underline"
                            >
                              Avançar &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização em Lista */
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase text-[10px] font-bold">
                <th className="pb-3 px-3">Tarefa</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Prioridade</th>
                <th className="pb-3 px-3">Horas</th>
                <th className="pb-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                    {t.title}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {t.actualHours || 0} / {t.estimatedHours || 0}h
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleUpdateStatus(t.id, t.status === 'DONE' ? 'TODO' : 'DONE')}
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      {t.status === 'DONE' ? 'Reabrir' : 'Concluir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Criação de Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">Nova Tarefa</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Projeto *</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Ex: Criar componente de checkout"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Descrição</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Horas Estimadas</label>
                  <input
                    type="number"
                    value={newEstimatedHours}
                    onChange={(e) => setNewEstimatedHours(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  {creating ? 'Salvando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 mb-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              <span>Importar Lista de Tarefas Estruturadas</span>
            </h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Selecione o Projeto de Destino</label>
                <select
                  value={importProjectId}
                  onChange={(e) => setImportProjectId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex p-1 bg-gray-900 rounded-xl">
                {(['TEXT', 'CSV', 'JSON'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setImportType(t)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${
                      importType === t ? 'bg-indigo-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    {t === 'TEXT' ? 'Colar Tópicos' : t}
                  </button>
                ))}
              </div>

              <textarea
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                rows={8}
                placeholder="Cole aqui suas tarefas em tópicos..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs text-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportTasks}
                disabled={importing}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                {importing ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
