const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /import \{ (.*) \} from 'lucide-react';/,
  `import { $1, Download } from 'lucide-react';`
);

code = code.replace(
  /<button\s+onClick=\{togglePlay\}\s+className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors flex-shrink-0"\s*>/,
  `{onExport && (
              <button 
                onClick={onExport}
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors flex-shrink-0"
                title="Unduh Laporan PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched InputPanel.tsx");
