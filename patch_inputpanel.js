const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /tutorialStep\?: number;\n}/,
  `tutorialStep?: number;\n  onExport?: () => void;\n}`
);

code = code.replace(
  /tutorialStep = 0\n}: Props\)/,
  `tutorialStep = 0,\n  onExport\n}: Props)`
);

code = code.replace(
  /<button\n\s*onClick=\{togglePlay\}\n\s*className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg p-2 transition-colors"\n\s*>/,
  `{onExport && (
              <button 
                onClick={onExport}
                className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white rounded-lg p-2 transition-colors mr-1"
                title="Unduh Laporan PDF"
              >
                <Download className="w-5 h-5 text-neutral-300" />
              </button>
            )}
            <button
              onClick={togglePlay}
              className="bg-orange-600 hover:bg-orange-500 text-white rounded-lg p-2 transition-colors"
            >`
);

code = code.replace(
  /import \{ Play, Pause, Info, Wind, Mountain, Settings2, Globe2 \} from 'lucide-react';/,
  `import { Play, Pause, Info, Wind, Mountain, Settings2, Globe2, Download } from 'lucide-react';`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched InputPanel.tsx");
