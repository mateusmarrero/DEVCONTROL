import React, { useState, useEffect } from 'react';
import { ListOrdered, CheckCircle2, Shield, Layers, Bookmark, Download, Check, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';
import { PHASES_17_CATALOG } from '../types/phases';

export const ChecklistMaster: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [downloading, setDownloading] = useState(false);

  const activePhaseData = PHASES_17_CATALOG.find((p) => p.number === selectedPhase) || PHASES_17_CATALOG[0];

  const handleDownloadTemplate = () => {
    setDownloading(true);
    // Cria um link temporário para o arquivo oficial disponível em templates/
    const element = document.createElement('a');
    element.href = '/templates/DEVCONTROL_MODELO_OFICIAL.csv';
    element.download = 'DEVCONTROL_MODELO_OFICIAL.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setDownloading(false), 1500);
  };

  const totalTasksCount = PHASES_17_CATALOG.reduce((acc, p) => acc + p.tasks.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Oficial */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Modelo Homologado 1.0 • 15/11/2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Checklist Master — 17 Fases & {totalTasksCount} Tarefas Oficiais
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Modelo-base corporativo oficial para importação e controle de sites: do propósito estratégico ao Quality Gate final.
          </p>
        </div>

        <a
          href="/templates/DEVCONTROL_MODELO_OFICIAL.csv"
          download="DEVCONTROL_MODELO_OFICIAL.csv"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Baixar Planilha Modelo (.CSV)</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista das 17 Fases */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2 max-h-[750px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
            <span>Fases Homologadas</span>
            <span className="font-mono text-indigo-400">17 Fases ({totalTasksCount} Tarefas)</span>
          </div>
          {PHASES_17_CATALOG.map((p) => (
            <button
              key={p.number}
              onClick={() => setSelectedPhase(p.number)}
              className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                selectedPhase === p.number
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <div className="truncate mr-2">
                <span className="font-mono text-[11px] opacity-75 mr-1.5">{p.code}.</span>
                <span>{p.name.replace(/^\d{2}\.\s*/, '')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 font-mono shrink-0">
                {p.tasks.length} itens
              </span>
            </button>
          ))}
        </div>

        {/* Detalhes da Fase Selecionada */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Fase {activePhaseData.code} de 17
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Obrigatória
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-2">
              {activePhaseData.name}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              <b className="text-gray-300">Objetivo:</b> {activePhaseData.objective}
            </p>
            <p className="text-[11px] text-indigo-400 mt-1 font-mono">
              <b>Critério Geral de Conclusão:</b> {activePhaseData.generalCriteria}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Catálogo Oficial de Tarefas ({activePhaseData.tasks.length} Itens)
            </h3>
            <div className="space-y-3">
              {activePhaseData.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {task.id}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        task.priority === 'HIGH' || task.priority === 'URGENT'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {task.priority === 'HIGH' ? 'Alta' : task.priority === 'URGENT' ? 'Crítica' : 'Média'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
                        {task.suggestedRole}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                    {task.criteria}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
