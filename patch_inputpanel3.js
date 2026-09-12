const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /<div className="flex gap-2">\s*<button\s*onClick=\{togglePlay\}/,
  `<div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-lg"
              title="Unduh Laporan PDF"
            >
              <Download className="w-5 h-5 text-neutral-300" />
            </button>
          )}
          <button
            onClick={togglePlay}`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched InputPanel.tsx");
