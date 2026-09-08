'use client';
import { useState } from 'react';
import { TrajectoryPoint, AshPoint, AcademicMetrics } from '@/utils/physics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Target, Mountain, Clock, Globe, Wind, Zap, Flame, ThermometerSnowflake, Download, Table2, BarChart2, Calculator } from 'lucide-react';
import { SimulationMode } from '@/hooks/useSimulation';

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
}

export default function ChartAnalysis({ mode, ballisticResult, aerosolResult, academicMetrics, progressIndex }: Props) {
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'telemetry'>('chart');
  
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
    const primaryTrajectory = ballisticResult.primary.trajectory;
    const step = Math.max(1, Math.floor(primaryTrajectory.length / maxPoints));
    
    const maxX = Number((ballisticResult.maxDistance / 1000).toFixed(2));
    const maxY = Number((ballisticResult.maxHeight / 1000).toFixed(2));
    const currentT = primaryTrajectory[Math.min(progressIndex, primaryTrajectory.length - 1)]?.t ?? 0;

    const data = primaryTrajectory
      .filter(p => p.t <= currentT)
      .filter((_, i, arr) => i % step === 0 || i === arr.length - 1)
      .map(p => ({
        x_km: Number((p.x / 1000).toFixed(2)),
        y_km: Number((p.y / 1000).toFixed(2)),
        time: Number(p.t.toFixed(1)),
        vel: Number(p.v.toFixed(0)),
      }));

    return (
      <div className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-hidden shadow-lg border border-neutral-800 p-4 relative">
        
        {/* Header Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
            <button onClick={() => setViewMode('telemetry')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'telemetry' ? 'bg-neutral-700 text-orange-400' : 'text-neutral-400 hover:text-white'}`} title="Perhitungan Langsung (Telemetri)">
              <Calculator className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('chart')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
              <BarChart2 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
              <Table2 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-medium transition-colors">
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>

        {/* Academic Metrics Banner */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-800/50 pr-32">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Tinggi Kolom (Plume)</span>
            <div className="flex items-center gap-1.5 text-blue-400">
              <Mountain className="w-4 h-4" />
              <span className="font-mono text-sm">{academicMetrics.plumeHeightKm.toFixed(1)} km</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Mass Eruption Rate</span>
            <div className="flex items-center gap-1.5 text-red-500">
              <Flame className="w-4 h-4" />
              <span className="font-mono text-sm">{academicMetrics.massEruptionRateKgS.toExponential(2)} kg/s</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Daya Ledak (TNT)</span>
            <div className="flex items-center gap-1.5 text-orange-500">
              <Zap className="w-4 h-4" />
              <span className="font-mono text-sm text-white">{academicMetrics.megatonsTNT} MT</span>
            </div>
          </div>
        </div>

        {viewMode === 'chart' ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-3 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700/50">
                <Target className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Jarak Maksimum</div>
                  <div className="text-lg font-bold">{(ballisticResult.maxDistance / 1000).toFixed(2)} <span className="text-sm font-normal text-neutral-400">km</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700/50">
                <Mountain className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Ketinggian Apex</div>
                  <div className="text-lg font-bold">{(ballisticResult.maxHeight / 1000).toFixed(2)} <span className="text-sm font-normal text-neutral-400">km</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700/50">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Lama Terbang</div>
                  <div className="text-lg font-bold">{ballisticResult.timeOfFlight.toFixed(1)} <span className="text-sm font-normal text-neutral-400">s</span></div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis type="number" dataKey="x_km" domain={[0, maxX]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(val) => `${Number(val.toFixed(1))} km`} />
                  <YAxis width={65} type="number" domain={[0, maxY * 1.1]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(val) => `${Number(val.toFixed(1))} km`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f97316' }}
                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                    formatter={(value: any, name: any) => [
                      `${value} ${name === 'y_km' ? 'km' : (name === 'vel' ? 'm/s' : '')}`,
                      name === 'y_km' ? 'Ketinggian' : (name === 'vel' ? 'Kecepatan' : name)
                    ]}
                    labelFormatter={(label) => `Jarak: ${label} km`}
                  />
                  <Line isAnimationActive={false} type="monotone" dataKey="y_km" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#f97316', stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : viewMode === 'table' ? (
          <div className="flex-1 overflow-auto border border-neutral-800 rounded-lg">
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
                {primaryTrajectory.slice(0, progressIndex + 1).filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length/100)) === 0 || i === arr.length - 1).map((p, idx) => (
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
            <h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Log Perhitungan Saintifik (Skenario Terburuk / Garis Hijau)
            </h3>
            
            {ballisticResult.telemetry ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Massa & Radius Benda */}
                <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Radius Proyektil (r)</div>
                  <div className="font-mono text-[10px] text-blue-300 mb-1">
                    r = (m / (ρ_rock * 4/3 * π))^(1/3)
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-2">
                    r = ({ballisticResult.telemetry.mass.toFixed(1)} / ({ballisticResult.telemetry.rockDensity} * 1.333 * 3.14))^(1/3)
                  </div>
                  <div className="font-mono text-sm text-neutral-200">
                    r = {ballisticResult.telemetry.radius.toFixed(3)} m
                  </div>
                </div>

                {/* Initial Mach Number */}
                <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Mach Number Awal (M)</div>
                  <div className="font-mono text-[10px] text-blue-300 mb-1">
                    M = V0 / a_initial
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-2">
                    M = {ballisticResult.telemetry.launchVelocity.toFixed(1)} / {ballisticResult.telemetry.initialA.toFixed(1)}
                  </div>
                  <div className="font-mono text-sm text-neutral-200">
                    M = {(ballisticResult.telemetry.launchVelocity / ballisticResult.telemetry.initialA).toFixed(3)}
                  </div>
                  <div className="text-[9px] text-orange-400 mt-1">Status: {(ballisticResult.telemetry.launchVelocity / ballisticResult.telemetry.initialA) > 1.0 ? 'Supersonic (Shockwave Drag)' : 'Subsonic'}</div>
                </div>

                {/* Gaya Hambat Udara (Drag) */}
                <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Gaya Hambat Awal (F_drag)</div>
                  <div className="font-mono text-[10px] text-blue-300 mb-1">
                    F_drag = ½ * ρ * V0² * Cd * A
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-2">
                    F_drag = 0.5 * {ballisticResult.telemetry.initialRho.toFixed(3)} * {Math.pow(ballisticResult.telemetry.launchVelocity, 2).toFixed(1)} * {ballisticResult.telemetry.baseCd} * {(Math.PI * Math.pow(ballisticResult.telemetry.radius, 2)).toFixed(3)}
                  </div>
                  <div className="font-mono text-sm text-neutral-200">
                    F_drag = {((0.5 * ballisticResult.telemetry.initialRho * Math.pow(ballisticResult.telemetry.launchVelocity, 2) * ballisticResult.telemetry.baseCd * (Math.PI * Math.pow(ballisticResult.telemetry.radius, 2))) / 1000).toFixed(2)} kN
                  </div>
                </div>

                {/* Parameter Coriolis */}
                <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Parameter Coriolis (f)</div>
                  <div className="font-mono text-[10px] text-blue-300 mb-1">
                    f = 2 * Ω * sin(latitude)
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400 mb-2">
                    f = 2 * 0.000072921 * sin(lat_rad)
                  </div>
                  <div className="font-mono text-sm text-neutral-200">
                    f = {ballisticResult.telemetry.coriolisF.toExponential(4)} s⁻¹
                  </div>
                  <div className="text-[9px] text-orange-400 mt-1">Membelokkan partikel ke {(ballisticResult.telemetry.coriolisF > 0) ? 'Kanan (Belahan Bumi Utara)' : (ballisticResult.telemetry.coriolisF < 0) ? 'Kiri (Belahan Bumi Selatan)' : 'Nihil (Ekuator)'}</div>
                </div>
                
                {/* Max Values Info */}
                <div className="p-3 bg-neutral-900 rounded border border-neutral-800 md:col-span-2 flex justify-between items-center">
                   <div>
                     <div className="text-xs text-neutral-500 uppercase">Mach Number Puncak (Sepanjang Trajektori)</div>
                     <div className="font-mono text-neutral-200">M {ballisticResult.telemetry.maxMach.toFixed(2)}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs text-neutral-500 uppercase">Drag Coeff (Cd) Puncak</div>
                     <div className="font-mono text-neutral-200">{ballisticResult.telemetry.maxCd.toFixed(2)}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs text-neutral-500 uppercase">Jarak Tempuh Maksimum</div>
                     <div className="font-mono text-orange-400">{(ballisticResult.maxDistance / 1000).toFixed(2)} km</div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-center py-8">Memuat data telemetri...</div>
            )}
            
            <div className="mt-4 text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-800 pt-3">
              Catatan: Data telemetri ini diambil murni dari kalkulasi Runge-Kutta Orde 4 (RK4) untuk partikel lintasan utama (garis merah), yang mengasumsikan proyektil meluncur sempurna searah angin untuk menguji radius bahaya terjauh (Worst-Case Mitigation).
            </div>
          </div>
        )}
      </div>
    );
  }

  // AEROSOL MODE
  const aerosolData = aerosolResult.trajectory
    .filter((_, i) => i <= progressIndex)
    .map((p) => ({
      day: Number(p.day.toFixed(1)),
      dist: Number(p.distanceKm.toFixed(0)),
      radius: Number(p.radiusKm.toFixed(0)),
    }));
    
  const maxDays = aerosolResult.trajectory[aerosolResult.trajectory.length - 1]?.day || 30;
  const maxAerosolDist = aerosolResult.maxDistance;

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-hidden shadow-lg border border-neutral-800 p-4 relative">
      
      {/* Header Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
          <button onClick={() => setViewMode('chart')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
            <BarChart2 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
            <Table2 className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-medium transition-colors">
          <Download className="w-4 h-4" />
          <span>CSV</span>
        </button>
      </div>

      {/* Academic Metrics Banner (Climate) */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-800/50 pr-32">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Skala VEI Erupsi</span>
          <div className="flex items-center gap-1.5 text-orange-500">
            <Mountain className="w-4 h-4" />
            <span className="font-mono text-sm text-white">VEI {academicMetrics.vei}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Penurunan Suhu Global</span>
          <div className="flex items-center gap-1.5 text-blue-400">
            <ThermometerSnowflake className="w-4 h-4" />
            <span className="font-mono text-sm">-{academicMetrics.globalCoolingC}°C</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Total Massa Ejekta</span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Globe className="w-4 h-4" />
            <span className="font-mono text-sm">{academicMetrics.totalMassKg.toExponential(2)} kg</span>
          </div>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700/50">
              <Globe className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Jarak Tempuh Global</div>
                <div className="text-lg font-bold">{(aerosolResult.maxDistance).toFixed(0)} <span className="text-sm font-normal text-neutral-400">km</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700/50">
              <Wind className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Maks Radius Sebaran</div>
                <div className="text-lg font-bold">{(aerosolResult.maxRadius).toFixed(0)} <span className="text-sm font-normal text-neutral-400">km</span></div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aerosolData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis type="number" dataKey="day" domain={[0, maxDays]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(val) => `Hari ${Number(val.toFixed(1))}`} />
                <YAxis width={65} type="number" domain={[0, maxAerosolDist * 1.1]} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={(val) => `${Number(val.toFixed(0))} km`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#a855f7' }}
                  labelStyle={{ color: '#888', marginBottom: '4px' }}
                  formatter={(value: any, name: any) => [`${value} km`, name === 'dist' ? 'Jarak Tempuh' : 'Radius Difusi']}
                  labelFormatter={(label) => `Hari ke-${label}`}
                />
                <Area isAnimationActive={false} type="monotone" dataKey="dist" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-auto border border-neutral-800 rounded-lg">
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
