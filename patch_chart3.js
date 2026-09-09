const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Replace flex-1 min-h-[150px] with specific heights for the charts
code = code.replace(
  /<div className="flex-1 min-h-\[150px\] w-full">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2">'
);

// Replace flex-1 w-full h-full min-h-[150px] for 2d anim view
code = code.replace(
  /<div className="flex-1 w-full h-full min-h-\[150px\]">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2">'
);

// Also replace the overflow-auto wrapper for the table to have a fixed height on mobile
code = code.replace(
  /<div className="flex-1 overflow-auto border border-neutral-800 rounded-lg">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 overflow-auto border border-neutral-800 rounded-lg mt-2">'
);

// And the telemetry view
code = code.replace(
  /<div className="flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-4 font-mono text-sm overflow-auto">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-4 font-mono text-sm overflow-auto mt-2">'
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
