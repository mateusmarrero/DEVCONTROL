import React, { useState, useEffect } from 'react';
import { FileCode2, Plus, Save, Trash2, Eye, Edit3, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { DocumentationDoc, Project } from '../types';

export const Documentation: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [docs, setDocs] = useState<DocumentationDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentationDoc | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ARCHITECTURE');
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const projsRes = await api.get('/projects');
        setProjects(projsRes.data);
        const targetId = selectedProjectId || (projsRes.data[0]?.id || '');
        if (targetId) {
          setSelectedProjectId(targetId);
          const docsRes = await api.get(`/docs/project/${targetId}`);
          setDocs(docsRes.data);
          if (docsRes.data.length > 0) {
            setActiveDoc(docsRes.data[0]);
            setTitle(docsRes.data[0].title);
            setContent(docsRes.data[0].content);
            setCategory(docsRes.data[0].category);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [selectedProjectId]);

  const handleSave = async () => {
    if (!selectedProjectId || !title) return;
    setSaving(true);
    try {
      if (activeDoc) {
        const res = await api.put(`/docs/${activeDoc.id}`, { title, content, category });
        setActiveDoc(res.data);
      } else {
        const res = await api.post('/docs', {
          projectId: selectedProjectId,
          title,
          content,
          category
        });
        setActiveDoc(res.data);
      }
      const docsRes = await api.get(`/docs/project/${selectedProjectId}`);
      setDocs(docsRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar documento');
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setActiveDoc(null);
    setTitle('Novo Documento');
    setContent('# Título do Documento\n\nRegistre aqui as especificações, diagramas em ASCII ou markdown...');
    setCategory('TECHNICAL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Base de Conhecimento & Decisões Arquiteturais (ADRs)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Editor de Texto Interno & Documentação Técnica
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Editor integrado para decisões arquiteturais, relatórios de auditoria, padrões e guias de implantação.
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
            onClick={handleNew}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Documento</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel Lateral de Artigos */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">
            Documentos do Projeto ({docs.length})
          </span>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveDoc(d);
                  setTitle(d.title);
                  setContent(d.content);
                  setCategory(d.category);
                }}
                className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeDoc?.id === d.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <span className="font-bold block truncate">{d.title}</span>
                <span className="text-[10px] opacity-75 block font-mono">
                  {d.category} • v{d.version}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor de Texto & Preview */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da Documentação..."
              className="w-full bg-transparent text-xl font-black text-gray-900 dark:text-white focus:outline-none"
            />

            <div className="flex items-center space-x-2 shrink-0">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-gray-200"
              >
                <option value="ARCHITECTURE">Arquitetura</option>
                <option value="DECISION_RECORD">Decisão ADR</option>
                <option value="AUDIT">Auditoria</option>
                <option value="API">API Reference</option>
                <option value="MANUAL">Manual Operacional</option>
              </select>

              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                  previewMode ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'text-gray-400 border-gray-700'
                }`}
                title="Alternar Modo Preview"
              >
                {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Gravando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>

          {previewMode ? (
            <div className="prose dark:prose-invert max-w-none p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 min-h-[450px] text-xs font-sans whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
              placeholder="Escreva documentação técnica com formatação markdown completa..."
            ></textarea>
          )}
        </div>
      </div>
    </div>
  );
};
