'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulation } from '@/hooks/useSimulation';
import { generateSimulationReport } from '@/utils/exportPdf';
import InputPanel from '@/components/InputPanel';
import ChartAnalysis from '@/components/ChartAnalysis';
import AIAdvisor from '@/components/AIAdvisor';
import MateriModule from '@/components/MateriModule';
import { HelpCircle, BookOpen, ChevronRight, ChevronLeft, X, CheckCircle2, Target, Globe, Mountain, Wind } from 'lucide-react';

// Load MapVisualizer dynamically to disable SSR (Leaflet requires window object)
const MapVisualizer = dynamic(() => import('@/components/MapVisualizer'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-500">Memuat Peta...</div>
});

const TUTORIAL_STEPS = [
  {
    title: "Selamat Datang di Simulator",
    desc: "Mari pelajari cara menggunakan aplikasi simulasi letusan gunung berapi ini dalam beberapa langkah mudah.",
    pos: "center"
  },
  {
    title: "1. Panel Kendali (Kiri)",
    desc: "Panel ini adalah pusat kontrol. Anda dapat beralih antara simulasi Lokal (Balistik) dan Global (Aerosol), serta memilih riwayat gunung bersejarah.",
    pos: "left-top"
  },
  {
    title: "2. Parameter Fisika (Kiri Bawah)",
    desc: "Eksplorasi sainsnya! Sesuaikan letusan, cuaca stratosfer, hingga tipe material (bom/abu) untuk melihat efek termodinamika secara live.",
    pos: "left-bottom"
  },
  {
    title: "3. Peta Interaktif (Kanan Atas)",
    desc: "Perhatikan peta ini. Proyektil dan awan abu akan dirender langsung menggunakan citra satelit Bumi sesuai koordinat geografisnya.",
    pos: "right-top"
  },
  {
    title: "4. Analisis & AI (Kanan Bawah)",
    desc: "Pantau grafik ketinggian serta dapatkan laporan mitigasi bencana otomatis dari AI PVMBG berdasarkan parameter letusan Anda.",
    pos: "right-bottom"
  },
  {
    title: "5. Mulai Simulasi",
    desc: "Tekan tombol 'Mulai Simulasi' berwarna hijau di panel kiri untuk menjalankan animasi. Selamat bereksperimen dengan alam!",
    pos: "center"
  }
];

export default function KrakatoaDashboard() {
  const [appState, setAppState] = useState<'landing' | 'transition' | 'app' | 'materi'>('landing');
  const [tutorialStep, setTutorialStep] = useState(0); // 0 = off
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { 
    mode, setMode, 
    params, setParams, 
    aerosolParams, setAerosolParams,
    ballisticResult, aerosolResult, academicMetrics,
    progressIndex, setProgressIndex, totalPoints,
    isPlaying, togglePlay, playbackSpeed, setPlaybackSpeed,
    isFetchingTopo
  } = useSimulation();

  const startTutorial = () => {
    setAppState('app');
    setTutorialStep(1);
  };

  const nextStep = () => setTutorialStep(p => Math.min(p + 1, TUTORIAL_STEPS.length));
  const prevStep = () => setTutorialStep(p => Math.max(p - 1, 1));
  const endTutorial = () => {
    setTutorialStep(0);
    setAppState('landing'); // Back to homepage
  };

  const getTutorialPosition = (index: number) => {
    if (isMobile) return 'bottom-4 left-4 right-4';
    
    const pos = TUTORIAL_STEPS[index - 1]?.pos;
    switch (pos) {
      case 'left-top': return 'top-8 left-[340px] lg:left-[420px] w-[350px]';
      case 'left-bottom': return 'bottom-8 left-[340px] lg:left-[420px] w-[350px]';
      case 'right-top': return 'top-16 right-8 lg:right-1/4 w-[350px]';
      case 'right-bottom': return 'bottom-20 right-8 lg:right-1/4 w-[350px]';
      case 'center':
      default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[450px]';
    }
  };

  const handleEnterApp = () => {
    setAppState('transition');
    setTimeout(() => {
      setAppState('app');
    }, 2000);
  };

  if (appState === 'landing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 relative overflow-hidden">
        {/* Decorative background gradients (Changed to UNS Blues) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/15 blur-[100px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center max-w-3xl relative z-10"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            {/* Logo Placement */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/90 p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <img 
                  src="/image.png?v=2" 
                  alt="Logo UNS" 
                  className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-neutral-500">Upload image.png ke folder public/</span>';
                  }}
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-sm pb-2 flex flex-col items-center gap-2">
              <span className="text-white">Mountosim</span>
              <span className="text-2xl md:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-sky-300 via-blue-500 to-[#005ea2]">
                Simulasi Trajektori Letusan Gunung
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-2 text-white mb-10 text-sm md:text-base font-medium tracking-wide"
          >
            <p className="text-white">
              Oleh: <span className="text-white font-semibold">Farrel Hyuga Adeyahyan</span>
            </p>
            <p className="text-white">Informatika</p>
            <p className="text-white">Fakultas Teknologi Informasi dan Sains Data</p>
          </motion.div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnterApp}
              className="w-full justify-center px-8 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#005ea2] hover:from-sky-400 hover:to-blue-600 text-white rounded-full font-semibold shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all duration-300 flex items-center gap-2"
            >
              Masuk Aplikasi
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </motion.button>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTutorial}
              className="w-full justify-center px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:text-white rounded-full font-medium transition-all duration-300 flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Tutorial Penggunaan
            </motion.button>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAppState('materi')}
              className="w-full justify-center px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:text-white rounded-full font-medium transition-all duration-300 flex items-center gap-2 mt-2"
            >
              <BookOpen className="w-5 h-5" />
              Materi yang Digunakan
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  
  if (appState === 'materi') {
    return <MateriModule onBack={() => setAppState('landing')} />;
  }

  if (appState === 'transition') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen w-screen bg-black flex flex-col items-center justify-center relative z-50 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center"
        >
          <img src="/image.png" alt="Logo UNS Transition" className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_40px_rgba(14,165,233,0.8)] mb-10" />
          
          <div className="w-64 flex flex-col items-center gap-4">
            {/* Loading Bar Container */}
            <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 blur-[2px] animate-pulse"></div>
              </motion.div>
            </div>
            
            {/* Loading Text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sky-400 font-mono text-[10px] md:text-xs tracking-widest uppercase flex gap-1 items-center"
            >
              <span className="animate-pulse opacity-80">Mempersiapkan Simulasi</span>
              <span className="flex gap-0.5 ml-1">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
      className="flex flex-col md:flex-row min-h-screen md:h-screen bg-black overflow-y-auto md:overflow-hidden font-sans relative"
    >
      {/* ----------------- TUTORIAL OVERLAY ----------------- */}
      <AnimatePresence>
        {tutorialStep > 0 && (
          <>
            {/* Dimmed Background */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px] pointer-events-auto"
            />
            
            {/* Tutorial Card */}
            <motion.div
              key={tutorialStep}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-[20000] ${getTutorialPosition(tutorialStep)} bg-neutral-900 border border-orange-500/30 shadow-[0_0_50px_rgba(234,88,12,0.15)] rounded-2xl p-5 pointer-events-auto flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-orange-400 font-bold text-lg">{TUTORIAL_STEPS[tutorialStep - 1].title}</h3>
                <button onClick={endTutorial} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-neutral-300 text-sm leading-relaxed mb-2">
                {TUTORIAL_STEPS[tutorialStep - 1].desc}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800">
                <span className="text-xs text-neutral-500 font-medium">Langkah {tutorialStep} dari {TUTORIAL_STEPS.length}</span>
                <div className="flex gap-2">
                  {tutorialStep > 1 && (
                    <button onClick={prevStep} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                  )}
                  {tutorialStep < TUTORIAL_STEPS.length ? (
                    <button onClick={nextStep} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1 shadow-lg shadow-orange-900/50">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={endTutorial} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1 shadow-lg shadow-green-900/50">
                      Selesai <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* ---------------------------------------------------- */}

      {/* Left Panel - Input Controls */}
      <div className={`w-full md:w-80 lg:w-[400px] flex-shrink-0 h-auto md:h-screen border-b md:border-b-0 md:border-r border-neutral-800 ${tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 6 ? 'relative z-[10000]' : ''}`}>
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
          tutorialStep={tutorialStep}
        />
      </div>

      {/* Right Panel - Visualizations */}
      <div className="flex-1 flex flex-col h-auto md:h-screen overflow-visible md:overflow-hidden bg-black p-2 md:p-4 gap-2 md:gap-4">
        
        {/* Top - Map View */}
        <div className={`w-full h-[50vh] md:h-auto md:flex-1 flex-shrink-0 rounded-xl overflow-hidden border ${tutorialStep === 4 ? 'relative z-[10000] ring-4 ring-orange-500 shadow-[0_0_40px_rgba(234,88,12,0.3)] pointer-events-none' : 'border-neutral-800 shadow-2xl'} relative`}>
          <MapVisualizer 
            mode={mode}
            ballisticResult={ballisticResult} 
            aerosolResult={aerosolResult}
            progressIndex={progressIndex} 
            params={params} 
          />
          <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white shadow-lg pointer-events-none flex flex-col items-end gap-1">
            <span>{mode === 'ballistic' ? 'Trajektori Lokal (Satelit)' : 'Penyebaran Global (Satelit)'}</span>
            {isFetchingTopo && (
              <span className="text-orange-400 font-medium animate-pulse flex items-center gap-1">
                <Mountain className="w-3 h-3" /> Mengambil Topografi Satelit...
              </span>
            )}
          </div>
        </div>
        
        {/* Bottom - Chart Analysis & AI */}
        <div className="flex-shrink-0 flex flex-col xl:flex-row gap-2 md:gap-4 h-auto md:h-80 pb-4 md:pb-0">
          <div className={`min-h-[380px] h-auto md:h-full flex-[2] ${tutorialStep === 5 ? 'relative z-[10000] ring-4 ring-orange-500 rounded-xl shadow-[0_0_40px_rgba(234,88,12,0.3)] pointer-events-none bg-neutral-900' : ''}`}>
            <ChartAnalysis 
              mode={mode}
              ballisticResult={ballisticResult} 
              aerosolResult={aerosolResult}
              academicMetrics={academicMetrics}
              progressIndex={progressIndex}
              onExport={() => generateSimulationReport(mode, params, aerosolParams, ballisticResult, aerosolResult, academicMetrics)}
            />
          </div>
          <div className={`h-[350px] md:h-full flex-1 min-w-0 xl:min-w-[300px] ${tutorialStep === 5 ? 'relative z-[10000] ring-4 ring-orange-500 rounded-xl shadow-[0_0_40px_rgba(234,88,12,0.3)] pointer-events-none bg-neutral-900' : ''}`}>
            <AIAdvisor 
              mode={mode}
              ballisticResult={ballisticResult} 
              aerosolResult={aerosolResult}
              params={params}
              aerosolParams={aerosolParams}
              academicMetrics={academicMetrics}
            />
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
