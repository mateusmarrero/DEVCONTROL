import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Bug, Lock, FileText, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import { Vulnerability, Project } from '../types';

export const Security: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, critical: 0, high: 0, medium: 0, low: 0, mitigated: 0 });
  const [loading, setLoading] = useState(true);

  // Modal para reportar vulnerabilidade
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newCategory, setNewCategory] = useState('SQLI');
  const [newEvidence, setNewEvidence] = useState('');
  const [newPlan, setNewPlan] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const projsRes = await api.get('/projects');
      setProjects(projsRes.data);

      const targetId = selectedProjectId || (projsRes.data[0]?.id || '');
      if (targetId) {
        setSelectedProjectId(targetId);
        const secRes = await api.get(`/security/project/${targetId}`);
        setVulnerabilities(secRes.data.vulnerabilities || []);
        setSummary(secRes.data.summary || {});
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

  const handleCreateVuln = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newTitle) return;

    try {
      await api.post('/security/vulnerabilities', {
        projectId: selectedProjectId,
        title: newTitle,
        description: newDesc,
        severity: newSeverity,
        category: newCategory,
        evidence: newEvidence,
        mitigationPlan: newPlan
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao registrar vulnerabilidade');
    }
  };

  const owaspCategories = [
    { key: 'SQLI', name: 'SQL Injection', desc: 'Prevenção via ORM Prisma tipado & Prepared Statements' },
    { key: 'XSS', name: 'Cross-Site Scripting (XSS)', desc: 'Escape de renderização React & Content-Security-Policy' },
    { key: 'CSRF', name: 'CSRF & SameSite', desc: 'Cookies SameSite=Strict & Cabeçalhos de Origem' },
    { key: 'IDOR_BOLA', name: 'IDOR / BOLA', desc: 'Validação de Propriedade do Recurso no Backend' },
    { key: 'AUTH', name: 'Autenticação Quebrada', desc: 'Hash Bcrypt/Argon2 & Rate Limiting de IPs' },
    { key: 'SESSION', name: 'Controle de Sessões', desc: 'JWT assinado & Revogação de Sessão em Banco' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#111827] to-[#0E131F] border border-rose-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Central de Segurança OWASP & Hardening</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Auditoria Técnica de Segurança & Vulnerabilidades
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestão de vetores de ataque, planos de mitigação e bloqueio mandatório para publicação.
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
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-1.5"
          >
            <Bug className="w-4 h-4" />
            <span>Reportar Vulnerabilidade</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas de Vulnerabilidade */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-400 uppercase">Críticas em Aberto</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{summary.critical}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-400 uppercase">Altas em Aberto</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{summary.high}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-400 uppercase">Médias / Baixas</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">{summary.medium + summary.low}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-400 uppercase">Mitigadas</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{summary.mitigated}</p>
        </div>
      </div>

      {/* Vetores OWASP Top 10 */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Categorias de Inspeção Obrigatória (OWASP Top 10)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {owaspCategories.map((c) => (
            <div key={c.key} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs">
              <span className="font-bold text-indigo-400 block">{c.name}</span>
              <p className="text-[11px] text-gray-400 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Vulnerabilidades */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Inventário de Vulnerabilidades Reportadas
        </h2>

        {vulnerabilities.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 p-6">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Nenhuma vulnerabilidade reportada</h3>
            <p className="text-xs text-gray-400 mt-1">O projeto está em conformidade com as regras de segurança auditadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vulnerabilities.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
              >
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

                <p className="text-xs text-gray-400">{v.description}</p>
                {v.mitigationPlan && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs">
                    <span className="font-bold text-gray-400 block text-[10px] uppercase">Plano de Mitigação:</span>
                    <p className="text-gray-300 mt-0.5">{v.mitigationPlan}</p>
                  </div>
                )}

                {v.status !== 'MITIGATED' && (
                  <button
                    onClick={async () => {
                      await api.put(`/security/vulnerabilities/${v.id}`, { status: 'MITIGATED' });
                      loadData();
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                  >
                    Marcar como Mitigada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Reportar Vulnerabilidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-4">Reportar Falha de Segurança</h3>
            <form onSubmit={handleCreateVuln} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Título do Achado *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Ex: Falha de sanitização no parâmetro search"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Severidade</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="SQLI">SQL Injection</option>
                    <option value="XSS">XSS</option>
                    <option value="CSRF">CSRF</option>
                    <option value="IDOR_BOLA">IDOR / BOLA</option>
                    <option value="AUTH">Autenticação</option>
                    <option value="SESSION">Sessão</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Descrição</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Plano de Mitigação</label>
                <textarea
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  rows={2}
                  placeholder="Passos para correção pelo time de desenvolvimento..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Registrar Achado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
