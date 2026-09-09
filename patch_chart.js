const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf-8');

const telemetrySection = `
            <div className="flex flex-col gap-6">
              {/* UTAMA (Merah) */}
              {ballisticResult.primary?.telemetry && (
                <div>
                  <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2 border-b border-red-500/30 pb-2">
                    <Calculator className="w-4 h-4" /> Utama (Garis Merah)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Massa & Radius Benda */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Radius Proyektil (r)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">r = (m / (ρ_rock * 4/3 * π))^(1/3)</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">r = ({ballisticResult.primary.telemetry.mass.toFixed(1)} / ({ballisticResult.primary.telemetry.rockDensity} * 1.333 * 3.14))^(1/3)</div>
                      <div className="font-mono text-sm text-neutral-200">r = {ballisticResult.primary.telemetry.radius.toFixed(3)} m</div>
                    </div>

                    {/* Initial Mach Number */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Mach Number Awal (M)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">M = V0 / a_initial</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">M = {ballisticResult.primary.telemetry.launchVelocity.toFixed(1)} / {ballisticResult.primary.telemetry.initialA.toFixed(1)}</div>
                      <div className="font-mono text-sm text-neutral-200">M = {(ballisticResult.primary.telemetry.launchVelocity / ballisticResult.primary.telemetry.initialA).toFixed(3)}</div>
                      <div className="text-[9px] text-red-400 mt-1">Status: {(ballisticResult.primary.telemetry.launchVelocity / ballisticResult.primary.telemetry.initialA) > 1.0 ? 'Supersonic (Shockwave Drag)' : 'Subsonic'}</div>
                    </div>

                    {/* Gaya Hambat Udara (Drag) */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Gaya Hambat Awal (F_drag)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">F_drag = ½ * ρ * V0² * Cd * A</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">F_drag = 0.5 * {ballisticResult.primary.telemetry.initialRho.toFixed(3)} * {Math.pow(ballisticResult.primary.telemetry.launchVelocity, 2).toFixed(1)} * {ballisticResult.primary.telemetry.baseCd} * {(Math.PI * Math.pow(ballisticResult.primary.telemetry.radius, 2)).toFixed(3)}</div>
                      <div className="font-mono text-sm text-neutral-200">F_drag = {((0.5 * ballisticResult.primary.telemetry.initialRho * Math.pow(ballisticResult.primary.telemetry.launchVelocity, 2) * ballisticResult.primary.telemetry.baseCd * (Math.PI * Math.pow(ballisticResult.primary.telemetry.radius, 2))) / 1000).toFixed(2)} kN</div>
                    </div>

                    {/* Parameter Coriolis */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Parameter Coriolis (f)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">f = 2 * Ω * sin(latitude)</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">f = 2 * 0.000072921 * sin(lat_rad)</div>
                      <div className="font-mono text-sm text-neutral-200">f = {ballisticResult.primary.telemetry.coriolisF.toExponential(4)} s⁻¹</div>
                      <div className="text-[9px] text-red-400 mt-1">Membelokkan partikel ke {(ballisticResult.primary.telemetry.coriolisF > 0) ? 'Kanan (Belahan Bumi Utara)' : (ballisticResult.primary.telemetry.coriolisF < 0) ? 'Kiri (Belahan Bumi Selatan)' : 'Nihil (Ekuator)'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* WORST CASE (Hijau) */}
              {ballisticResult.worstCase?.telemetry && (
                <div>
                  <h3 className="text-green-500 font-semibold mb-3 mt-4 flex items-center gap-2 border-b border-green-500/30 pb-2">
                    <Calculator className="w-4 h-4" /> Skenario Terburuk (Garis Hijau)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Massa & Radius Benda */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Radius Proyektil (r)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">r = (m / (ρ_rock * 4/3 * π))^(1/3)</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">r = ({ballisticResult.worstCase.telemetry.mass.toFixed(1)} / ({ballisticResult.worstCase.telemetry.rockDensity} * 1.333 * 3.14))^(1/3)</div>
                      <div className="font-mono text-sm text-neutral-200">r = {ballisticResult.worstCase.telemetry.radius.toFixed(3)} m</div>
                    </div>

                    {/* Initial Mach Number */}
                    <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
                      <div className="text-xs text-neutral-500 uppercase font-bold mb-2">Mach Number Awal (M)</div>
                      <div className="font-mono text-[10px] text-blue-300 mb-1">M = V0 / a_initial</div>
                      <div className="font-mono text-[10px] text-neutral-400 mb-2">M = {ballisticResult.worstCase.telemetry.launchVelocity.toFixed(1)} / {ballisticResult.worstCase.telemetry.initialA.toFixed(1)}</div>
                      <div className="font-mono text-sm text-neutral-200">M = {(ballisticResult.worstCase.telemetry.launchVelocity / ballisticResult.worstCase.telemetry.initialA).toFixed(3)}</div>
                      <div className="text-[9px] text-green-500 mt-1">Status: {(ballisticResult.worstCase.telemetry.launchVelocity / ballisticResult.worstCase.telemetry.initialA) > 1.0 ? 'Supersonic (Shockwave Drag)' : 'Subsonic'}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Max Values Info */}
              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 flex justify-between items-center mt-2"> 
                <div>
                  <div className="text-xs text-neutral-500 uppercase">Mach Number Puncak</div>
                  <div className="font-mono text-neutral-200">M {Math.max(ballisticResult.worstCase?.telemetry?.maxMach || 0, ballisticResult.primary?.telemetry?.maxMach || 0).toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500 uppercase">Drag Coeff (Cd) Puncak</div>
                  <div className="font-mono text-neutral-200">{Math.max(ballisticResult.worstCase?.telemetry?.maxCd || 0, ballisticResult.primary?.telemetry?.maxCd || 0).toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500 uppercase">Jarak Tempuh Maks (Worst Case)</div>
                  <div className="font-mono text-orange-400">{(ballisticResult.maxDistance / 1000).toFixed(2)} km</div>
                </div>
              </div>

              <div className="text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-800 pt-3">
                Catatan: Data telemetri ini diambil murni dari kalkulasi Runge-Kutta Orde 4 (RK4) untuk partikel lintasan utama (merah) dan partikel terjauh/worst-case (hijau) yang menyebar.
              </div>
            </div>`;

// Regex replace the old telemetry section
const startIndex = code.indexOf('<h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">');
const endIndex = code.indexOf('</div>', code.indexOf('Catatan: Data telemetri ini diambil murni'));

if (startIndex !== -1 && endIndex !== -1) {
  const newCode = code.substring(0, startIndex) + telemetrySection + code.substring(endIndex + 6);
  fs.writeFileSync('components/ChartAnalysis.tsx', newCode);
  console.log("Success");
} else {
  console.log("Failed to find indices");
}
