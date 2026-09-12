const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

code = code.replace(
  /if \(name === 'ground_km'\) return \[`\$\{value\} km`, 'Elevasi Tanah Asli'\];/g,
  'if (name === \'ground_area\') return [Array.isArray(value) ? `${value[1]} km` : `${value} km`, \'Elevasi Tanah Asli\'];'
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
