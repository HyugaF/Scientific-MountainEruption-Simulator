const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

code = code.replace(
  /ground_km: Number\(\(\(p\.groundElev \|\| 0\) \/ 1000\)\.toFixed\(2\)\),/g,
  'ground_km: Number(((p.groundElev || 0) / 1000).toFixed(2)),\n        ground_area: [-maxY * 0.1, Number(((p.groundElev || 0) / 1000).toFixed(2))],'
);

// We should also change YAxis domain to [-maxY * 0.1, maxY * 1.1]
code = code.replace(
  /<YAxis width=\{65\} type="number" domain=\{\[0, maxY \* 1\.1\]\} stroke="transparent"/g,
  '<YAxis width={65} type="number" domain={[-maxY * 0.1, maxY * 1.1]} stroke="transparent"'
);

// And change Area dataKey
code = code.replace(
  /<Area isAnimationActive=\{false\} type="step" dataKey="ground_km" stroke="#4ade80" fill="#4ade80" fillOpacity=\{0\.15\} strokeWidth=\{1\} \/>/g,
  '<Area isAnimationActive={false} type="step" dataKey="ground_area" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} strokeWidth={1} />'
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
