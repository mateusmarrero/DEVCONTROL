import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, FileSignature, ShieldAlert, Check } from 'lucide-react';
import { api } from '../services/api';
import { Project, QualityGateRule } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { OFFICIAL_QUALITY_GATE_RULES } from '../types/phases';

export const QualityGate: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [rules, setRules] = useState<QualityGateRule[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [canPublish, setCanPublish] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState(false);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      const projsRes = await api.get('/projects');
      setProjects(projsRes.data);
      const targetId = selectedProjectId || (projsRes.data[0]?.id || '');
      if (targetId) {
        setSelectedProjectId(targetId);
        const qgRes = await api.get(`/quality-gate/project/${targetId}`);
        setRules(qgRes.data.rules || []);
        setApprovals(qgRes.data.approvals || []);
        setCanPublish(qgRes.data.canPublishToProduction || false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleEvaluate = async () => {
    if (!selectedProjectId) return;
    setEvaluating(true);
    try {
      await api.post(`/quality-gate/project/${selectedProjectId}/evaluate`);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleMasterApprove = async () => {
    if (!selectedProjectId) return;
    try {
      await api.post(`/quality-gate/project/${selectedProjectId}/approve`, {
        notes: notes || 'Quality Gate formalmente homologado pelo Administrador.'
      });
      alert('Quality Gate assinado digitalmente com sucesso!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao homologar Quality Gate');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Mecanismo de Liberação Compulsória Oficial (QG01 - QG10)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Quality Gate de Homologação para Produção
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            "Não liberar produção com testes essenciais pendentes, backup/restauração não validados ou vulnerabilidades críticas/altas sem correção ou aceitação formal de risco pelo Administrador."
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
            onClick={handleEvaluate}
            disabled={evaluating}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>Reavaliar Regras</span>
          </button>
        </div>
      </div>

      {/* Box de Ação Master (Apenas ADMIN) */}
      {isAdmin && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/30 to-[#0E131F] border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Soberania do Administrador Master
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              Homologação Definitiva de Publicação (QG10)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {canPublish
                ? 'Todos os 10 controles de liberação foram satisfeitos. Você pode assinar a liberação.'
                : 'Existem requisitos pendentes. Resolva os itens abaixo antes de aprovar.'}
            </p>
          </div>

          <button
            onClick={handleMasterApprove}
            disabled={!canPublish}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-600/30 transition-all flex items-center space-x-2 disabled:opacity-40 shrink-0"
          >
            <FileSignature className="w-4 h-4" />
            <span>Assinar Homologação do Projeto</span>
          </button>
        </div>
      )}

      {/* Matriz das 10 Regras Oficiais (QG01 a QG10) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
          <span>Os 10 Controles de Liberação Oficiais</span>
          <span className="text-xs font-mono text-indigo-400">QG01 a QG10</span>
        </h2>

        <div className="space-y-3">
          {rules.map((rule) => {
            const qgMeta = OFFICIAL_QUALITY_GATE_RULES.find(q => rule.ruleKey.includes(q.id));
            return (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl ${rule.isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {rule.isPassed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white block">
                        {rule.ruleName}
                      </span>
                      {qgMeta && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400">
                          Validador: {qgMeta.validator}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-0.5 block">
                      {rule.details || (qgMeta ? qgMeta.rule : 'Verificação automatizada.')}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                  rule.isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {rule.isPassed ? 'HOMOLOGADO' : 'BLOQUEANTE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
