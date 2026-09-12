const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Ensure that ground_area uses the same variable and looks good
code = code.replace(
  /ground_area: \[-maxY \* 0\.1, Number\(\(\(p\.groundElev \|\| 0\) \/ 1000\)\.toFixed\(2\)\)\],/g,
  'ground_area: [-Math.max(maxY * 0.1, 0.5), Number(((p.groundElev || 0) / 1000).toFixed(2))],'
);
// And change YAxis domain similarly
code = code.replace(
  /<YAxis width=\{65\} type="number" domain=\{\[-maxY \* 0\.1, maxY \* 1\.1\]\} stroke="transparent"/g,
  '<YAxis width={65} type="number" domain={[-Math.max(maxY * 0.1, 0.5), maxY * 1.1]} stroke="transparent"'
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
