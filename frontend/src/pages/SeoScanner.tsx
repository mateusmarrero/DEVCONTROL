import React, { useState } from 'react';
import { Search, Globe, Gauge, CheckCircle2, AlertCircle, Sparkles, ExternalLink, RefreshCw, Copy, Check, Eye } from 'lucide-react';
import { api } from '../services/api';

export const SeoScanner: React.FC = () => {
  const [url, setUrl] = useState('https://jtpcd.vercel.app');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const quickSites = [
    { name: 'Já Te Contaram PcD?', url: 'https://jtpcd.vercel.app' },
    { name: 'Guia de Sobrevivência Civil', url: 'https://prontoparaoimprevisto.com.br' },
    { name: 'Você Pode Tudo', url: 'https://vocepodetudo.com' }
  ];

  const handleScan = async (targetUrl = url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/seo/scan', { url: targetUrl });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao auditar a URL. Verifique se o site está online.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Dominância Orgânica & Inteligência de Busca</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Radar SEO 360° & Auditor de Posicionamento SERP
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Audite qualquer URL dos seus projetos em tempo real. Avalie conformidade com os algoritmos do Google, meta tags, Core Web Vitals, Schema JSON-LD e prévias exatas dos resultados de busca.
        </p>

        {/* Seleção Rápida */}
        <div className="mt-4 flex flex-wrap gap-2">
          {quickSites.map((site) => (
            <button
              key={site.url}
              onClick={() => {
                setUrl(site.url);
                handleScan(site.url);
              }}
              className="px-3 py-1.5 rounded-xl bg-gray-900/80 hover:bg-indigo-600/30 border border-gray-700 hover:border-indigo-500/50 text-xs text-gray-300 hover:text-white font-medium transition-all flex items-center space-x-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{site.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com.br"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <button
          onClick={() => handleScan(url)}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auditando URL...</span>
            </>
          ) : (
            <>
              <Gauge className="w-4 h-4" />
              <span>Escanear SEO Agora</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resultados da Auditoria */}
      {result && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${getScoreColor(result.score)} flex items-center justify-between`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">Pontuação SEO</span>
                <span className="text-3xl font-black">{result.score}/100</span>
              </div>
              <Gauge className="w-8 h-8 opacity-60" />
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Tempo de Resposta</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
                {result.responseTimeMs} ms
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">TTFB Excelente</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Schemas JSON-LD</span>
              <span className="text-2xl font-black text-indigo-400 mt-1 block">
                {result.schemas.count} detectados
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Rich Snippets elegíveis</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Imagens com Alt</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
                {result.images.withAlt} / {result.images.total}
              </span>
              <span className={`text-[10px] font-medium ${result.images.missingAlt === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {result.images.missingAlt === 0 ? '100% otimizadas' : `${result.images.missingAlt} pendentes`}
              </span>
            </div>
          </div>

          {/* Prévia SERP do Google (Como aparece na busca) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Prévia no Resultado de Busca do Google (SERP Preview)</span>
            </h2>

            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0A0D14] border border-gray-200 dark:border-gray-800 max-w-2xl font-sans">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold">
                  G
                </div>
                <div>
                  <span className="text-xs text-gray-300 block">{result.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                  <span className="text-[10px] text-gray-500 block truncate">{result.url}</span>
                </div>
              </div>
              <h3 className="text-base text-indigo-400 hover:underline font-medium cursor-pointer mt-1">
                {result.meta.title || 'Título não configurado'}
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {result.meta.description || 'Nenhuma meta descrição configurada para esta página.'}
              </p>
            </div>
          </div>

          {/* Diagnóstico & Recomendações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detalhes Técnicos */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Auditoria de Tags & Estrutura
              </h2>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between">
                  <span className="text-gray-400">Título ({result.meta.titleLength} caracteres)</span>
                  <span className="font-bold text-white max-w-xs truncate">{result.meta.title}</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between">
                  <span className="text-gray-400">Descrição ({result.meta.descriptionLength} carac.)</span>
                  <span className="font-bold text-white max-w-xs truncate">{result.meta.description}</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between">
                  <span className="text-gray-400">Canonical Tag</span>
                  <span className="font-mono text-indigo-400 max-w-xs truncate">{result.meta.canonical || 'Ausente'}</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between">
                  <span className="text-gray-400">Cabeçalho H1</span>
                  <span className="font-bold text-white max-w-xs truncate">{result.headings.h1[0] || 'Nenhum'}</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between">
                  <span className="text-gray-400">Schemas Detectados</span>
                  <div className="flex flex-wrap gap-1">
                    {result.schemas.types.map((type: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ações para Subir de Posição */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Recomendações para o Topo das Buscas</span>
              </h2>

              {result.recommendations.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  Excelente! Esta página atende a todos os critérios principais dos algoritmos de busca.
                </div>
              ) : (
                <div className="space-y-2">
                  {result.recommendations.map((rec: string, index: number) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
