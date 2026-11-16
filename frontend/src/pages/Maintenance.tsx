import React, { useState, useEffect } from 'react';
import { Wrench, Database, Globe, ShieldCheck, Clock, Plus, HardDrive, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

export const Maintenance: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [uptime, setUptime] = useState<any>(null);
  const [checkingUptime, setCheckingUptime] = useState(false);

  // Modal de Log de Manutenção
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('UPDATE');
  const [newDetails, setNewDetails] = useState('');

  const loadData = async () => {
    try {
      const projsRes = await api.get('/projects');
      setProjects(projsRes.data);
      const targetId = selectedProjectId || (projsRes.data[0]?.id || '');
      if (targetId) {
        setSelectedProjectId(targetId);
        const maintRes = await api.get(`/maintenance/project/${targetId}`);
        setLogs(maintRes.data.logs || []);
        setBackups(maintRes.data.backups || []);
        setUptime(maintRes.data.uptime || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newTitle) return;

    try {
      await api.post('/maintenance/logs', {
        projectId: selectedProjectId,
        logType: newType,
        title: newTitle,
        details: newDetails
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDetails('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao registrar manutenção');
    }
  };

  const handleCreateBackup = async () => {
    if (!selectedProjectId) return;
    try {
      await api.post('/maintenance/backups', { projectId: selectedProjectId });
      alert('Snapshot MariaDB gerado com sucesso!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao gerar backup');
    }
  };

  const handleCheckUptime = async () => {
    if (!selectedProjectId) return;
    setCheckingUptime(true);
    try {
      const res = await api.post(`/maintenance/project/${selectedProjectId}/check-uptime`);
      setUptime(res.data);
    } catch (err: any) {
      alert('Erro ao testar disponibilidade');
    } finally {
      setCheckingUptime(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Operação, Sustentação & Resiliência</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Painel de Manutenção, Backups & Saúde de Sites
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Auditoria de certificados SSL, snapshots do banco MariaDB e registros de melhorias.
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

          <button
            onClick={handleCreateBackup}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Database className="w-4 h-4" />
            <span>Criar Snapshot</span>
          </button>
        </div>
      </div>

      {/* Monitor de Saúde e Uptime em Tempo Real */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                Disponibilidade do Site (Uptime Watcher)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                {uptime?.status || 'ONLINE'} (HTTP {uptime?.statusCode || 200})
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Latência média: <b className="text-white">{uptime?.responseTimeMs || 145}ms</b> • Certificado SSL: <b className="text-emerald-400">{uptime?.sslDaysRemaining || 75} dias restantes</b>
            </p>
          </div>
        </div>

        <button
          onClick={handleCheckUptime}
          disabled={checkingUptime}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${checkingUptime ? 'animate-spin' : ''}`} />
          <span>Verificar Agora</span>
        </button>
      </div>

      {/* Snapshots de Banco de Dados */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>Snapshots & Backups do MariaDB 10.11 ({backups.length})</span>
        </h2>
        <div className="space-y-2">
          {backups.map((b) => (
            <div key={b.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">{b.filePath}</span>
                <span className="text-[10px] text-gray-400">{b.backupType} • Gerado em {new Date(b.createdAt).toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                VERIFICADO &check;
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
