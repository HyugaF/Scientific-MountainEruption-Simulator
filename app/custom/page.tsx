'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulation } from '@/hooks/useSimulation';
import InputPanel from '@/components/InputPanel';
import ChartAnalysis from '@/components/ChartAnalysis';
import AIAdvisor from '@/components/AIAdvisor';
import { ArrowLeft, Target, Settings, Info, MapPin } from 'lucide-react';
import Link from 'next/link';

const MapVisualizer = dynamic(() => import('@/components/MapVisualizer'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-500">Memuat Peta...</div>
});

export default function CustomSimulationPage() {
  const {
    mode, setMode,
    params, setParams,
    aerosolParams, setAerosolParams,
    isPlaying, togglePlay,
    progressIndex, setProgressIndex,
    playbackSpeed, setPlaybackSpeed,
    ballisticResult, aerosolResult,
    totalPoints,
    academicMetrics
  } = useSimulation();

  const [isMobile, setIsMobile] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setParams({ ...params, lat, lng });
    setAerosolParams({ ...aerosolParams, lat, lng });
    setShowLocationPrompt(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
      className="flex flex-col md:flex-row min-h-screen md:h-screen bg-black overflow-y-auto md:overflow-hidden font-sans relative"
    >
      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-neutral-950 border-b border-neutral-900 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg leading-none">Simulasi Kustom</h1>
          </div>
        </div>
      </div>

      {/* Left Panel */}
      <div className="w-full md:w-80 lg:w-[400px] flex-shrink-0 h-auto md:h-screen border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950 overflow-y-auto flex flex-col">
        <div className="hidden md:flex items-center p-4 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
          <Link href="/" className="text-neutral-400 hover:text-white transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Simulasi Kustom</h2>
            <p className="text-xs text-neutral-400">Pilih titik & sesuaikan letusan</p>
          </div>
        </div>
        
        {showLocationPrompt && (
          <div className="p-4 mx-4 mt-4 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              Silakan <strong>klik di area Peta</strong> untuk menentukan titik awal simulasi letusan.
            </p>
          </div>
        )}

        <InputPanel 
          mode={mode}
          setMode={setMode}
          params={params} 
          setParams={setParams}
          aerosolParams={aerosolParams}
          setAerosolParams={setAerosolParams}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          progressIndex={progressIndex}
          setProgressIndex={setProgressIndex}
          totalPoints={totalPoints}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col h-auto md:h-screen overflow-visible md:overflow-hidden bg-black p-2 md:p-4 gap-2 md:gap-4">
        
        {/* Map View */}
        <div className="w-full h-[50vh] md:h-auto md:flex-1 flex-shrink-0 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl relative">
          <MapVisualizer 
            mode={mode}
            ballisticResult={ballisticResult} 
            aerosolResult={aerosolResult}
            progressIndex={progressIndex} 
            params={params}
            onLocationSelect={handleLocationSelect}
          />
          <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white shadow-lg pointer-events-none flex flex-col items-end gap-1">
            <span>{mode === 'ballistic' ? 'Trajektori Lokal (Satelit)' : 'Penyebaran Global (Satelit)'}</span>
            <span className="text-neutral-400 font-mono">
              Mode Kustom (Klik peta)
            </span>
          </div>
        </div>

        {/* Charts & AI */}
        <div className="flex-shrink-0 h-auto md:h-[40%] flex flex-col xl:flex-row gap-2 md:gap-4 overflow-visible md:overflow-hidden">
          <div className="w-full xl:w-2/3 h-[400px] md:h-full bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
             <ChartAnalysis 
                mode={mode}
                ballisticResult={ballisticResult}
                aerosolResult={aerosolResult}
                academicMetrics={academicMetrics}
                progressIndex={progressIndex}
              />
          </div>

          <div className="w-full xl:w-1/3 h-auto md:h-full flex flex-col gap-2 md:gap-4 overflow-visible">
            <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col min-h-[300px]">
              <AIAdvisor 
                params={params}
                academicMetrics={academicMetrics}
                mode={mode}
                aerosolParams={aerosolParams}
                aerosolResult={aerosolResult}
                ballisticResult={ballisticResult}
              />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
