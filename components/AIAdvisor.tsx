'use client';
import { useState } from 'react';
import { Bot, Loader2, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';

interface Props {
  mode: string;
  ballisticResult: any;
  aerosolResult: any;
  params: any;
  aerosolParams: any;
  academicMetrics: any;
}

export default function AIAdvisor({ mode, ballisticResult, aerosolResult, params, aerosolParams, academicMetrics }: Props) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, ballisticResult, aerosolResult, params, aerosolParams, academicMetrics }),
      });
      if (!res.ok) throw new Error('Gagal mendapatkan analisis AI');
      const data = await res.json();
      setReport(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-800/80 backdrop-blur-md rounded-xl border border-neutral-700/50 overflow-hidden shadow-2xl flex flex-col h-full mt-0">
      <div className="flex items-center justify-between p-3 border-b border-neutral-700/50 bg-neutral-900/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <Bot className="w-4 h-4" /> AI Disaster Advisor (PVMBG)
        </div>
        {!report && !loading && (
          <button
            onClick={generateReport}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md transition-colors shadow"
          >
            Analisis Risiko
          </button>
        )}
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 text-sm text-neutral-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-2 py-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Menyusun laporan mitigasi...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/50">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : report ? (
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-emerald-400">
            <Markdown>{report}</Markdown>
          </div>
        ) : (
          <div className="text-neutral-500 text-xs italic text-center py-4">
            Klik tombol analisis untuk mendapatkan laporan mitigasi bencana berbasis AI.
          </div>
        )}
      </div>
    </div>
  );
}
