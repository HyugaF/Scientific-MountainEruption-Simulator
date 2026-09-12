const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

// Remove onExport from Props
code = code.replace(
  /tutorialStep\?: number;\n  onExport\?: \(\) => void;\n\}/,
  `tutorialStep?: number;\n}`
);

code = code.replace(
  /tutorialStep = 0,\n  onExport\n\}: Props\)/,
  `tutorialStep = 0\n}: Props)`
);

// Remove the JSX button inside InputPanel
const btnString = `{onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-lg"
              title="Unduh Laporan PDF"
            >
              <Download className="w-5 h-5 text-neutral-300" />
            </button>
          )}`;

code = code.replace(btnString, '');
fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched InputPanel.tsx");
