import React, { useState, useEffect } from 'react';
import { Rocket, Play, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Clock, GitCommit } from 'lucide-react';
import { api } from '../services/api';
import { Deployment, Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Deployments: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [deploys, setDeploys] = useState<Deployment[]>([]);
  const [env, setEnv] = useState<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'>('DEVELOPMENT');
  const [version, setVersion] = useState('v1.0.1');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const projsRes = await api.get('/projects');
      setProjects(projsRes.data);
      const targetId = selectedProjectId || (projsRes.data[0]?.id || '');
      if (targetId) {
        setSelectedProjectId(targetId);
        const depRes = await api.get(`/deploy/project/${targetId}`);
        setDeploys(depRes.data);
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

  const handleTriggerDeploy = async () => {
    if (!selectedProjectId) return;
    try {
      await api.post('/deploy', {
        projectId: selectedProjectId,
        environment: env,
        version
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao publicar deploy');
    }
  };

  const handleRollback = async (deployId: string) => {
    try {
      await api.post(`/deploy/${deployId}/rollback`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Falha ao reverter deploy');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Rocket className="w-4 h-4" />
            <span>Pipelines de Publicação & Esteira CI/CD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Controle de Deploy & Histórico de Versões
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestão de ambientes (Dev, Staging, Prod), snapshots automáticos de banco e rollback com 1 clique.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={env}
            onChange={(e) => setEnv(e.target.value as any)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="DEVELOPMENT">Desenvolvimento</option>
            <option value="STAGING">Homologação</option>
            <option value="PRODUCTION">Produção</option>
          </select>

          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-24 bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono"
            placeholder="v1.0.0"
          />

          <button
            onClick={handleTriggerDeploy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-4 h-4" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {deploys.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 p-6">
            <Rocket className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Nenhum deploy registrado para este projeto</h3>
          </div>
        ) : (
          deploys.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-indigo-400">{d.version}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    d.environment === 'PRODUCTION' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    d.environment === 'STAGING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {d.environment}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center space-x-1 font-mono">
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>{d.commitHash}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Disparado por {d.triggeredBy?.name || 'Administrador'} em {new Date(d.createdAt).toLocaleString()}
                </p>
                {d.resultLog && (
                  <pre className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 font-mono text-[11px] text-gray-300 overflow-x-auto">
                    {d.resultLog}
                  </pre>
                )}
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{d.status}</span>
                </span>
                {isAdmin && d.rollbackAvailable && (
                  <button
                    onClick={() => handleRollback(d.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
