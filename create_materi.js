const fs = require('fs');

const code = `import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Wind, Globe, Calculator, Mountain, ThermometerSnowflake, Zap } from 'lucide-react';

export default function MateriModule({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-black text-neutral-300 font-sans p-6 md:p-12 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors px-4 py-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 border border-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>

        <header className="mb-12 border-b border-neutral-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4 border border-blue-500/20">
            <BookOpen className="w-4 h-4" />
            Modul Referensi
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500 mb-4 tracking-tight">
            Dasar Teori & Algoritma Simulasi
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed max-w-3xl">
            Aplikasi Simulasi Trajektori Letusan Krakatau dibangun menggunakan pemodelan fisika komputasional yang kompleks. Modul ini menjelaskan persamaan matematika dan prinsip sains di balik simulasi yang Anda jalankan.
          </p>
        </header>

        <div className="space-y-16">
          
          {/* BAB 1: Balistik & Gaya Hambat */}
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 text-sm">1</span>
              Gerak Balistik & Gaya Hambat (Drag Force)
            </h2>
            <div className="prose prose-invert max-w-none text-neutral-300">
              <p>
                Ketika proyektil (seperti bom vulkanik atau *lapilli*) terlontar dari kawah gunung berapi, ia tidak hanya mengalami gaya gravitasi, melainkan juga berinteraksi dengan fluida atmosfer yang dilaluinya. Interaksi ini menghasilkan <strong>Gaya Hambat Udara (Air Drag)</strong>.
              </p>
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl my-6 shadow-inner">
                <p className="font-mono text-center text-blue-300 text-lg mb-2">F_drag = ½ · ρ · V² · Cd · A</p>
                <ul className="text-sm space-y-2 mt-4 text-neutral-400">
                  <li><strong>ρ (rho)</strong>: Kerapatan udara (berubah terhadap ketinggian berdasarkan model ISA).</li>
                  <li><strong>V</strong>: Kecepatan relatif proyektil terhadap udara (dipengaruhi kecepatan angin).</li>
                  <li><strong>Cd</strong>: Koefisien hambat (Drag Coefficient), sangat bergantung pada bilangan Mach.</li>
                  <li><strong>A</strong>: Luas penampang lintang proyektil.</li>
                </ul>
              </div>
              <p>
                Dalam simulasi ini, arah vektor gaya hambat selalu berlawanan dengan vektor kecepatan relatif proyektil terhadap udara (angin).
              </p>
            </div>
          </section>

          {/* BAB 2: Kompresibilitas & Mach Number */}
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-400 text-sm">2</span>
              Gelombang Kejut (Wave Drag) & Bilangan Mach
            </h2>
            <div className="prose prose-invert max-w-none text-neutral-300">
              <p>
                Material letusan berdaya ledak tinggi seringkali terlontar dengan kecepatan supersonik (melebihi kecepatan suara). Hal ini memicu fenomena kompresibilitas udara yang menghasilkan <em>shockwave</em> atau gelombang kejut.
              </p>
              <div className="flex flex-col md:flex-row gap-6 my-6">
                <div className="flex-1 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" /> Bilangan Mach (M)
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Rasio kecepatan objek terhadap kecepatan suara lokal (<code className="bg-black px-1 py-0.5 rounded text-yellow-300">M = V / a</code>). Kecepatan suara (<code className="bg-black px-1 py-0.5 rounded text-yellow-300">a</code>) sendiri berubah berdasarkan suhu atmosfer di berbagai ketinggian.
                  </p>
                </div>
                <div className="flex-1 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <Wind className="w-5 h-5 text-red-400" /> Lonjakan Drag (Cd Spike)
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Mendekati Mach 1 (Transonik), nilai <code className="bg-black px-1 py-0.5 rounded text-red-300">Cd</code> melonjak tajam (Wave Drag). Simulasi memodelkan puncak Cd hingga 2.5 kali lipat dari Cd dasar ketika <code className="bg-black px-1 py-0.5 rounded text-red-300">M = 1.0</code> hingga <code className="bg-black px-1 py-0.5 rounded text-red-300">1.2</code>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* BAB 3: Efek Coriolis */}
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm">3</span>
              Rotasi Bumi (Efek Coriolis)
            </h2>
            <div className="prose prose-invert max-w-none text-neutral-300">
              <p>
                Untuk lintasan proyektil jarak jauh yang menembus ketinggian puluhan kilometer, rotasi Bumi tidak bisa diabaikan. Simulasi ini menerapkan <strong>Gaya Coriolis</strong> lateral yang membelokkan proyektil secara geografis.
              </p>
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl my-6">
                <p className="font-mono text-center text-blue-300 text-lg mb-2">f = 2 · Ω · sin(φ)</p>
                <p className="text-sm text-neutral-400 text-center mt-2">
                  Di mana <strong>Ω</strong> adalah kecepatan sudut rotasi Bumi (7.2921 × 10⁻⁵ rad/s) dan <strong>φ</strong> adalah lintang geografi letusan.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="border border-neutral-800 rounded-lg p-3 text-center">
                    <strong className="text-white block mb-1">Bumi Belahan Utara</strong>
                    Dibelokkan ke <span className="text-orange-400">Kanan</span>
                  </div>
                  <div className="border border-neutral-800 rounded-lg p-3 text-center">
                    <strong className="text-white block mb-1">Bumi Belahan Selatan</strong>
                    Dibelokkan ke <span className="text-blue-400">Kiri</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BAB 4: RK4 */}
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 text-sm">4</span>
              Integrator Numerik: Runge-Kutta Orde 4 (RK4)
            </h2>
            <div className="prose prose-invert max-w-none text-neutral-300">
              <p>
                Karena densitas udara (<code className="bg-black px-1 py-0.5 rounded text-green-300">ρ</code>) berubah secara non-linear terhadap ketinggian, dan vektor kecepatan (<code className="bg-black px-1 py-0.5 rounded text-green-300">V</code>) berubah secara kuadratik terhadap gaya hambat, persamaan diferensial gerak ini tidak memiliki solusi analitis pasti (<em>closed-form</em>).
              </p>
              <p>
                Simulasi ini menyelesaikan sistem Persamaan Diferensial Biasa (ODE) tersebut menggunakan algoritma <strong>Runge-Kutta Orde 4 (RK4)</strong> yang sangat stabil. RK4 menghitung empat kemiringan (<em>slopes</em>) berurutan pada setiap interval waktu kecil (<code className="bg-black px-1 py-0.5 rounded text-green-300">Δt</code>) dan merata-ratakannya untuk memprediksi posisi dan kecepatan proyektil di langkah berikutnya secara presisi tinggi.
              </p>
            </div>
          </section>

          {/* BAB 5: Aerosol & VEI */}
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 text-sm">5</span>
              Injeksi Aerosol & Dampak Iklim (Volcanic Winter)
            </h2>
            <div className="prose prose-invert max-w-none text-neutral-300">
              <p>
                Mode Global (Aerosol) pada simulasi ini memodelkan pergerakan debu halus (<em>ash</em>) dan gas Sulfur Dioksida (SO₂) di lapisan Stratosfer. 
              </p>
              <div className="grid md:grid-cols-2 gap-6 my-6">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-purple-400" /> Penyebaran Stratosferik
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Begitu kolom letusan menembus Tropopause (ketinggian ~15 km), material terperangkap dalam angin kencang <em>Jet Stream</em> di Stratosfer yang mengelilingi bola Bumi, menyebarkan partikel puluhan ribu kilometer dalam hitungan minggu.
                  </p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                    <ThermometerSnowflake className="w-5 h-5 text-blue-400" /> Pendinginan Global
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Aerosol sulfat memantulkan radiasi matahari kembali ke luar angkasa (efek Albedo). Letusan masif dengan <strong>Volcanic Explosivity Index (VEI) 6+</strong> seperti Krakatau atau Tambora dapat memicu <em>Volcanic Winter</em>, di mana suhu rata-rata permukaan Bumi turun drastis (0.5°C hingga 2.0°C).
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-16 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          Modul simulasi direferensikan berdasarkan model fisika standar geofisika. <br/>Dikembangkan untuk pembelajaran dinamika letusan gunung api.
        </div>
      </div>
    </motion.div>
  );
}
`

fs.writeFileSync('components/MateriModule.tsx', code);
console.log("Successfully generated MateriModule.tsx");
