const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// 1. Update Props
code = code.replace(
  'progressIndex: number;\n}',
  'progressIndex: number;\n  onExport?: () => void;\n}'
);

// 2. Update function signature
code = code.replace(
  'export default function ChartAnalysis({ mode, ballisticResult, aerosolResult, academicMetrics, progressIndex }: Props) {',
  'export default function ChartAnalysis({ mode, ballisticResult, aerosolResult, academicMetrics, progressIndex, onExport }: Props) {'
);

// 3. Remove handleExportCSV block
const exportFnStart = code.indexOf('const handleExportCSV = () => {');
const exportFnEndStr = '  const primary = ballisticResult.primary;';
const exportFnEnd = code.indexOf(exportFnEndStr);
if (exportFnStart > -1 && exportFnEnd > -1) {
    code = code.substring(0, exportFnStart) + code.substring(exportFnEnd);
}

// 4. Change JSX button from CSV to PDF
code = code.replace(
  /<button onClick=\{handleExportCSV\} className="flex items-center gap-1\.5 px-3 py-1\.5 bg-neutral-800\/50 hover:bg-neutral-700\/50 rounded-lg text-xs font-medium transition-colors text-neutral-400 hover:text-white">\s*<Download className="w-4 h-4" \/>\s*<span>CSV<\/span>\s*<\/button>/g,
  `{onExport && (
            <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-xs font-medium transition-colors text-neutral-400 hover:text-white" title="Unduh Laporan PDF">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          )}`
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
console.log("Patched ChartAnalysis.tsx");
