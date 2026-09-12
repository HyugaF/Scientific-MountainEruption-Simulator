const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /<PreviewSlider label="Massa Custom" value=\{params\.mass\} min=\{0\} max=\{10000\} step=\{1\} onChange=\{\(v\) => handlePhysicsChange\('mass', v\)\} paramKey="mass" formatValue=\{\(v\) => v >= 1 \? \`\$\{v\} kg\` : \`\$\{\(v \* 1000\)\.toFixed\(2\)\} g\`\} \/>handlePhysicsChange\('mass', Number\(e\.target\.value\)\)\} className="w-full accent-orange-500 cursor-pointer" \/>/,
  `<PreviewSlider label="Massa Custom" value={params.mass} min={0} max={10000} step={1} onChange={(v) => handlePhysicsChange('mass', v)} paramKey="mass" formatValue={(v) => v >= 1 ? \`\${v} kg\` : \`\${(v * 1000).toFixed(2)} g\`} />`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Fixed syntax");
