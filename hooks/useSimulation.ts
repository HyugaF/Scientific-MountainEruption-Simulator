import { useState, useMemo, useEffect } from 'react';
import { calculateEruption, calculateAerosolSpread, calculateAcademicMetrics, PhysicsParams, AerosolParams } from '@/utils/physics';

export type SimulationMode = 'ballistic' | 'aerosol';

export const KRAKATOA_PRESET: PhysicsParams = {
  v0: 800, // Estimated ejection velocity in m/s
  angle: 45, // Optimum angle
  mass: 1000, // 1000 kg rock
  windSpeed: 10, // Surface wind speed
  windDirection: 45, // Surface wind direction
  windShearEnabled: true,
  stratosphericWindSpeed: 25,
  stratosphericWindDir: 75,
  airDragEnabled: true,
  dragCoefficient: 0.47,
  rockDensity: 2500,
  surfaceTemp: 28, // Tropical surface temp
  lapseRate: 6.5,
  lat: -6.102,
  lng: 105.423,
  elevation: 813, // meters
  projectileCount: 25,
};

export const AEROSOL_PRESET: AerosolParams = {
  days: 30, // 1 month of spread
  stratosphericWind: 33, // ~120 km/h Easterly jet stream
  lat: -6.102,
  lng: 105.423,
  diffusionRate: 180, // radius expansion km per day
};

export const HISTORICAL_PRESETS = [
  {
    name: 'Krakatau (1883)',
    description: 'Letusan maha dahsyat (VEI 6) yang menghancurkan sebagian besar pulau Krakatau, menciptakan tsunami besar dan kaldera bawah laut. Suara letusannya terdengar hingga 4.800 km.',
    params: { ...KRAKATOA_PRESET },
    aerosol: { ...AEROSOL_PRESET }
  },
  {
    name: 'Anak Krakatau (2026)',
    description: 'Skenario prediksi aktivitas vulkanik pasca-pertumbuhan kubah lava berulang, didasarkan pada dinamika letusan vulkanian-strombolian modern yang intens namun berskala lebih kecil.',
    params: { v0: 350, angle: 60, mass: 500, windSpeed: 5, windDirection: 110, windShearEnabled: true, stratosphericWindSpeed: 12, stratosphericWindDir: 90, airDragEnabled: true, dragCoefficient: 0.47, lat: -6.102, lng: 105.423, elevation: 157, projectileCount: 20 },
    aerosol: { days: 5, stratosphericWind: 15, lat: -6.102, lng: 105.423, diffusionRate: 60 }
  },
  {
    name: 'Tambora (1815)',
    description: 'Letusan terbesar dalam sejarah manusia (VEI 7). Menginjeksikan jutaan ton SO2 ke stratosfer dan menyebabkan "Tahun Tanpa Musim Panas" (Volcanic Winter) secara global pada 1816.',
    params: { v0: 1200, angle: 70, mass: 2000, windSpeed: 10, windDirection: 260, windShearEnabled: true, stratosphericWindSpeed: 30, stratosphericWindDir: 270, airDragEnabled: true, dragCoefficient: 0.47, lat: -8.247, lng: 117.994, elevation: 2850, projectileCount: 80 },
    aerosol: { days: 60, stratosphericWind: 35, lat: -8.247, lng: 117.994, diffusionRate: 250 }
  },
  {
    name: 'Vesuvius (79 AD)',
    description: 'Letusan Plinian klasik yang mengubur kota Pompeii dan Herculaneum di bawah abu dan awan panas piroklastik. Dicatat langsung oleh Plinius yang Muda.',
    params: { v0: 600, angle: 85, mass: 1500, windSpeed: 5, windDirection: 135, windShearEnabled: true, stratosphericWindSpeed: 15, stratosphericWindDir: 120, airDragEnabled: true, dragCoefficient: 0.47, lat: 40.822, lng: 14.426, elevation: 1281, projectileCount: 50 },
    aerosol: { days: 15, stratosphericWind: 25, lat: 40.822, lng: 14.426, diffusionRate: 120 }
  },
  {
    name: 'St. Helens (1980)',
    description: 'Terkenal karena letusan lateral (menyamping) akibat longsoran lereng. Letusan ini menghancurkan hutan di sekitarnya dalam sekejap dan mengubah morfologi gunung secara drastis.',
    params: { v0: 900, angle: 25, mass: 2500, windSpeed: 10, windDirection: 90, windShearEnabled: true, stratosphericWindSpeed: 20, stratosphericWindDir: 85, airDragEnabled: true, dragCoefficient: 0.47, lat: 46.191, lng: -122.195, elevation: 2549, projectileCount: 40 },
    aerosol: { days: 20, stratosphericWind: 28, lat: 46.191, lng: -122.195, diffusionRate: 150 }
  },
  {
    name: 'Pinatubo (1991)',
    description: 'Letusan terbesar kedua di abad ke-20 (VEI 6). Abu vulkaniknya menyebar luas dan menurunkan suhu global hingga 0.5°C selama dua tahun akibat selubung aerosol stratosferik.',
    params: { v0: 1000, angle: 80, mass: 3000, windSpeed: 8, windDirection: 45, windShearEnabled: true, stratosphericWindSpeed: 25, stratosphericWindDir: 50, airDragEnabled: true, dragCoefficient: 0.47, lat: 15.143, lng: 120.350, elevation: 1486, projectileCount: 60 },
    aerosol: { days: 45, stratosphericWind: 30, lat: 15.143, lng: 120.350, diffusionRate: 200 }
  },
  {
    name: 'Merapi (2010)',
    description: 'Letusan efusif ke eksplosif dengan awan panas (wedhus gembel) yang menyapu desa-desa lereng selatan. Merupakan letusan terbesar Gunung Merapi dalam lebih dari 100 tahun terakhir.',
    params: { v0: 400, angle: 30, mass: 500, windSpeed: 5, windDirection: 210, windShearEnabled: true, stratosphericWindSpeed: 15, stratosphericWindDir: 180, airDragEnabled: true, dragCoefficient: 0.47, lat: -7.540, lng: 110.446, elevation: 2930, projectileCount: 30 },
    aerosol: { days: 7, stratosphericWind: 15, lat: -7.540, lng: 110.446, diffusionRate: 80 }
  },
  {
    name: 'Kelud (2014)',
    description: 'Letusan plinian singkat namun sangat masif yang menyemburkan abu vulkanik hingga ketinggian 17 km, menyelimuti hampir seluruh pulau Jawa bagian timur dan tengah.',
    params: { v0: 600, angle: 75, mass: 1000, windSpeed: 10, windDirection: 250, windShearEnabled: true, stratosphericWindSpeed: 22, stratosphericWindDir: 240, airDragEnabled: true, dragCoefficient: 0.47, lat: -7.933, lng: 112.308, elevation: 1731, projectileCount: 40 },
    aerosol: { days: 10, stratosphericWind: 22, lat: -7.933, lng: 112.308, diffusionRate: 100 }
  },
  {
    name: 'Agung (1963)',
    description: 'Salah satu letusan terdahsyat di Indonesia abad ke-20 (VEI 5). Menghasilkan kolom abu setinggi 26 km dan menginjeksikan aerosol sulfat yang menurunkan suhu bumi hingga 0.4°C.',
    params: { v0: 800, angle: 85, mass: 2000, windSpeed: 12, windDirection: 110, windShearEnabled: true, stratosphericWindSpeed: 24, stratosphericWindDir: 100, airDragEnabled: true, dragCoefficient: 0.47, lat: -8.343, lng: 115.508, elevation: 3031, projectileCount: 50 },
    aerosol: { days: 30, stratosphericWind: 25, lat: -8.343, lng: 115.508, diffusionRate: 160 }
  },
  {
    name: 'Eyjafjallajökull (2010)',
    description: 'Interaksi magma dengan es glasial (letusan freatomagmatik) menciptakan abu vulkanik yang sangat halus, melumpuhkan lalu lintas penerbangan udara seluruh Eropa (VEI 4).',
    params: { v0: 500, angle: 75, mass: 800, windSpeed: 25, windDirection: 135, windShearEnabled: true, stratosphericWindSpeed: 40, stratosphericWindDir: 120, airDragEnabled: true, dragCoefficient: 0.7, lat: 63.633, lng: -19.633, elevation: 1651, projectileCount: 40 },
    aerosol: { days: 14, stratosphericWind: 45, lat: 63.633, lng: -19.633, diffusionRate: 130 }
  },
  {
    name: 'Novarupta (1912)',
    description: 'Letusan vulkanik terbesar di abad ke-20 (VEI 6) di Semenanjung Alaska. Memuntahkan magma 30 kali lebih banyak dari letusan Mt. St. Helens dan menciptakan "Valley of Ten Thousand Smokes".',
    params: { v0: 1100, angle: 80, mass: 3500, windSpeed: 15, windDirection: 60, windShearEnabled: true, stratosphericWindSpeed: 28, stratosphericWindDir: 45, airDragEnabled: true, dragCoefficient: 0.47, lat: 58.270, lng: -155.157, elevation: 841, projectileCount: 70 },
    aerosol: { days: 40, stratosphericWind: 30, lat: 58.270, lng: -155.157, diffusionRate: 210 }
  },
  {
    name: 'Supervulkan Toba (74,000 SM)',
    description: 'Letusan supervolcano terkuat dalam 25 juta tahun terakhir (VEI 8). Menyebabkan musim dingin vulkanik ekstrem sedekade penuh dan diduga memicu penyusutan dramatis (bottleneck) populasi manusia purba.',
    params: { v0: 2500, angle: 88, mass: 100000, windSpeed: 10, windDirection: 90, windShearEnabled: true, stratosphericWindSpeed: 60, stratosphericWindDir: 270, airDragEnabled: true, dragCoefficient: 0.4, lat: 2.583, lng: 98.833, elevation: 905, projectileCount: 150 },
    aerosol: { days: 90, stratosphericWind: 80, lat: 2.583, lng: 98.833, diffusionRate: 500 }
  },
  {
    name: 'Galunggung (1982)',
    description: 'Letusan eksplosif (VEI 4) yang terkenal secara internasional karena insiden British Airways Flight 9, di mana abu vulkanik melumpuhkan keempat mesin pesawat yang sedang melintas.',
    params: { v0: 500, angle: 80, mass: 1000, windSpeed: 10, windDirection: 180, windShearEnabled: true, stratosphericWindSpeed: 20, stratosphericWindDir: 160, airDragEnabled: true, dragCoefficient: 0.47, lat: -7.25, lng: 108.05, elevation: 2168, projectileCount: 40 },
    aerosol: { days: 15, stratosphericWind: 20, lat: -7.25, lng: 108.05, diffusionRate: 110 }
  },
  {
    name: 'Ruang (2024)',
    description: 'Erupsi eksplosif masif di Sulawesi Utara (VEI 4) yang melontarkan bom pijar dan memicu peringatan tsunami, serta penutupan berbagai bandara internasional secara luas akibat hujan abu.',
    params: { v0: 450, angle: 70, mass: 800, windSpeed: 8, windDirection: 270, windShearEnabled: true, stratosphericWindSpeed: 18, stratosphericWindDir: 260, airDragEnabled: true, dragCoefficient: 0.47, lat: 2.30, lng: 125.37, elevation: 725, projectileCount: 35 },
    aerosol: { days: 10, stratosphericWind: 18, lat: 2.30, lng: 125.37, diffusionRate: 90 }
  },
  {
    name: 'Fuji (1707 - Hoei)',
    description: 'Letusan Hoei (VEI 5) merupakan salah satu yang terbesar dari Gunung Fuji. Hujan abu vulkaniknya terbang terbawa angin barat dan menyelimuti kota Edo (Tokyo modern) hingga beberapa sentimeter.',
    params: { v0: 700, angle: 80, mass: 1500, windSpeed: 15, windDirection: 225, windShearEnabled: true, stratosphericWindSpeed: 30, stratosphericWindDir: 270, airDragEnabled: true, dragCoefficient: 0.47, lat: 35.360, lng: 138.727, elevation: 3776, projectileCount: 50 },
    aerosol: { days: 25, stratosphericWind: 30, lat: 35.360, lng: 138.727, diffusionRate: 140 }
  },
  {
    name: 'Hunga Tonga (2022)',
    description: 'Letusan freatomagmatik bawah laut raksasa (VEI ~6). Memicu gelombang kejut atmosferik keliling bumi dan menginjeksikan uap air dalam jumlah belum pernah terjadi sebelumnya ke mesosfer.',
    params: { v0: 1500, angle: 85, mass: 5000, windSpeed: 15, windDirection: 90, windShearEnabled: true, stratosphericWindSpeed: 45, stratosphericWindDir: 100, airDragEnabled: true, dragCoefficient: 0.47, lat: -20.536, lng: -175.382, elevation: 114, projectileCount: 70 },
    aerosol: { days: 60, stratosphericWind: 50, lat: -20.536, lng: -175.382, diffusionRate: 300 }
  },
  {
    name: 'Mauna Loa (1984)',
    description: 'Gunung berapi perisai terbesar di bumi. Letusan efusif menghasilkan aliran lava basaltik yang sangat panjang, minim ledakan abu vulkanik, namun gas vulkaniknya menyebar luas.',
    params: { v0: 200, angle: 45, mass: 2000, windSpeed: 8, windDirection: 90, windShearEnabled: true, stratosphericWindSpeed: 10, stratosphericWindDir: 90, airDragEnabled: true, dragCoefficient: 0.5, lat: 19.475, lng: -155.608, elevation: 4169, projectileCount: 20 },
    aerosol: { days: 10, stratosphericWind: 10, lat: 19.475, lng: -155.608, diffusionRate: 50 }
  },
  {
    name: 'Chaitén (2008)',
    description: 'Letusan riolitik pertama di dunia sejak seabad lalu (VEI 4). Menghasilkan tiang abu setinggi 30 km dan fenomena badai petir vulkanik yang luar biasa spektakuler.',
    params: { v0: 650, angle: 85, mass: 1200, windSpeed: 12, windDirection: 270, windShearEnabled: true, stratosphericWindSpeed: 25, stratosphericWindDir: 260, airDragEnabled: true, dragCoefficient: 0.47, lat: -42.833, lng: -72.646, elevation: 1122, projectileCount: 45 },
    aerosol: { days: 20, stratosphericWind: 25, lat: -42.833, lng: -72.646, diffusionRate: 150 }
  },
  {
    name: 'Raikoke (2019)',
    description: 'Letusan dahsyat (VEI 4) dari sebuah pulau tak berpenghuni di Rusia yang menyemburkan gas vulkanik dan aerosol melintasi Samudra Pasifik utara, yang terekam sangat jelas dari luar angkasa.',
    params: { v0: 550, angle: 75, mass: 900, windSpeed: 15, windDirection: 315, windShearEnabled: true, stratosphericWindSpeed: 35, stratosphericWindDir: 300, airDragEnabled: true, dragCoefficient: 0.47, lat: 48.292, lng: 153.25, elevation: 551, projectileCount: 35 },
    aerosol: { days: 15, stratosphericWind: 35, lat: 48.292, lng: 153.25, diffusionRate: 180 }
  },
  {
    name: 'Semeru (2021)',
    description: 'Letusan tragis akibat guguran kubah lava yang memicu serangkaian awan panas guguran masif (pyroclastic flows). Menyapu jembatan Gladak Perak dan beberapa desa di Besuk Kobokan.',
    params: { v0: 350, angle: 40, mass: 600, windSpeed: 5, windDirection: 135, windShearEnabled: true, stratosphericWindSpeed: 15, stratosphericWindDir: 120, airDragEnabled: true, dragCoefficient: 0.47, lat: -8.108, lng: 112.92, elevation: 3676, projectileCount: 25 },
    aerosol: { days: 5, stratosphericWind: 15, lat: -8.108, lng: 112.92, diffusionRate: 70 }
  },
  {
    name: 'Sinabung (2014)',
    description: 'Letusan berkelanjutan setelah lebih dari 400 tahun tertidur (VEI 4). Semburan debu vulkanik dan awan panas menutupi kawasan pertanian Karo, mengubah morfologi puncak gunung selamanya.',
    params: { v0: 500, angle: 70, mass: 1000, windSpeed: 8, windDirection: 210, windShearEnabled: true, stratosphericWindSpeed: 20, stratosphericWindDir: 180, airDragEnabled: true, dragCoefficient: 0.47, lat: 3.17, lng: 98.392, elevation: 2460, projectileCount: 30 },
    aerosol: { days: 12, stratosphericWind: 20, lat: 3.17, lng: 98.392, diffusionRate: 100 }
  },
];

export function useSimulation() {
  const [mode, setMode] = useState<SimulationMode>('ballistic');
  const [params, setParams] = useState<PhysicsParams>(KRAKATOA_PRESET);
  const [aerosolParams, setAerosolParams] = useState<AerosolParams>(AEROSOL_PRESET);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const [ballisticResult, setBallisticResult] = useState(() => calculateEruption(params));
  const [isFetchingTopo, setIsFetchingTopo] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Debounce to prevent API spam while sliding parameters
    const timer = setTimeout(async () => {
      setIsFetchingTopo(true);
      try {
        // 1. Dry run (Flat Earth) to get coordinates
        const dryRun = calculateEruption(params);
        const trajectory = dryRun.primary.trajectory;

        // 2. Sample points to fetch
        const sampleSize = 80;
        const step = Math.max(1, Math.floor(trajectory.length / sampleSize));
        const sampled = [];
        for (let i = 0; i < trajectory.length; i += step) {
          sampled.push(trajectory[i]);
          if (sampled.length >= sampleSize) break;
        }
        if (sampled[sampled.length - 1] !== trajectory[trajectory.length - 1]) {
          sampled.push(trajectory[trajectory.length - 1]);
        }

        const lats = sampled.map(p => p.lat.toFixed(5)).join(',');
        const lngs = sampled.map(p => p.lng.toFixed(5)).join(',');

        if (!lats || !lngs) {
          if (isMounted) setBallisticResult(dryRun);
          return;
        }

        // 3. Fetch from Open-Meteo
        const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`);
        
        if (!res.ok) {
          if (isMounted) setBallisticResult(dryRun);
          return;
        }
        
        const data = await res.json();

        if (!isMounted) return;

        if (data.elevation && data.elevation.length > 0) {
          const topography = sampled.map((p, i) => ({
            dist: p.x,
            elev: Math.max(0, data.elevation[i] || 0)
          }));
          
          // 4. Real run with topography
          const realRun = calculateEruption(params, topography);
          setBallisticResult(realRun);
        } else {
          setBallisticResult(dryRun);
        }
      } catch (e) {
        // Silently fallback to flat earth model if topography API fails (e.g. rate limit, network error)
        if (isMounted) setBallisticResult(calculateEruption(params));
      } finally {
        if (isMounted) setIsFetchingTopo(false);
      }
    }, 600); // 600ms debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [params]);
  
  // Keep aerosol location in sync with volcano selection, safely memoized
  const aerosolResult = useMemo(() => {
    const syncAerosolParams = {
      ...aerosolParams,
      lat: params.lat,
      lng: params.lng,
    };
    return calculateAerosolSpread(syncAerosolParams);
  }, [aerosolParams, params.lat, params.lng]);
  
  const totalPoints = useMemo(() => {
    if (mode === 'ballistic') {
      let maxSpread = 0;
      if (ballisticResult.spread.length > 0) {
        maxSpread = Math.max(...ballisticResult.spread.map(t => t.trajectory.length));
      }
      return Math.max(ballisticResult.primary.trajectory.length, maxSpread);
    }
    return aerosolResult.trajectory.length;
  }, [mode, ballisticResult, aerosolResult]);

  const academicMetrics = useMemo(() => calculateAcademicMetrics(params, aerosolParams), [params, aerosolParams]);

  // When params or mode change, reset animation
  useEffect(() => {
    setTimeout(() => setProgressIndex(0), 0);
    setTimeout(() => setIsPlaying(false), 0);
  }, [totalPoints, mode]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    let frameId: number;
    let lastTime = performance.now();
    
    const BASE_ANIMATION_DURATION_MS = mode === 'ballistic' ? 3500 : 5000; 
    const ANIMATION_DURATION_MS = BASE_ANIMATION_DURATION_MS / playbackSpeed;
    const pointsPerMs = totalPoints / ANIMATION_DURATION_MS;

    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      setProgressIndex((prev) => {
        const next = prev + (pointsPerMs * dt);
        if (next >= totalPoints - 1) {
          setTimeout(() => setIsPlaying(false), 0);
          return totalPoints - 1;
        }
        return next;
      });
      
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, totalPoints, mode, playbackSpeed]);

  const togglePlay = () => {
    if (!isPlaying && progressIndex >= totalPoints - 1) {
      setTimeout(() => setProgressIndex(0), 0);
    }
    setIsPlaying(!isPlaying);
  };
  
  return { 
    mode,
    setMode,
    params, 
    setParams, 
    aerosolParams,
    setAerosolParams,
    ballisticResult,
    aerosolResult,
    academicMetrics,
    progressIndex: Math.floor(progressIndex),
    setProgressIndex,
    totalPoints,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
    isFetchingTopo,
  };
}
