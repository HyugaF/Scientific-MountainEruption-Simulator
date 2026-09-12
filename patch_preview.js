const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

const previewSliderCode = `
const PreviewSlider = ({
  label, value, min, max, step, onChange, unit, paramKey, color = 'orange', formatValue
}: {
  label: React.ReactNode; value: number; min: number; max: number; step: number;
  onChange: (val: number) => void; unit?: string; paramKey: string; color?: 'orange' | 'blue' | 'purple';
  formatValue?: (val: number) => string;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const renderPreview = () => {
    switch (paramKey) {
      case 'elevation':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-24 bg-neutral-950 rounded-t-lg">
            <rect x="0" y="80" width="100" height="20" fill="#1e3a8a" opacity="0.3" />
            <motion.polygon points={\`20,80 50,\${80 - (percent * 60)} 80,80\`} fill="#c2410c" />
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
            <motion.path d={\`M 10 90 Q 50 \${90 - (percent * 80)} 90 90\`} stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="4 4" />
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
              <motion.div key={i} className="absolute h-px bg-blue-400" style={{ top: \`\${i * 20 + 20}%\`, width: \`\${20 + Math.random() * 30}%\` }} animate={{ x: [-100, 300] }} transition={{ repeat: Infinity, duration: 2 - percent * 1.5 + Math.random(), ease: "linear" }} />
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
  const displayValue = formatValue ? formatValue(value) : \`\${value} \${unit || ''}\`.trim();

  return (
    <div className="space-y-2 relative w-full" onPointerLeave={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}>
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
              className="absolute bottom-full left-0 w-full mb-3 z-[100] rounded-lg shadow-2xl border border-neutral-700 bg-neutral-900 pointer-events-none drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
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
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className={\`w-full cursor-pointer relative z-10 \${accentClass}\`}
        />
      </div>
    </div>
  );
};
`;

if (!code.includes('const PreviewSlider')) {
    code = code.replace('export default function InputPanel', previewSliderCode + '\nexport default function InputPanel');
}

// 2. Replace Elevation Block
code = code.replace(
    /<div className="space-y-2 mt-4 pt-2 border-t border-neutral-800\/50">\s*<div className="flex justify-between text-xs">\s*<label>Ketinggian Kawah \(Elevasi\)<\/label>\s*<span className="text-orange-400">\{params\.elevation\} mdpl<\/span>\s*<\/div>\s*<input type="range" min="0" max="6000" step="10" value=\{params\.elevation\}[^>]*>\s*<\/div>/,
    `<div className="mt-4 pt-2 border-t border-neutral-800/50">
        <PreviewSlider label="Ketinggian Kawah (Elevasi)" value={params.elevation} min={0} max={6000} step={10} onChange={(v) => handlePhysicsChange('elevation', v)} unit="mdpl" paramKey="elevation" />
      </div>`
);

// 3. Replace v0 Block
code = code.replace(
    /<div className="space-y-2">\s*<div className="flex justify-between text-xs">\s*<label>Kecepatan Awal \(v₀\)<\/label>\s*<span className="text-orange-400">\{params\.v0\} m\/s<\/span>\s*<\/div>\s*<input type="range" min="10" max="2000" step="10" value=\{params\.v0\}[^>]*>\s*<\/div>/,
    `<PreviewSlider label="Kecepatan Awal (v₀)" value={params.v0} min={10} max={2000} step={10} onChange={(v) => handlePhysicsChange('v0', v)} unit="m/s" paramKey="v0" />`
);

// 4. Replace angle Block
code = code.replace(
    /<div className="space-y-2">\s*<div className="flex justify-between text-xs">\s*<label>Sudut Elevasi \(θ\)<\/label>\s*<span className="text-orange-400">\{params\.angle\}°<\/span>\s*<\/div>\s*<input type="range" min="1" max="89" step="1" value=\{params\.angle\}[^>]*>\s*<\/div>/,
    `<PreviewSlider label="Sudut Elevasi (θ)" value={params.angle} min={1} max={89} step={1} onChange={(v) => handlePhysicsChange('angle', v)} unit="°" paramKey="angle" />`
);

// 5. Replace mass custom input
code = code.replace(
    /<div className="flex justify-between text-xs">\s*<label>Massa Custom<\/label>[\s\S]*?<input type="range" min="0" max="10000" step="1" value=\{params\.mass\} [^>]*>\s*/,
    `<PreviewSlider label="Massa Custom" value={params.mass} min={0} max={10000} step={1} onChange={(v) => handlePhysicsChange('mass', v)} paramKey="mass" formatValue={(v) => v >= 1 ? \`\${v} kg\` : \`\${(v * 1000).toFixed(2)} g\`} />`
);

// 6. Replace windSpeed Block
code = code.replace(
    /<div className="space-y-2">\s*<div className="flex justify-between text-xs">\s*<label>Kecepatan Angin<\/label>\s*<span className="text-blue-400">\{params\.windSpeed\} m\/s<\/span>\s*<\/div>\s*<input type="range" min="0" max="150" step="1" value=\{params\.windSpeed\}[^>]*>\s*<\/div>/,
    `<PreviewSlider label="Kecepatan Angin" value={params.windSpeed} min={0} max={150} step={1} onChange={(v) => handlePhysicsChange('windSpeed', v)} unit="m/s" paramKey="windSpeed" color="blue" />`
);

// 7. Replace windDirection Block
code = code.replace(
    /<div className="space-y-2">\s*<div className="flex justify-between text-xs">\s*<label>Arah Angin \(Azimuth\)<\/label>\s*<span className="text-blue-400">\{params\.windDirection\}°<\/span>\s*<\/div>\s*<input type="range" min="0" max="360" step="1" value=\{params\.windDirection\}[^>]*>\s*<\/div>/,
    `<PreviewSlider label="Arah Angin (Azimuth)" value={params.windDirection} min={0} max={360} step={1} onChange={(v) => handlePhysicsChange('windDirection', v)} unit="°" paramKey="windDirection" color="blue" />`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched successfully!");
