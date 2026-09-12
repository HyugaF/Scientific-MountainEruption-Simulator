const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Soften button containers
code = code.replace(/<div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">/g, '<div className="flex bg-neutral-800/50 rounded-lg p-1">');
code = code.replace(/<button onClick=\{handleExportCSV\} className="flex items-center gap-1\.5 px-3 py-1\.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-medium transition-colors">/g, '<button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-xs font-medium transition-colors text-neutral-400 hover:text-white">');

fs.writeFileSync('components/ChartAnalysis.tsx', code);
