import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Wind, Globe, Mountain, ThermometerSnowflake, Zap, Thermometer, Compass, Activity, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';

export default function MateriModule({ onBack }: { onBack: () => void }) {
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    {
      id: 1,
      content: (
        <section>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 text-lg border border-sky-500/30">1</span>
            Model Atmosfer Standar (ISA)
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-neutral-300 leading-relaxed space-y-4">
              <p>
                Kerapatan udara (<code className="text-sky-300 bg-sky-900/30 px-1 rounded">&rho;</code>) dan kecepatan suara (<code className="text-sky-300 bg-sky-900/30 px-1 rounded">a</code>) tidaklah konstan. Keduanya menurun drastis seiring dengan bertambahnya ketinggian (<code className="text-sky-300 bg-sky-900/30 px-1 rounded">z</code>).
              </p>
              <p>
                Simulasi ini mengadopsi <strong>International Standard Atmosphere (ISA) 1976</strong>, yang membagi atmosfer menjadi beberapa lapisan. Untuk Troposfer (di bawah 11.000 meter), temperatur menurun berdasarkan <em>lapse rate</em>:
              </p>
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl font-serif text-lg shadow-inner text-sky-200 flex flex-col items-center gap-2">
                <div>T = T<sub>0</sub> + L &middot; z</div>
                <div>P = P<sub>0</sub> &middot; (T / T<sub>0</sub>)<sup>-g<sub>0</sub>&middot;M / (R&middot;L)</sup></div>
                <div className="mt-2 text-green-300">&rho; = (P &middot; M) / (R &middot; T)</div>
              </div>
              <ul className="text-sm space-y-2 text-neutral-400 list-none pl-2">
                <li><strong className="text-sky-300 inline-block w-8">T</strong> : Temperatur udara pada ketinggian z (K)</li>
                <li><strong className="text-sky-300 inline-block w-8">T<sub>0</sub></strong> : Temperatur udara permukaan laut (288.15 K)</li>
                <li><strong className="text-sky-300 inline-block w-8">L</strong> : Temperature lapse rate (-0.0065 K/m)</li>
                <li><strong className="text-sky-300 inline-block w-8">z</strong> : Ketinggian proyektil dari permukaan laut (m)</li>
                <li><strong className="text-sky-300 inline-block w-8">P</strong> : Tekanan udara pada ketinggian z (Pa)</li>
                <li><strong className="text-sky-300 inline-block w-8">P<sub>0</sub></strong> : Tekanan udara standar permukaan laut (101325 Pa)</li>
                <li><strong className="text-sky-300 inline-block w-8">g<sub>0</sub></strong> : Percepatan gravitasi standar (9.80665 m/s&sup2;)</li>
                <li><strong className="text-sky-300 inline-block w-8">M</strong> : Massa molar udara kering (0.0289644 kg/mol)</li>
                <li><strong className="text-sky-300 inline-block w-8">R</strong> : Konstanta gas universal (8.31432 J/(mol&middot;K))</li>
                <li><strong className="text-green-300 inline-block w-8">&rho;</strong> : Kerapatan udara lokal yang dicari (kg/m&sup3;)</li>
              </ul>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Thermometer className="w-5 h-5 text-sky-400" /> Profil Lapisan Udara
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                Ketika proyektil menembus <strong>Tropopause</strong> (11 km - 20 km), temperatur menjadi konstan di angka 216.65 K (-56.5 °C). Memasuki <strong>Stratosfer</strong> (&gt;20 km), temperatur kembali naik secara perlahan karena penyerapan radiasi ultraviolet oleh lapisan ozon. Model kami memperhitungkan diskontinuitas termal ini dengan presisi.
              </p>
            </div>
          </div>
        </section>
      )
    },
    {
      id: 2,
      content: (
        <section>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 text-lg border border-orange-500/30">2</span>
            Gaya Hambat Udara & Wave Drag (Supersonik)
          </h2>
          <div className="text-neutral-300 leading-relaxed space-y-6">
            <p>
              Lintasan benda yang terlontar akibat letusan sangat dipengaruhi oleh Gaya Hambat (<em>Drag Force</em>). Persamaan standar hambatan aerodinamis dinyatakan sebagai:
            </p>
            
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl font-serif text-center text-xl shadow-inner text-orange-300 max-w-2xl mx-auto">
              F<sub>drag</sub> = -<span className="text-2xl">&frac12;</span> &rho; |v<sub>rel</sub>| v<sub>rel</sub> C<sub>d</sub> A
            </div>
            
            <ul className="text-sm space-y-2 text-neutral-400 list-none pl-2 mt-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
              <li><strong className="text-orange-300 inline-block w-12">F<sub>drag</sub></strong> : Vektor gaya hambat aerodinamis udara (Newton)</li>
              <li><strong className="text-orange-300 inline-block w-12">&rho;</strong> : Kerapatan udara lokal pada ketinggian partikel (kg/m&sup3;)</li>
              <li><strong className="text-orange-300 inline-block w-12">v<sub>rel</sub></strong> : Vektor kecepatan relatif partikel terhadap angin (m/s)</li>
              <li><strong className="text-orange-300 inline-block w-12">|v<sub>rel</sub>|</strong> : Magnitudo (besaran skalar) dari kecepatan relatif (m/s)</li>
              <li><strong className="text-orange-300 inline-block w-12">C<sub>d</sub></strong> : Koefisien hambat udara (tak berdimensi, berubah terhadap Bilangan Mach)</li>
              <li><strong className="text-orange-300 inline-block w-12">A</strong> : Luas penampang lintang partikel (m&sup2;)</li>
            </ul>

            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Wind className="w-5 h-5 text-neutral-400" /> Vektor Kecepatan Relatif
                </h3>
                <p className="text-sm text-neutral-400">
                  Gaya hambat bekerja berlawanan dengan arah gerak partikel <em>relatif terhadap udara</em>, bukan relatif terhadap tanah. Jika kecepatan partikel adalah <code className="bg-neutral-800 px-1 rounded">v</code> dan vektor kecepatan angin adalah <code className="bg-neutral-800 px-1 rounded">w</code>, maka <code className="bg-neutral-800 px-1 rounded">v_rel = v - w</code>. Simulasi memisahkan angin di lapisan bawah (Troposfer) dan angin kencang di atas (Stratosfer).
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> Bilangan Mach & Lonjakan Cd
                </h3>
                <p className="text-sm text-neutral-400">
                  Batu vulkanik (Bom) seringkali melesat pada kecepatan supersonik. Bilangan Mach (<code className="bg-neutral-800 px-1 rounded">M = V/a</code>) sangat krusial. Pada fase transonik (Mach 0.8 - 1.2), udara di depan batu tidak sempat &quot;menghindar&quot;, menciptakan gelombang kejut (<em>shockwave</em>). Ini menyebabkan koefisien hambat (<code className="bg-neutral-800 px-1 rounded">Cd</code>) melonjak hingga <strong>2.5 kali lipat</strong> dari nilai dasarnya.
                </p>
              </div>
            </div>
          </div>
        </section>
      )
    },
    {
      id: 3,
      content: (
        <section>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 text-lg border border-indigo-500/30">3</span>
            Gaya Fiktif: Rotasi Bumi (Efek Coriolis)
          </h2>
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 text-neutral-300 leading-relaxed space-y-4">
              <p>
                Untuk lontaran ekstrem (seperti VEI 4 ke atas) yang mencapai ketinggian puluhan kilometer dan waktu terbang (<em>time of flight</em>) yang lama, rotasi Bumi memutar kerangka acuan partikel di udara. Benda yang bergerak lurus di ruang hampa akan tampak melengkung bagi pengamat di permukaan Bumi.
              </p>
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl font-serif text-lg text-center shadow-inner text-indigo-300 inline-block w-full">
                F<sub>coriolis</sub> = -2m (&Omega; &times; v)
              </div>
              <ul className="text-sm space-y-2 text-neutral-400 list-none pl-2 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                <li><strong className="text-indigo-300 inline-block w-16">F<sub>coriolis</sub></strong> : Vektor Gaya fiktif Coriolis (Newton)</li>
                <li><strong className="text-indigo-300 inline-block w-16">m</strong> : Massa partikel atau bom vulkanik (kg)</li>
                <li><strong className="text-indigo-300 inline-block w-16">&Omega;</strong> : Vektor kecepatan sudut rotasi Bumi (7.2921 &times; 10<sup>-5</sup> rad/s)</li>
                <li><strong className="text-indigo-300 inline-block w-16">v</strong> : Vektor kecepatan 3D partikel terhadap permukaan Bumi (m/s)</li>
                <li><strong className="text-indigo-300 inline-block w-16">&times;</strong> : Simbol operasi <em>Cross Product</em> (Perkalian Silang Vektor)</li>
              </ul>
              <p>
                Secara geografis, akselerasi lateral disederhanakan dengan Parameter Coriolis (<code className="bg-neutral-800 text-indigo-300 px-1 rounded text-sm font-serif">f = 2&Omega; sin(&phi;)</code>), di mana <strong>&phi;</strong> adalah derajat garis Lintang (Latitude). Letusan di Gunung Semeru (Lintang Selatan) membelokkan material melayang ke <strong>kiri</strong> dari arah gerak, sedangkan material letusan Raikoke di Rusia (Lintang Utara) dibelokkan ke <strong>kanan</strong>.
              </p>
            </div>
            <div className="md:col-span-5 bg-indigo-950/20 border border-indigo-900/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center h-full">
              <Compass className="w-12 h-12 text-indigo-400 mb-4" />
              <h4 className="text-white font-medium mb-2">Simpangan Geografis</h4>
              <p className="text-sm text-indigo-200/70">
                Simulasi secara dinamis menghitung matriks rotasi kecepatan berdasarkan Lintang lokasi letusan pada saat kalkulasi lintasan proyektil (<em>heading deflection</em>).
              </p>
            </div>
          </div>
          {/* Referensi Bab 3 */}
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <h4 className="text-sm text-neutral-500 font-semibold mb-3 uppercase tracking-wider">Referensi Jurnal / Literatur</h4>
            <a href="https://doi.org/10.1016/j.cageo.2013.10.016" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-900/10 hover:bg-indigo-900/20 px-4 py-2.5 rounded-lg border border-indigo-900/30 w-full sm:w-auto">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Tsunematsu et al. (2014). A numerical model of ballistic transport with collisions in a volcanic setting (Computers & Geosciences)</span>
              <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
            </a>
          </div>
        </section>
      )
    },
    {
      id: 4,
      content: (
        <section>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 text-lg border border-emerald-500/30">4</span>
            Integrator Numerik: Runge-Kutta Orde 4 (RK4)
          </h2>
          <div className="text-neutral-300 leading-relaxed space-y-6">
            <p>
              Akselerasi partikel bergantung pada kecepatan (gaya hambat kuadratik) dan posisi (kerapatan udara yang berubah). Ini membentuk persamaan diferensial tingkat dua yang tidak memiliki solusi analitik pasti. Kami memecahkannya menggunakan iterasi waktu numerik <strong>Runge-Kutta 4th Order (RK4)</strong> yang jauh lebih stabil dari metode Euler.
            </p>
            <p>
              Pada setiap <em>time-step</em> (<code className="bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded text-sm">Δt</code>), algoritma mengevaluasi turunan sistem pada 4 titik berbeda:
            </p>
            
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl font-serif text-lg shadow-inner text-emerald-200 space-y-3 overflow-x-auto">
              <div><span className="text-emerald-500 font-bold">k<sub>1</sub></span> = f(t<sub>n</sub>, y<sub>n</sub>) <span className="text-neutral-500 ml-4 font-sans text-sm">— Evaluasi percepatan di awal interval</span></div>
              <div><span className="text-emerald-500 font-bold">k<sub>2</sub></span> = f(t<sub>n</sub> + &frac12;&Delta;t, y<sub>n</sub> + &frac12;&Delta;t &middot; <span className="text-emerald-500">k<sub>1</sub></span>) <span className="text-neutral-500 ml-4 font-sans text-sm">— Estimasi titik tengah pertama</span></div>
              <div><span className="text-emerald-500 font-bold">k<sub>3</sub></span> = f(t<sub>n</sub> + &frac12;&Delta;t, y<sub>n</sub> + &frac12;&Delta;t &middot; <span className="text-emerald-500">k<sub>2</sub></span>) <span className="text-neutral-500 ml-4 font-sans text-sm">— Estimasi titik tengah kedua</span></div>
              <div><span className="text-emerald-500 font-bold">k<sub>4</sub></span> = f(t<sub>n</sub> + &Delta;t, y<sub>n</sub> + &Delta;t &middot; <span className="text-emerald-500">k<sub>3</sub></span>) <span className="text-neutral-500 ml-4 font-sans text-sm">— Estimasi akhir interval</span></div>
              <div className="pt-3 mt-3 border-t border-neutral-800 text-white font-bold">
                y<sub>n+1</sub> = y<sub>n</sub> + <sup>&Delta;t</sup>&frasl;<sub>6</sub> ( <span className="text-emerald-500">k<sub>1</sub> + 2k<sub>2</sub> + 2k<sub>3</sub> + k<sub>4</sub></span> )
              </div>
            </div>
            
            <ul className="text-sm space-y-2 text-neutral-400 list-none pl-2 mt-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
              <li><strong className="text-emerald-300 inline-block w-12">y<sub>n</sub></strong> : Vektor status proyektil saat ini, berisi informasi Posisi (x, y, z) dan Kecepatan (v<sub>x</sub>, v<sub>y</sub>, v<sub>z</sub>)</li>
              <li><strong className="text-emerald-300 inline-block w-12">y<sub>n+1</sub></strong> : Vektor status proyektil di masa depan setelah 1 langkah waktu terlewati</li>
              <li><strong className="text-emerald-300 inline-block w-12">t<sub>n</sub></strong> : Waktu saat simulasi berada di status y<sub>n</sub> (detik)</li>
              <li><strong className="text-emerald-300 inline-block w-12">&Delta;t</strong> : Besaran langkah waktu (<em>time step</em>) tiap iterasi kalkulasi (detik)</li>
              <li><strong className="text-emerald-300 inline-block w-12">f(...)</strong> : Fungsi diferensial kalkulator gravitasi & hambat udara untuk menghitung Percepatan</li>
              <li><strong className="text-emerald-300 inline-block w-12">k<sub>1..4</sub></strong> : Slope (kemiringan) turunan yang dihitung untuk melakukan interpolasi trajektori presisi tinggi</li>
            </ul>
            
            <div className="flex items-start gap-4 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-100/70">
                <strong>Stabilitas Tingkat Tinggi:</strong> Dengan mengambil rata-rata terbobot dari empat evaluasi <em>slope</em> ini, galat (<em>error</em>) per langkah iterasi ditekan hingga orde <code className="text-emerald-300">O(Δt⁵)</code>, menghasilkan kurva trajektori yang sangat halus tanpa anomali akumulasi gaya, bahkan pada durasi penerbangan (<em>time-of-flight</em>) melampaui 10 menit dengan time-step adaptif.
              </p>
            </div>
          </div>
          {/* Referensi Bab 4 */}
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <h4 className="text-sm text-neutral-500 font-semibold mb-3 uppercase tracking-wider">Referensi Jurnal / Literatur</h4>
            <a href="https://ui.adsabs.harvard.edu/abs/1992nrfa.book.....P" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-900/10 hover:bg-emerald-900/20 px-4 py-2.5 rounded-lg border border-emerald-900/30 w-full sm:w-auto">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Press et al. (1992). Numerical Recipes in C: The Art of Scientific Computing (Cambridge Univ. Press)</span>
              <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
            </a>
          </div>
        </section>
      )
    },
    {
      id: 5,
      content: (
        <section>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 text-lg border border-purple-500/30">5</span>
            Injeksi Aerosol & Dampak Iklim Global
          </h2>
          <div className="text-neutral-300 leading-relaxed space-y-6">
            <p>
              Bagian kedua dari simulasi ini (Tampilan Mode Aerosol) tidak memodelkan proyektil balistik yang jatuh dalam hitungan menit, melainkan <strong>debu vulkanik (ash) dan gas Sulfur Dioksida (SO₂)</strong> yang memiliki massa jenis sangat rendah dan dapat mengudara berbulan-bulan.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3 text-lg">
                  <Globe className="w-5 h-5 text-purple-400" /> Jet Stream Stratosferik
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Letusan eksplosif (VEI 4 - VEI 6) menembus Troposfer dan menyuntikkan materialnya langsung ke Stratosfer. Di lapisan ini, fenomena cuaca (hujan/badai) sangat minim, namun terdapat <strong>Jet Stream</strong> angin timuran atau baratan dengan kecepatan ekstrem (100 - 300 km/jam). Model mensimulasikan partikel ini mengelilingi Bumi mengikuti garis Lintang.
                </p>
                <div className="bg-black/50 rounded p-4 font-serif text-base text-purple-300 flex flex-col items-center">
                  <div>R = &radic;(4 &middot; D &middot; t)</div>
                </div>
                <ul className="text-xs space-y-2 text-neutral-400 list-none mt-4">
                  <li><strong className="text-purple-300 inline-block w-4">R</strong> : Radius/Jari-jari persebaran awan abu secara horizontal (m)</li>
                  <li><strong className="text-purple-300 inline-block w-4">D</strong> : Koefisien Difusi Eddy (m&sup2;/s), menggambarkan kekuatan turbulensi lateral di Stratosfer</li>
                  <li><strong className="text-purple-300 inline-block w-4">t</strong> : Waktu (durasi) sejak partikel aerosol tersebut disuntikkan ke angkasa (detik)</li>
                </ul>
              </div>
              
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3 text-lg">
                  <ThermometerSnowflake className="w-5 h-5 text-blue-400" /> Volcanic Winter (Albedo)
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Di Stratosfer, gas SO₂ bereaksi dengan uap air membentuk awan aerosol Asam Sulfat (H₂SO₄). Lapisan aerosol ini meningkatkan <strong>Albedo</strong> (daya pantul) planet Bumi, memantulkan radiasi Matahari kembali ke angkasa. 
                </p>
                <p className="text-sm text-neutral-400">
                  Model kami mengestimasi penurunan temperatur rata-rata global berdasarkan logaritmik total massa ejekta letusan. Letusan Krakatau (1883) dan Tambora (1815) terbukti menurunkan suhu bumi secara signifikan dan mengacaukan musim panen di seluruh dunia.
                </p>
              </div>
            </div>
          </div>
          {/* Referensi Bab 5 */}
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <h4 className="text-sm text-neutral-500 font-semibold mb-3 uppercase tracking-wider">Referensi Jurnal / Literatur</h4>
            <a href="https://doi.org/10.1029/1998RG000054" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors bg-purple-900/10 hover:bg-purple-900/20 px-4 py-2.5 rounded-lg border border-purple-900/30 w-full sm:w-auto">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Robock, A. (2000). Volcanic eruptions and climate (Reviews of Geophysics)</span>
              <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
            </a>
          </div>
        </section>
      )
    }
  ];

  const handleNext = () => setActiveChapter(p => Math.min(p + 1, chapters.length - 1));
  const handlePrev = () => setActiveChapter(p => Math.max(p - 1, 0));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-black text-neutral-300 font-sans p-6 md:p-12 overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-6rem)]">
        
        {/* TOP NAV */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors px-4 py-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 border border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </button>
          
          <div className="text-neutral-500 text-sm font-medium bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800">
            Bab {activeChapter + 1} dari {chapters.length}
          </div>
        </div>

        {/* HEADER */}
        <header className="mb-10 border-b border-neutral-800 pb-8 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
            <BookOpen className="w-4 h-4" />
            Modul Referensi Saintifik
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500 mb-6 tracking-tight leading-tight">
            Dasar Teori & Pemodelan Komputasional Trajektori Vulkanik
          </h1>
          {activeChapter === 0 && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="text-lg text-neutral-400 leading-relaxed max-w-4xl"
            >
              Aplikasi Simulasi Trajektori Letusan Krakatau (dan gunung berapi historis lainnya) tidak menggunakan animasi acak. Aplikasi ini dibangun di atas <strong>Physics Engine 2.5D</strong> yang memecahkan sistem persamaan diferensial non-linear secara <em>real-time</em>. Modul ini mendokumentasikan secara komprehensif formulasi matematika, model atmosfer, dan algoritma integrasi numerik yang menggerakkan simulasi.
            </motion.p>
          )}
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="pb-10"
            >
              {chapters[activeChapter].content}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* PAGINATION CONTROLS */}
        <div className="mt-auto pt-8 border-t border-neutral-800 shrink-0">
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePrev}
              disabled={activeChapter === 0}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-900 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-800 transition-all font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Sebelumnya
            </button>
            
            <div className="hidden md:flex items-center gap-3">
              {chapters.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveChapter(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeChapter 
                      ? 'bg-blue-500 w-8' 
                      : 'bg-neutral-700 w-2 hover:bg-neutral-500'
                  }`}
                  aria-label={`Go to chapter ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={activeChapter === chapters.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 rounded-xl text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 disabled:bg-neutral-900 disabled:text-neutral-500 disabled:border-neutral-800 disabled:cursor-not-allowed border border-blue-500/30 transition-all font-medium"
            >
              {activeChapter === chapters.length - 1 ? 'Selesai' : 'Selanjutnya'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
