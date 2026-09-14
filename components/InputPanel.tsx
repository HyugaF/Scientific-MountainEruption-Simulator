'use client';
import { useRef, useEffect, useState } from 'react';
import { PhysicsParams, AerosolParams } from '@/utils/physics';
import { KRAKATOA_PRESET, AEROSOL_PRESET, SimulationMode, HISTORICAL_PRESETS } from '@/hooks/useSimulation';
import { Settings, Wind, Compass, RefreshCw, Play, Pause, Square, Globe, Target, Mountain, History, Info, X, ExternalLink, BookOpen, ChevronDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

interface Props {
  mode: SimulationMode;
  setMode: (m: SimulationMode) => void;
  params: PhysicsParams;
  setParams: (p: PhysicsParams) => void;
  aerosolParams: AerosolParams;
  setAerosolParams: (p: AerosolParams) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  progressIndex: number;
  setProgressIndex: (p: number | ((prev: number) => number)) => void;
  totalPoints: number;
  playbackSpeed: number;
  setPlaybackSpeed: (s: number) => void;
  tutorialStep?: number;
}


const PreviewSlider = ({
  label, value, min, max, step, onChange, unit, paramKey, color = 'orange', formatValue
}: {
  label: React.ReactNode; value: number; min: number; max: number; step: number;
  onChange: (val: number) => void; unit?: string; paramKey: string; color?: 'orange' | 'blue' | 'purple';
  formatValue?: (val: number) => string;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const renderPreview = () => {
    switch (paramKey) {
      case 'elevation':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-24 bg-neutral-950 rounded-t-lg">
            <rect x="0" y="80" width="100" height="20" fill="#1e3a8a" opacity="0.3" />
            <motion.polygon points={`20,80 50,${80 - (percent * 60)} 80,80`} fill="#c2410c" />
            <text x="50" y="15" fill="#9ca3af" fontSize="10" textAnchor="middle">Ketinggian Kawah</text>
            <text x="50" y="28" fill="#f97316" fontSize="12" fontWeight="bold" textAnchor="middle">{value} mdpl</text>
          </svg>
        );
      case 'v0':
        return (
          <div className="w-full h-24 bg-neutral-950 rounded-t-lg flex flex-col items-center justify-center relative overflow-hidden">
            <motion.div className="absolute left-4 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" animate={{ x: percent * 220 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <div className="absolute top-2 text-[10px] text-neutral-400">Kecepatan Erupsi</div>
            <div className="absolute top-6 text-xs text-orange-400 font-bold">{value} m/s</div>
          </div>
        );
      case 'angle':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-24 bg-neutral-950 rounded-t-lg">
            <line x1="10" y1="90" x2="90" y2="90" stroke="#4b5563" strokeWidth="2" />
            <motion.path d={`M 10 90 Q 50 ${90 - (percent * 80)} 90 90`} stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            <motion.g style={{ transformOrigin: '10px 90px' }} animate={{ rotate: -value }}>
              <line x1="10" y1="90" x2="40" y2="90" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
            <text x="50" y="15" fill="#9ca3af" fontSize="10" textAnchor="middle">Sudut Tembak</text>
            <text x="50" y="28" fill="#f97316" fontSize="12" fontWeight="bold" textAnchor="middle">{value}°</text>
          </svg>
        );
      case 'mass':
        return (
          <div className="w-full h-24 bg-neutral-950 rounded-t-lg flex flex-col items-center justify-center relative">
            <motion.div className="rounded-full bg-orange-700 border-2 border-orange-400" animate={{ width: 10 + percent * 50, height: 10 + percent * 50 }} transition={{ type: 'spring', bounce: 0.5 }} />
            <div className="absolute top-2 text-[10px] text-neutral-400">Ukuran Material</div>
          </div>
        );
      case 'windSpeed':
        return (
          <div className="w-full h-24 bg-neutral-950 rounded-t-lg relative overflow-hidden flex flex-col items-center justify-center">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} className="absolute h-px bg-blue-400" style={{ top: `${i * 20 + 20}%`, width: `${20 + Math.random() * 30}%` }} animate={{ x: [-100, 300] }} transition={{ repeat: Infinity, duration: 2 - percent * 1.5 + Math.random(), ease: "linear" }} />
            ))}
            <div className="absolute top-2 text-[10px] text-blue-400/80">Kekuatan Angin</div>
            <div className="absolute top-6 text-xs text-blue-400 font-bold">{value} m/s</div>
          </div>
        );
      case 'windDirection':
        return (
          <div className="w-full h-24 bg-neutral-950 rounded-t-lg flex flex-col items-center justify-center relative">
            <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center relative mt-4">
              <div className="absolute -top-3 text-[8px] text-blue-400">U</div>
              <motion.div className="w-1 h-10 bg-gradient-to-t from-transparent to-blue-500 rounded-full origin-center" animate={{ rotate: value }} transition={{ type: 'spring', stiffness: 100 }} />
            </div>
            <div className="absolute top-2 text-[10px] text-blue-400">Arah Angin</div>
          </div>
        );
      default:
        return (
          <div className="w-full h-16 bg-neutral-950 rounded-t-lg flex items-center justify-center text-xs text-neutral-400 font-bold">
            {value} {unit}
          </div>
        );
    }
  };

  const accentClass = color === 'orange' ? 'accent-orange-500' : color === 'blue' ? 'accent-blue-500' : 'accent-purple-500';
  const textClass = color === 'orange' ? 'text-orange-400' : color === 'blue' ? 'text-blue-400' : 'text-purple-400';
  const displayValue = formatValue ? formatValue(value) : `${value} ${unit || ''}`.trim();

  return (
    <div className={`space-y-2 relative w-full ${isDragging ? 'z-[1000]' : 'z-10'}`}>
      <div className="flex justify-between text-xs">
        <label>{label}</label>
        <span className={textClass}>{displayValue}</span>
      </div>
      <div className="relative w-full">
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 w-full mb-3 z-[99999] rounded-lg shadow-2xl border border-neutral-700 bg-neutral-900 pointer-events-none drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            >
              {renderPreview()}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-900 border-b border-r border-neutral-700 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onMouseEnter={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
          className={`w-full cursor-pointer relative z-10 ${accentClass}`}
        />
      </div>
    </div>
  );
};

export default function InputPanel({ 
  mode, setMode, 
  params, setParams, 
  aerosolParams, setAerosolParams, 
  isPlaying, togglePlay,
  progressIndex, setProgressIndex, totalPoints,
  playbackSpeed, setPlaybackSpeed,
  tutorialStep = 0
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!panelRef.current) return;
    if (tutorialStep === 2 || tutorialStep === 6) {
      panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tutorialStep === 3) {
      panelRef.current.scrollTo({ top: 350, behavior: 'smooth' });
    }
  }, [tutorialStep]);

  const handlePhysicsChange = (key: keyof PhysicsParams, value: number | boolean) => {
    setParams({ ...params, [key]: value });
  };
  const handleAerosolChange = (key: keyof AerosolParams, value: number) => {
    setAerosolParams({ ...aerosolParams, [key]: value });
  };

  return (
    <>
      <div ref={panelRef} className="flex flex-col gap-5 h-full p-6 bg-neutral-900 border-r border-neutral-800 text-neutral-200 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Simulator Erupsi</h2>
            <p className="text-xs text-neutral-400">Advanced Physical Simulation</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/custom" className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors" title="Simulasi Kustom (Pilih Titik)">
              <Target className="w-5 h-5" />
            </Link>
            <button 
            onClick={() => setShowInfo(true)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            title="Daftar Pustaka"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          </div>
        </div>

        <div className={`flex p-1 rounded-lg ${tutorialStep === 2 ? 'relative z-[10000] ring-2 ring-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] bg-neutral-800 pointer-events-none' : 'bg-neutral-800'}`}>
        <button
          onClick={() => setMode('ballistic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${mode === 'ballistic' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          <Target className="w-3.5 h-3.5" /> Balistik (Lokal)
        </button>
        <button
          onClick={() => setMode('aerosol')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${mode === 'aerosol' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          <Globe className="w-3.5 h-3.5" /> Aerosol (Global)
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-800">
        <div className="flex gap-2">
          
          <button
            onClick={togglePlay}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-lg ${isPlaying ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} ${tutorialStep === 6 ? 'relative z-[10000] ring-4 ring-green-400 shadow-[0_0_40px_rgba(74,222,128,0.5)] pointer-events-none scale-105' : ''}`}
          >
            {isPlaying ? (
              <><Pause className="w-4 h-4 fill-current" /> Pause</>
            ) : (
              <><Play className="w-4 h-4 fill-current" /> {progressIndex > 0 && progressIndex < totalPoints - 1 ? 'Lanjutkan' : 'Mulai Simulasi'}</>
            )}
          </button>

          <button
            onClick={() => {
              if (mode === 'ballistic') {
                setParams({ ...KRAKATOA_PRESET, lat: params.lat, lng: params.lng, elevation: params.elevation });
              } else {
                setAerosolParams(AEROSOL_PRESET);
              }
            }}
            className="flex items-center justify-center py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-lg"
            title="Reset Parameters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-neutral-400 font-medium px-1">
              <span>0%</span>
              <span>Timeline ({(progressIndex / Math.max(1, totalPoints - 1) * 100).toFixed(0)}%)</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(1, totalPoints - 1)}
              value={progressIndex}
              onChange={(e) => {
                if (isPlaying) togglePlay(); // Pause when scrubbing
                setProgressIndex(parseInt(e.target.value));
              }}
              className="w-full accent-orange-500 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex flex-col gap-1 w-20">
            <label className="text-[10px] text-neutral-400 font-medium text-center">Kecepatan</label>
            <select 
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded px-1 py-1 focus:outline-none focus:border-orange-500 text-center"
            >
              <option value="0.05">0.05x</option>
              <option value="0.1">0.1x</option>
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`space-y-3 pt-2 ${tutorialStep === 2 ? 'relative z-[10000] ring-2 ring-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] bg-neutral-900 rounded-xl p-2 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-300 pb-2 border-b border-neutral-800">
          <History className="w-4 h-4" /> Preset Tragedi Bersejarah
        </div>
        <div className="relative">
          <select
            value={HISTORICAL_PRESETS.find(p => params.lat === p.params.lat && params.v0 === p.params.v0)?.name || ''}
            onChange={(e) => {
              const preset = HISTORICAL_PRESETS.find(p => p.name === e.target.value);
              if (preset) {
                setParams(preset.params);
                setAerosolParams(preset.aerosol);
              }
            }}
            className="w-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[12px] font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:bg-neutral-700 transition-colors"
          >
            <option value="" disabled>Pilih Skenario Erupsi...</option>
            {HISTORICAL_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name} className="bg-neutral-900">
                {preset.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Selected Preset Info */}
        {(() => {
          const activePreset = HISTORICAL_PRESETS.find(p => params.lat === p.params.lat && params.v0 === p.params.v0);
          if (activePreset && activePreset.description) {
            return (
              <div className="mt-3 p-3 bg-neutral-800/40 border border-neutral-700/60 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50"></div>
                <h4 className="text-[11px] font-bold text-neutral-200 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-orange-400" />
                  Info Kejadian
                </h4>
                <p className="text-[11px] leading-relaxed text-neutral-400">{activePreset.description}</p>
              </div>
            );
          }
          return null;
        })()}

        {mode === 'ballistic' && (
          <div className="space-y-2 mt-4 pt-2 border-t border-neutral-800/50">
            <div className="flex justify-between text-xs">
              <label>Ketinggian Kawah (Elevasi)</label>
              <span className="text-orange-400">{params.elevation} mdpl</span>
            </div>
            <input type="range" min="0" max="6000" step="10" value={params.elevation} onChange={(e) => handlePhysicsChange('elevation', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
          </div>
        )}
      </div>

      {mode === 'ballistic' ? (
        <>
          <div className={`space-y-4 pt-2 ${tutorialStep === 3 ? 'relative z-[10000] ring-2 ring-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] bg-neutral-900 rounded-xl p-3 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300 pb-2 border-b border-neutral-800">
              <Settings className="w-4 h-4" /> Fisika Proyektil
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label>Kecepatan Awal (v₀)</label>
                <span className="text-orange-400">{params.v0} m/s</span>
              </div>
              <input type="range" min="10" max="2000" step="10" value={params.v0} onChange={(e) => handlePhysicsChange('v0', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label>Sudut Elevasi (θ)</label>
                <span className="text-orange-400">{params.angle}°</span>
              </div>
              <input type="range" min="1" max="89" step="1" value={params.angle} onChange={(e) => handlePhysicsChange('angle', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/50 mt-2">
              <div className="flex justify-between text-xs mb-1">
                <label>Tipe Material (Massa/Ukuran)</label>
              </div>
              <div className="flex gap-1 mb-3">
                <button onClick={() => handlePhysicsChange('mass', 1000)} className={`flex-1 text-[9px] px-1 py-1 rounded transition-colors ${params.mass === 1000 ? 'bg-orange-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}>Bom (1t)</button>
                <button onClick={() => handlePhysicsChange('mass', 1)} className={`flex-1 text-[9px] px-1 py-1 rounded transition-colors ${params.mass === 1 ? 'bg-orange-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}>Blok (1kg)</button>
                <button onClick={() => handlePhysicsChange('mass', 0.001)} className={`flex-1 text-[9px] px-1 py-1 rounded transition-colors ${params.mass === 0.001 ? 'bg-orange-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}>Lapilli (1g)</button>
                <button onClick={() => handlePhysicsChange('mass', 0.000001)} className={`flex-1 text-[9px] px-1 py-1 rounded transition-colors ${params.mass === 0.000001 ? 'bg-orange-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}>Abu</button>
              </div>
              <PreviewSlider label="Massa Custom" value={params.mass} min={0} max={10000} step={1} onChange={(v) => handlePhysicsChange('mass', v)} paramKey="mass" formatValue={(v) => v >= 1 ? `${v} kg` : `${(v * 1000).toFixed(2)} g`} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label>Jumlah Pecahan (Shrapnel)</label>
                <span className="text-orange-400">{params.projectileCount} proyektil</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={params.projectileCount} onChange={(e) => handlePhysicsChange('projectileCount', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
            </div>
          </div>

          <div className={`space-y-4 pt-2 ${tutorialStep === 3 ? 'relative z-[10000] ring-2 ring-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] bg-neutral-900 rounded-xl p-3 pointer-events-none mt-4' : ''}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300 pb-2 border-b border-neutral-800">
              <Wind className="w-4 h-4" /> Faktor Atmosfer (Lokal)
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label>Kecepatan Angin</label>
                <span className="text-blue-400">{params.windSpeed} m/s</span>
              </div>
              <input type="range" min="0" max="150" step="1" value={params.windSpeed} onChange={(e) => handlePhysicsChange('windSpeed', Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label>Arah Angin (Azimuth)</label>
                <span className="text-blue-400">{params.windDirection}°</span>
              </div>
              <input type="range" min="0" max="360" step="1" value={params.windDirection} onChange={(e) => handlePhysicsChange('windDirection', Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-medium">Hambatan Udara (Barometrik)</label>
              <button onClick={() => handlePhysicsChange('airDragEnabled', !params.airDragEnabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${params.airDragEnabled ? 'bg-orange-500' : 'bg-neutral-700'}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${params.airDragEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {params.airDragEnabled && (
              <>
                <div className="space-y-2 pt-2 border-t border-neutral-800/50">
                  <div className="flex justify-between text-xs">
                    <label>Koefisien Aerodinamis (Bentuk)</label>
                    <span className="text-orange-400">{params.dragCoefficient.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.1" max="1.0" step="0.05" value={params.dragCoefficient} onChange={(e) => handlePhysicsChange('dragCoefficient', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
                  <p className="text-[10px] text-neutral-500 leading-tight">0.1 = Bulat sempurna (aerodinamis).<br/>1.0 = Sangat kasar/Batu Apung.</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800/50">
                  <div className="flex justify-between text-xs">
                    <label>Massa Jenis Batuan (Density)</label>
                    <span className="text-orange-400">{params.rockDensity ?? 2500} kg/m³</span>
                  </div>
                  <input type="range" min="300" max="3300" step="100" value={params.rockDensity ?? 2500} onChange={(e) => handlePhysicsChange('rockDensity', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
                  <p className="text-[10px] text-neutral-500 leading-tight">Mempengaruhi luas penampang (Air Drag).<br/>~500 = Batu Apung (Pumice), ~2800 = Basalt.</p>
                </div>
              </>
            )}

            <div className="space-y-2 pt-4 mt-2 border-t border-neutral-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                Geospasial & Termodinamika
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label>Garis Lintang (Coriolis Effect)</label>
                  <span className="text-orange-400">{params.lat.toFixed(1)}°</span>
                </div>
                <input type="range" min="-90" max="90" step="1" value={params.lat} onChange={(e) => handlePhysicsChange('lat', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
                <p className="text-[10px] text-neutral-500 leading-tight">Menentukan parameter defleksi Coriolis ($f$).</p>
              </div>

              {params.airDragEnabled && (
                <>
                  <div className="space-y-2 pt-2 border-t border-neutral-800/50">
                    <div className="flex justify-between text-xs">
                      <label>Suhu Permukaan (T₀)</label>
                      <span className="text-orange-400">{params.surfaceTemp ?? 15}°C</span>
                    </div>
                    <input type="range" min="-30" max="50" step="1" value={params.surfaceTemp ?? 15} onChange={(e) => handlePhysicsChange('surfaceTemp', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
                    <p className="text-[10px] text-neutral-500 leading-tight">Mengubah profil kerapatan udara (ρ) & batas Mach.</p>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-neutral-800/50">
                    <div className="flex justify-between text-xs">
                      <label>Lapse Rate Atmosfer</label>
                      <span className="text-orange-400">{params.lapseRate ?? 6.5} K/km</span>
                    </div>
                    <input type="range" min="2" max="10" step="0.1" value={params.lapseRate ?? 6.5} onChange={(e) => handlePhysicsChange('lapseRate', Number(e.target.value))} className="w-full accent-orange-500 cursor-pointer" />
                    <p className="text-[10px] text-neutral-500 leading-tight">Penurunan suhu terhadap ketinggian (Troposfer).</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50 mt-2">
              <label className="text-xs font-medium">Profil Angin Vertikal (Wind Shear)</label>
              <button onClick={() => handlePhysicsChange('windShearEnabled', !params.windShearEnabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${params.windShearEnabled ? 'bg-blue-500' : 'bg-neutral-700'}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${params.windShearEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {params.windShearEnabled && (
              <div className="space-y-2 mt-2 bg-blue-900/20 p-2 rounded-lg border border-blue-900/50">
                <div className="text-[10px] text-blue-400 font-medium mb-2">Angin Stratosfer (&gt; 15 km)</div>
                <div className="flex justify-between text-xs">
                  <label>Kecepatan</label>
                  <span className="text-blue-300">{params.stratosphericWindSpeed} m/s</span>
                </div>
                <input type="range" min="0" max="150" value={params.stratosphericWindSpeed} onChange={(e) => handlePhysicsChange('stratosphericWindSpeed', Number(e.target.value))} className="w-full accent-blue-500" />
                
                <div className="flex justify-between text-xs mt-2">
                  <label>Arah (Azimuth)</label>
                  <span className="text-blue-300">{params.stratosphericWindDir}°</span>
                </div>
                <input type="range" min="0" max="360" value={params.stratosphericWindDir} onChange={(e) => handlePhysicsChange('stratosphericWindDir', Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={`space-y-4 pt-2 ${tutorialStep === 3 ? 'relative z-[10000] ring-2 ring-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] bg-neutral-900 rounded-xl p-3 pointer-events-none mt-4' : ''}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-300 pb-2 border-b border-neutral-800">
            <Globe className="w-4 h-4" /> Dinamika Stratosfer
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label>Durasi Simulasi</label>
              <span className="text-purple-400">{aerosolParams.days} Hari</span>
            </div>
            <input type="range" min="5" max="90" step="1" value={aerosolParams.days} onChange={(e) => handleAerosolChange('days', Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
            <p className="text-[10px] text-neutral-500">Lamanya abu vulkanik menyelimuti atmosfer.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label>Kecepatan Jet Stream</label>
              <span className="text-blue-400">{aerosolParams.stratosphericWind} m/s</span>
            </div>
            <input type="range" min="10" max="60" step="1" value={aerosolParams.stratosphericWind} onChange={(e) => handleAerosolChange('stratosphericWind', Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
            <p className="text-[10px] text-neutral-500">Angin stratosfer ekuatorial bergerak ke arah Barat (Easterlies).</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label>Koefisien Difusi Eddy (Turbulensi)</label>
              <span className="text-purple-400">{aerosolParams.diffusionRate} km/hari</span>
            </div>
            <input type="range" min="10" max="500" step="10" value={aerosolParams.diffusionRate} onChange={(e) => handleAerosolChange('diffusionRate', Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
            <p className="text-[10px] text-neutral-500">Laju pelebaran (dispersi lateral) awan abu di Stratosfer.</p>
          </div>
          
          <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50 mt-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              <b>Catatan Sains:</b> Debu mikroskopis dan gas $SO_2$ tidak terikat kuat oleh gravitasi. Di stratosfer, partikel ini terbawa sirkulasi angin global, menciptakan efek pendinginan bumi (*volcanic winter*).
            </p>
          </div>
        </div>
      )}
      </div>

      {/* Info Modal Overlay */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" /> Daftar Pustaka
                </h3>
                <button onClick={() => setShowInfo(false)} className="text-neutral-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-neutral-300 space-y-6">

                <section className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-neutral-300 block mb-3">Landasan Teori Dinamika Fluida & Plume:</span>
                      <ul className="space-y-3">
                        <li>
                          <a href="https://doi.org/10.1029/1998RG000054" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs">Robock, A. (2000). <i className="text-neutral-300">Volcanic eruptions and climate.</i> Reviews of Geophysics.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="https://doi.org/10.1016/j.cageo.2013.10.016" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs">Tsunematsu et al. (2014). <i className="text-neutral-300">A numerical model of ballistic transport with collisions in a volcanic setting.</i> Computers & Geosciences.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="https://ui.adsabs.harvard.edu/abs/1992nrfa.book.....P" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs">Press et al. (1992). <i className="text-neutral-300">Numerical Recipes in C: The Art of Scientific Computing.</i> Cambridge Univ. Press.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="https://doi.org/10.1016/j.jvolgeores.2009.01.008" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs">Mastin, L. G., et al. (2009). <i className="text-neutral-300">A multidisciplinary effort to assign realistic source parameters to models of volcanic ash-cloud transport.</i> Journal of Volcanology and Geothermal Research.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="https://doi.org/10.1007/BF01073509" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs">Sparks, R. S. J. (1986). <i className="text-neutral-300">The dimensions and dynamics of volcanic eruption columns.</i> Bulletin of Volcanology.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-neutral-800">
                      <span className="font-bold text-neutral-300 block mb-3">Data Kejadian Vulkanik (VEI & Sejarah):</span>
                      <ul className="space-y-3">
                        <li>
                          <a href="https://volcano.si.edu/" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs"><b className="text-neutral-300">Global Volcanism Program (GVP)</b>, Smithsonian Institution - Database standar klasifikasi VEI.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="https://vsi.esdm.go.id/" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs"><b className="text-neutral-300">Badan Geologi (PVMBG) Indonesia</b> - Data historis aktivitas erupsi gunung api Nusantara.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.nature.com/articles/359050a0" target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900/50 hover:bg-neutral-800 p-3 rounded-lg border border-neutral-800 hover:border-orange-500/30 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-neutral-400 text-xs">Rampino, M. R., & Self, S. (1992). <i className="text-neutral-300">Volcanic winter and accelerated glaciation following the Toba super-eruption.</i> Nature.</span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 shrink-0" />
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 mt-2 border-t border-neutral-800">
                      <span className="font-bold text-red-400 block mb-3">Limitasi & Asumsi Model (Simplifikasi):</span>
                      <div className="space-y-3">
                        <div className="bg-neutral-900/80 p-3.5 rounded-lg border border-neutral-800/80">
                          <h4 className="text-neutral-300 text-xs font-bold mb-1">1. Gaya Angkat (Magnus Effect) Diabaikan</h4>
                          <p className="text-neutral-400 text-xs leading-relaxed">Rotasi (spin) proyektil vulkanik tidak beraturan di udara yang dapat menciptakan gaya angkat (Lift Force) tak terduga tidak dimodelkan demi efisiensi komputasi real-time. Mesin RK4 hanya menghitung Drag Force translasi.</p>
                        </div>
                        <div className="bg-neutral-900/80 p-3.5 rounded-lg border border-neutral-800/80">
                          <h4 className="text-neutral-300 text-xs font-bold mb-1">2. Asumsi Proyektil Bulat (Spherical Equivalent)</h4>
                          <p className="text-neutral-400 text-xs leading-relaxed">Meski koefisien drag (Cd) dan densitas dapat dikustomisasi, batuan asimetris (tajam/pipih) disederhanakan menjadi bentuk bola hipotetis dengan volume yang setara dalam perhitungan luas penampang hambat.</p>
                        </div>
                        <div className="bg-neutral-900/80 p-3.5 rounded-lg border border-neutral-800/80">
                          <h4 className="text-neutral-300 text-xs font-bold mb-1">3. Gravitasi Permukaan Ideal & Elipsoid Bumi</h4>
                          <p className="text-neutral-400 text-xs leading-relaxed">Variasi medan gravitasi sekunder akibat bentuk ekuatorial Bumi (Elipsoid WGS84) tidak dimasukkan. Penurunan percepatan gravitasi difungsikan linear terhadap elevasi menggunakan baseline 9.80665 m/s².</p>
                        </div>
                        <div className="bg-neutral-900/80 p-3.5 rounded-lg border border-neutral-800/80">
                          <h4 className="text-neutral-300 text-xs font-bold mb-1">4. Ketiadaan Updraft Konveksi Termal</h4>
                          <p className="text-neutral-400 text-xs leading-relaxed">Partikel dilontarkan menembus profil atmosfer standar (ISA 1976). Arus konveksi gas super-panas (turbulent updraft) pada tiang asap plume kawah tidak dikalkulasikan, padahal hal ini sangat mengubah viskositas udara lokal.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
              
              <div className="p-5 border-t border-neutral-800 bg-neutral-900/50 flex justify-end">
                <button 
                  onClick={() => setShowInfo(false)}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
