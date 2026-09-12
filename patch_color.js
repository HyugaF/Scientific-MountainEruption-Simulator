const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');
code = code.replace(
  /<Area isAnimationActive=\{false\} type="step" dataKey="ground_area" stroke="#4ade80" fill="#4ade80" fillOpacity=\{0\.15\} strokeWidth=\{1\} \/>/g,
  '<Area isAnimationActive={false} type="step" dataKey="ground_area" stroke="#059669" fill="#059669" fillOpacity={0.1} strokeWidth={1} />'
);
fs.writeFileSync('components/ChartAnalysis.tsx', code);
