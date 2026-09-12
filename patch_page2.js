const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(
  /import \{ useSimulation \} from '@\/hooks\/useSimulation';/,
  `import { useSimulation } from '@/hooks/useSimulation';\nimport { generateSimulationReport } from '@/utils/exportPdf';`
);

fs.writeFileSync('app/page.tsx', code);
console.log("Patched page.tsx imports");
