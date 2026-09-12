const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Inside if (mode === 'ballistic')
code = code.replace(
  /ground_km: Number\(\(\(p\.groundElev \|\| 0\) \/ 1000\)\.toFixed\(2\)\),/g,
  'ground_km: Number(((p.groundElev || 0) / 1000).toFixed(2)),\n        ground_area: [-maxY * 0.1, Number(((p.groundElev || 0) / 1000).toFixed(2))],'
);

// We need to make sure maxY is defined before data is generated.
// maxY is currently defined after `const maxPoints = ...`
// Let's check the order in components/ChartAnalysis.tsx
