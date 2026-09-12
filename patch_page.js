const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Remove from InputPanel
code = code.replace(
  'tutorialStep={tutorialStep}\n          onExport={() => generateSimulationReport(mode, params, aerosolParams, ballisticResult, aerosolResult, academicMetrics)}\n        />',
  'tutorialStep={tutorialStep}\n        />'
);

// Add to ChartAnalysis
code = code.replace(
  'progressIndex={progressIndex}\n            />',
  'progressIndex={progressIndex}\n              onExport={() => generateSimulationReport(mode, params, aerosolParams, ballisticResult, aerosolResult, academicMetrics)}\n            />'
);

fs.writeFileSync('app/page.tsx', code);
console.log("Patched page.tsx");
