import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Rocket,
  Activity,
  ArrowUpRight,
  Globe,
  Database,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import { ActivityLog } from '../types';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.get('/dashboard/metrics');
        setData(res.data);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const statusColors: Record<string, string> = {
    TODO: '#64748b',
    IN_PROGRESS: '#6366f1',
    REVIEW: '#f59e0b',
    DONE: '#10b981'
  };

  const priorityColors: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#6366f1',
    HIGH: '#f59e0b',
    URGENT: '#ef4444'
  };

  const cards = [
    { label: 'Total de Projetos', value: kpis.totalProjects, icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Projetos Ativos', value: kpis.inProgressProjects, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Tarefas Pendentes', value: kpis.pendingTasks, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Tarefas Concluídas', value: (kpis.totalTasks - kpis.pendingTasks), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Vulnerabilidades', value: kpis.openVulnerabilities, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Auditorias 360°', value: '17 Fases', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>DEVCONTROL Engine v1.0 • MariaDB 10.11</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Painel Executivo de Engenharia
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visão consolidada de sites, checklists, auditorias de segurança e pipelines de deploy.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <a
            href="/projects"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
          >
            <span>Gerenciar Projetos</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Grid de Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {c.label}
                </span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gráficos e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de Tarefas por Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Tarefas por Status</span>
          </h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.tasksByStatus || []}>
                <XAxis dataKey="status" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Prioridade */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Volume por Prioridade</span>
          </h2>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.tasksByPriority || []}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {(data?.tasksByPriority || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={priorityColors[entry.priority] || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projetos & Uptime Monitor */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Monitor de Sites & Uptime</span>
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-60">
            {data?.activeProjects?.map((proj: any) => (
              <a
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="block p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                    {proj.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {proj.uptimeCheck?.status || 'ONLINE'} • {proj.uptimeCheck?.responseTimeMs || 120}ms
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span>Progresso: {proj.progress}%</span>
                  <span>SSL: {proj.uptimeCheck?.sslDaysRemaining || 85} dias restantes</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Trilha de Atividades Recentes */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span>Atividades e Trilha de Auditoria Recentes</span>
        </h2>
        <div className="space-y-3">
          {data?.recentActivities?.map((log: ActivityLog) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 text-xs"
            >
              <div className="flex items-center space-x-3 truncate">
                <img
                  src={log.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={log.user?.name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover border border-gray-300 dark:border-gray-700"
                />
                <div className="truncate">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {log.user?.name || 'Sistema'}
                  </span>{' '}
                  <span className="text-gray-500 dark:text-gray-400">
                    executou <code className="text-indigo-400 font-mono text-[11px]">{log.action}</code>
                  </span>
                  {log.project && (
                    <span className="ml-1 text-gray-400">no projeto <b className="text-gray-300">{log.project.name}</b></span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
