const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Ensure that ground_area handles minimum visual properly so it doesn't look like it's floating
// If we set the lower bound to a larger negative, the ground will look thicker!
code = code.replace(
  /ground_area: \[-Math\.max\(maxY \* 0\.1, 0\.5\), Number\(\(\(p\.groundElev \|\| 0\) \/ 1000\)\.toFixed\(2\)\)\],/g,
  'ground_area: [-Math.max(maxY * 0.15, 1), Number(((p.groundElev || 0) / 1000).toFixed(2))],'
);

code = code.replace(
  /<YAxis width=\{65\} type="number" domain=\{\[-Math\.max\(maxY \* 0\.1, 0\.5\), maxY \* 1\.1\]\} stroke="transparent"/g,
  '<YAxis width={65} type="number" domain={[-Math.max(maxY * 0.15, 1), maxY * 1.1]} stroke="transparent"'
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
