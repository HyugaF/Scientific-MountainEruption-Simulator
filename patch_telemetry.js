const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

const startIndex = code.indexOf('{/* UTAMA (Merah) */}');
const endIndex = code.indexOf(')}', code.indexOf('Catatan: Data telemetri ini diambil murni dari kalkulasi')) + 2;

if (startIndex !== -1 && endIndex !== -1) {
  const newTelemetrySection = `{/* TELEMETRY DATA (DINAMIS MENGIKUTI TOGGLE) */}
              {activeResult?.telemetry && (
                <div className="flex flex-col gap-4">
                  <h3 className={\`\${trajectoryType === 'primary' ? 'text-orange-400 border-orange-500/30' : 'text-red-500 border-red-500/30'} font-semibold flex items-center gap-2 border-b pb-2\`}>
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
                      <div className={\`text-[9px] mt-1 \${(activeResult.telemetry.launchVelocity / activeResult.telemetry.initialA) > 1.0 ? 'text-red-400' : 'text-green-500'}\`}>Status: {(activeResult.telemetry.launchVelocity / activeResult.telemetry.initialA) > 1.0 ? 'Supersonic (Shockwave Drag)' : 'Subsonic'}</div>
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
                      <div className={\`text-[9px] mt-1 \${trajectoryType === 'primary' ? 'text-orange-400' : 'text-red-400'}\`}>Membelokkan partikel ke {(activeResult.telemetry.coriolisF > 0) ? 'Kanan (Utara)' : (activeResult.telemetry.coriolisF < 0) ? 'Kiri (Selatan)' : 'Nihil (Ekuator)'}</div>
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
                      <div className={\`font-mono \${trajectoryType === 'primary' ? 'text-orange-400' : 'text-red-400'}\`}>{(activeResult.maxDistance / 1000).toFixed(2)} km</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-800 pt-3">
                    Catatan: Data telemetri ini diambil murni dari kalkulasi Runge-Kutta Orde 4 (RK4) untuk {trajectoryType === 'primary' ? 'partikel utama' : 'skenario terburuk'} yang sedang dianalisis di grafik.
                  </div>
                </div>
              )}`;

  code = code.substring(0, startIndex) + newTelemetrySection + code.substring(endIndex);
  fs.writeFileSync('components/ChartAnalysis.tsx', code);
  console.log("Replaced successfully via substrings!");
} else {
  console.log("Indices not found!", startIndex, endIndex);
}
