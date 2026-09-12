'use client';
import { useState } from 'react';
import { TrajectoryPoint, AshPoint, AcademicMetrics } from '@/utils/physics';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, ReferenceDot } from 'recharts';
import { Target, Mountain, Clock, Globe, Wind, Zap, Flame, ThermometerSnowflake, Download, Table2, BarChart2, TrendingUp, Calculator, MonitorPlay } from 'lucide-react';
import { SimulationMode } from '@/hooks/useSimulation';
import Projectile2DView from './Projectile2DView';

interface Props {
  mode: SimulationMode;
  ballisticResult: {
    primary: import('@/utils/physics').TrajectoryResult;
    worstCase: import('@/utils/physics').TrajectoryResult;
    spread: import('@/utils/physics').TrajectoryResult[];
    maxDistance: number;
    maxHeight: number;
    timeOfFlight: number;
    telemetry?: any;
  };
  aerosolResult: {
    trajectory: AshPoint[];
    maxDistance: number;
    maxRadius: number;
  };
  academicMetrics: AcademicMetrics;
  progressIndex: number;
  onExport?: () => void;
}

export default function ChartAnalysis({ mode, ballisticResult, aerosolResult, academicMetrics, progressIndex, onExport }: Props) {
  const [viewMode, setViewMode] = useState<'chart_full' | 'chart_track' | 'table' | 'telemetry' | '2d_anim'>('chart_full');
  const [trajectoryType, setTrajectoryType] = useState<'primary' | 'worstCase'>('primary');
  
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (mode === 'ballistic') {
      csvContent += "Time (s),Horizontal Distance (km),Altitude (km),Velocity (m/s),Latitude,Longitude\n";
      ballisticResult.primary.trajectory.forEach(p => {
        csvContent += `${p.t.toFixed(2)},${(p.x/1000).toFixed(3)},${(p.y/1000).toFixed(3)},${p.v.toFixed(2)},${p.lat.toFixed(6)},${p.lng.toFixed(6)}\n`;
      });
    } else {
      csvContent += "Day,Spread Distance (km),Diffusion Radius (km),Latitude,Longitude\n";
      aerosolResult.trajectory.forEach(p => {
        csvContent += `${p.day.toFixed(1)},${p.distanceKm.toFixed(2)},${p.radiusKm.toFixed(2)},${p.lat.toFixed(6)},${p.lng.toFixed(6)}\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `simulation_data_${mode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (mode === 'ballistic') {
    const maxPoints = 100;
    const activeResult = trajectoryType === 'primary' ? ballisticResult.primary : ballisticResult.worstCase;
    const activeTrajectory = activeResult.trajectory;
    const step = Math.max(1, Math.floor(activeTrajectory.length / maxPoints));
    
    const maxX = Number((activeResult.maxDistance / 1000).toFixed(2));
    const maxY = Number((activeResult.maxHeight / 1000).toFixed(2));
    const currentPointIndex = Math.min(progressIndex, activeTrajectory.length - 1);
    const currentPoint = activeTrajectory[currentPointIndex];

    const data = activeTrajectory
      .filter((_, i) => viewMode !== 'chart_track' || i <= currentPointIndex)
      .filter((_, i, arr) => i % step === 0 || i === arr.length - 1)
      .map(p => ({
        x_km: Number((p.x / 1000).toFixed(2)),
        y_km: Number((p.y / 1000).toFixed(2)),
        ground_km: Number(((p.groundElev || 0) / 1000).toFixed(2)),
        ground_area: [-Math.max(maxY * 0.15, 1), Number(((p.groundElev || 0) / 1000).toFixed(2))],
        time: Number(p.t.toFixed(1)),
        vel: Number(p.v.toFixed(0)),
      }));

    return (
      <div className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-y-auto overflow-x-hidden shadow-lg border border-neutral-800 pt-3 sm:pt-4 relative">
        
        {/* Top Header Row (Metrics + Actions) */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pb-4 px-3 sm:px-4 border-b border-neutral-800/50">
          {/* Academic Metrics Banner */}
          <div className="grid grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 sm:gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Tinggi Kolom (Plume)</span>
              <div className="flex items-center gap-1.5 text-blue-400">
                <Mountain className="w-4 h-4" />
                <span className="font-mono text-sm">{academicMetrics.plumeHeightKm.toFixed(1)} km</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Mass Eruption Rate</span>
              <div className="flex items-center gap-1.5 text-red-500">
                <Flame className="w-4 h-4" />
                <span className="font-mono text-sm">{academicMetrics.massEruptionRateKgS.toExponential(2)} kg/s</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Daya Ledak (TNT)</span>
              <div className="flex items-center gap-1.5 text-orange-500">
                <Zap className="w-4 h-4" />
                <span className="font-mono text-sm text-white">{academicMetrics.megatonsTNT} MT</span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-neutral-800/50 rounded-lg p-1">
              <button 
                onClick={() => setTrajectoryType('primary')} 
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${trajectoryType === 'primary' ? 'bg-orange-500/20 text-orange-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Utama
              </button>
              <button 
                onClick={() => setTrajectoryType('worstCase')} 
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${trajectoryType === 'worstCase' ? 'bg-red-500/20 text-red-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Terburuk
              </button>
            </div>
            
            <div className="flex bg-neutral-800/50 rounded-lg p-1">
              <button onClick={() => setViewMode('2d_anim')} className={`p-1.5 rounded-md transition-colors ${viewMode === '2d_anim' ? 'bg-neutral-700 text-green-400' : 'text-neutral-400 hover:text-white'}`} title="Animasi 2D Tracker">
                <MonitorPlay className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('telemetry')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'telemetry' ? 'bg-neutral-700 text-orange-400' : 'text-neutral-400 hover:text-white'}`} title="Perhitungan Langsung (Telemetri)">
                <Calculator className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('chart_track')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart_track' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`} title="Grafik Tracking Proyektil">
                <TrendingUp className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('chart_full')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart_full' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`} title="Grafik Keseluruhan Lintasan">
                <BarChart2 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`} title="Tabel Data">
                <Table2 className="w-4 h-4" />
              </button>
            </div>
            {onExport && (
            <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-xs font-medium transition-colors text-neutral-400 hover:text-white" title="Unduh Laporan PDF">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          )}
          </div>
        </div>

        {viewMode.startsWith('chart') ? (
          <>
            <div className="flex items-center justify-between px-2 sm:px-4 mb-2 sm:mb-4">
              <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2 text-center sm:text-left">
                <Target className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wider leading-tight">Jarak Maksimum</div>
                  <div className="text-sm sm:text-xl font-light text-white">{(activeResult.maxDistance / 1000).toFixed(2)} <span className="text-sm font-normal text-neutral-400">km</span></div>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2 text-center sm:text-left">
                <Mountain className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wider leading-tight">Ketinggian Apex</div>
                  <div className="text-sm sm:text-xl font-light text-white">{(activeResult.maxHeight / 1000).toFixed(2)} <span className="text-sm font-normal text-neutral-400">km</span></div>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2 text-center sm:text-left">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wider leading-tight">Lama Terbang</div>
                  <div className="text-sm sm:text-xl font-light text-white">{activeResult.timeOfFlight.toFixed(1)} <span className="text-sm font-normal text-neutral-400">s</span></div>
                </div>
              </div>
            </div>

            <div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2 px-0 sm:px-2 pb-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis type="number" dataKey="x_km" domain={[0, maxX]} stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(val) => `${Number(val.toFixed(1))} km`} />
                  <YAxis width={65} type="number" domain={[-Math.max(maxY * 0.15, 1), maxY * 1.1]} stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(val) => `${Number(val.toFixed(1))} km`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f97316' }}
                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'y_km') return [`${value} km`, 'Ketinggian Proyektil'];
                      if (name === 'ground_area') return [Array.isArray(value) ? `${value[1]} km` : `${value} km`, 'Elevasi Tanah Asli'];
                      if (name === 'vel') return [`${value} m/s`, 'Kecepatan'];
                      return [`${value}`, name];
                    }}
                    labelFormatter={(label) => `Jarak: ${label} km`}
                  />
                  <Area isAnimationActive={false} type="step" dataKey="ground_area" stroke="#059669" fill="#059669" fillOpacity={0.1} strokeWidth={1} />
                  <Line isAnimationActive={false} type="monotone" dataKey="y_km" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#f97316', stroke: '#fff' }} />
                  {currentPoint && (
                    <ReferenceDot 
                      x={Number((currentPoint.x / 1000).toFixed(2))} 
                      y={Number((currentPoint.y / 1000).toFixed(2))} 
                      r={6} fill="#ef4444" stroke="#fff" strokeWidth={2}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : viewMode === '2d_anim' ? (
          <div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2 px-0 sm:px-2 pb-0">
            <Projectile2DView trajectory={activeTrajectory} progressIndex={progressIndex} />
          </div>
        ) : viewMode === 'table' ? (
          <div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 overflow-auto border-t border-neutral-800 mt-2">
            <table className="w-full text-left text-xs text-neutral-400">
              <thead className="bg-neutral-800/50 text-neutral-300 sticky top-0 uppercase font-medium">
                <tr>
                  <th className="px-4 py-2">Waktu (s)</th>
                  <th className="px-4 py-2">Jarak (km)</th>
                  <th className="px-4 py-2">Ketinggian (km)</th>
                  <th className="px-4 py-2">Kecepatan (m/s)</th>
                  <th className="px-4 py-2">Lintang</th>
                  <th className="px-4 py-2">Bujur</th>
                </tr>
              </thead>
              <tbody>
                {activeTrajectory.slice(0, progressIndex + 1).filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length/100)) === 0 || i === arr.length - 1).map((p, idx) => (
                  <tr key={idx} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="px-4 py-1.5">{p.t.toFixed(1)}</td>
                    <td className="px-4 py-1.5 text-orange-400">{(p.x/1000).toFixed(2)}</td>
                    <td className="px-4 py-1.5 text-blue-400">{(p.y/1000).toFixed(2)}</td>
                    <td className="px-4 py-1.5">{p.v.toFixed(1)}</td>
                    <td className="px-4 py-1.5 font-mono text-[10px]">{p.lat.toFixed(4)}</td>
                    <td className="px-4 py-1.5 font-mono text-[10px]">{p.lng.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4 bg-neutral-950/50 rounded-lg border border-neutral-800 text-sm">
            
            <div className="flex flex-col gap-6">
              {/* TELEMETRY DATA (DINAMIS MENGIKUTI TOGGLE) */}
              {activeResult?.telemetry && (
                <div className="flex flex-col gap-4">
                  <h3 className={`${trajectoryType === 'primary' ? 'text-orange-400 border-orange-500/30' : 'text-red-500 border-red-500/30'} font-semibold flex items-center gap-2 border-b pb-2`}>
                    <Calculator className="w-4 h-4" /> 
                    {trajectoryType === 'primary' ? 'Skenario Utama (Proyektil Rata-rata)' : 'Skenario Terburuk (Proyektil Terjauh)'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Massa & Radius Benda */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Radius Proyektil (r)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">r = (m / (ρ_rock * 4/3 * π))^(1/3)</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">r = ({activeResult.telemetry.mass.toFixed(1)} / ({activeResult.telemetry.rockDensity} * 1.333 * 3.14))^(1/3)</div>
                      <div className="font-mono text-sm text-neutral-200">r = {activeResult.telemetry.radius.toFixed(3)} m</div>
                    </div>

                    {/* Initial Mach Number */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Mach Number Awal (M)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">M = V0 / a_initial<br/>a = √(γ·R·T₀)</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">M = {activeResult.telemetry.launchVelocity.toFixed(1)} / {activeResult.telemetry.initialA.toFixed(1)}</div>
                      <div className="font-mono text-sm text-neutral-200">M = {(activeResult.telemetry.launchVelocity / activeResult.telemetry.initialA).toFixed(3)}</div>
                      <div className={`text-[9px] mt-1 ${(activeResult.telemetry.launchVelocity / activeResult.telemetry.initialA) > 1.0 ? 'text-red-400' : 'text-green-500'}`}>Status: {(activeResult.telemetry.launchVelocity / activeResult.telemetry.initialA) > 1.0 ? 'Supersonic (Shockwave Drag)' : 'Subsonic'}</div>
                    </div>

                    {/* Gaya Hambat Udara (Drag) */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Gaya Hambat Awal (F_drag)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">F_drag = ½ * ρ * V0² * Cd * A</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">F_drag = 0.5 * {activeResult.telemetry.initialRho.toFixed(3)} * {Math.pow(activeResult.telemetry.launchVelocity, 2).toFixed(1)} * {activeResult.telemetry.baseCd} * {(Math.PI * Math.pow(activeResult.telemetry.radius, 2)).toFixed(3)}</div>
                      <div className="font-mono text-sm text-neutral-200">F_drag = {((0.5 * activeResult.telemetry.initialRho * Math.pow(activeResult.telemetry.launchVelocity, 2) * activeResult.telemetry.baseCd * (Math.PI * Math.pow(activeResult.telemetry.radius, 2))) / 1000).toFixed(2)} kN</div>
                    </div>

                    {/* Parameter Coriolis */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Parameter Coriolis (f)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">f = 2 * Ω * sin(latitude)</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">f = 2 * 0.000072921 * sin(lat_rad)</div>
                      <div className="font-mono text-sm text-neutral-200">f = {activeResult.telemetry.coriolisF.toExponential(4)} s⁻¹</div>
                      <div className={`text-[9px] mt-1 ${trajectoryType === 'primary' ? 'text-orange-400' : 'text-red-400'}`}>Membelokkan partikel ke {(activeResult.telemetry.coriolisF > 0) ? 'Kanan (Utara)' : (activeResult.telemetry.coriolisF < 0) ? 'Kiri (Selatan)' : 'Nihil (Ekuator)'}</div>
                    </div>
                  </div>

                  {/* Max Values Info */}
                  <div className="p-3 bg-neutral-900 rounded border border-neutral-800 flex justify-between items-center mt-2"> 
                    <div>
                      <div className="text-xs text-neutral-500 uppercase">Mach Number Puncak</div>
                      <div className="font-mono text-neutral-200">M {activeResult.telemetry.maxMach.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 uppercase">Drag Coeff (Cd) Puncak</div>
                      <div className="font-mono text-neutral-200">{activeResult.telemetry.maxCd.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-500 uppercase">Jarak Tempuh Maks</div>
                      <div className={`font-mono ${trajectoryType === 'primary' ? 'text-orange-400' : 'text-red-400'}`}>{(activeResult.maxDistance / 1000).toFixed(2)} km</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-800 pt-3">
                    Catatan: Data telemetri ini diambil murni dari kalkulasi Runge-Kutta Orde 4 (RK4) untuk {trajectoryType === 'primary' ? 'partikel utama' : 'skenario terburuk'} yang sedang dianalisis di grafik.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // AEROSOL MODE
  const currentAerosolPointIndex = Math.min(progressIndex, aerosolResult.trajectory.length - 1);
  const currentAerosolPoint = aerosolResult.trajectory[currentAerosolPointIndex];

  const aerosolData = aerosolResult.trajectory
    .filter((_, i) => viewMode !== 'chart_track' || i <= currentAerosolPointIndex)
    .map((p) => ({
      day: Number(p.day.toFixed(1)),
      dist: Number(p.distanceKm.toFixed(0)),
      radius: Number(p.radiusKm.toFixed(0)),
    }));
    
  const maxDays = aerosolResult.trajectory[aerosolResult.trajectory.length - 1]?.day || 30;
  const maxAerosolDist = aerosolResult.maxDistance;

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-y-auto overflow-x-hidden shadow-lg border border-neutral-800 pt-3 sm:pt-4 relative">
      
      {/* Top Header Row (Metrics + Actions) */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pb-4 px-3 sm:px-4 border-b border-neutral-800/50">
        
        {/* Academic Metrics Banner (Climate) */}
        <div className="grid grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 sm:gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Skala VEI Erupsi</span>
            <div className="flex items-center gap-1.5 text-orange-500">
              <Mountain className="w-4 h-4" />
              <span className="font-mono text-sm text-white">VEI {academicMetrics.vei}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Penurunan Suhu Global</span>
            <div className="flex items-center gap-1.5 text-blue-400">
              <ThermometerSnowflake className="w-4 h-4" />
              <span className="font-mono text-sm">-{academicMetrics.globalCoolingC}°C</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Total Massa Ejekta</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Globe className="w-4 h-4" />
              <span className="font-mono text-sm">{academicMetrics.totalMassKg.toExponential(2)} kg</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-neutral-800/50 rounded-lg p-1">
            <button onClick={() => setViewMode('chart_track')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart_track' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`} title="Grafik Tracking">
              <TrendingUp className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('chart_full')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart_full' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`} title="Grafik Keseluruhan">
              <BarChart2 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`} title="Tabel Data">
              <Table2 className="w-4 h-4" />
            </button>
          </div>
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-xs font-medium transition-colors text-neutral-400 hover:text-white" title="Unduh Laporan PDF">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          )}
        </div>
      </div>

      {viewMode.startsWith('chart') ? (
        <>
          <div className="flex items-center justify-around px-2 sm:px-4 mb-2 sm:mb-4">
            <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2 text-center sm:text-left">
              <Globe className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wider leading-tight">Jarak Tempuh Global</div>
                <div className="text-sm sm:text-xl font-light text-white">{(aerosolResult.maxDistance).toFixed(0)} <span className="text-sm font-normal text-neutral-400">km</span></div>
              </div>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2 text-center sm:text-left">
              <Wind className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wider leading-tight">Maks Radius Sebaran</div>
                <div className="text-sm sm:text-xl font-light text-white">{(aerosolResult.maxRadius).toFixed(0)} <span className="text-sm font-normal text-neutral-400">km</span></div>
              </div>
            </div>
          </div>

          <div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2 px-0 sm:px-2 pb-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <ComposedChart data={aerosolData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis type="number" dataKey="day" domain={[0, maxDays]} stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(val) => `Hari ${Number(val.toFixed(1))}`} />
                <YAxis width={65} type="number" domain={[0, maxAerosolDist * 1.1]} stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(val) => `${Number(val.toFixed(0))} km`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#a855f7' }}
                  labelStyle={{ color: '#888', marginBottom: '4px' }}
                  formatter={(value: any, name: any) => [`${value} km`, name === 'dist' ? 'Jarak Tempuh' : 'Radius Difusi']}
                  labelFormatter={(label) => `Hari ke-${label}`}
                />
                <Area isAnimationActive={false} type="monotone" dataKey="dist" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                {currentAerosolPoint && (
                  <ReferenceDot 
                    x={Number(currentAerosolPoint.day.toFixed(1))} 
                    y={Number(currentAerosolPoint.distanceKm.toFixed(0))} 
                    r={6} fill="#a855f7" stroke="#fff" strokeWidth={2}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 overflow-auto border-t border-neutral-800 mt-2">
          <table className="w-full text-left text-xs text-neutral-400">
            <thead className="bg-neutral-800/50 text-neutral-300 sticky top-0 uppercase font-medium">
              <tr>
                <th className="px-4 py-2">Waktu (Hari)</th>
                <th className="px-4 py-2">Jarak Tempuh (km)</th>
                <th className="px-4 py-2">Radius Sebaran (km)</th>
                <th className="px-4 py-2">Lintang</th>
                <th className="px-4 py-2">Bujur</th>
              </tr>
            </thead>
            <tbody>
              {aerosolResult.trajectory.slice(0, progressIndex + 1).map((p, idx) => (
                <tr key={idx} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="px-4 py-1.5 text-purple-400">{p.day.toFixed(1)}</td>
                  <td className="px-4 py-1.5">{p.distanceKm.toFixed(1)}</td>
                  <td className="px-4 py-1.5">{p.radiusKm.toFixed(1)}</td>
                  <td className="px-4 py-1.5 font-mono text-[10px]">{p.lat.toFixed(4)}</td>
                  <td className="px-4 py-1.5 font-mono text-[10px]">{p.lng.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
