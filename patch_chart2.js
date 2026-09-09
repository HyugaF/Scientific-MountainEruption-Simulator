const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Fix 1: Change the metrics wrapping div to a grid or horizontal scroll
code = code.replace(
  /<div className="flex flex-wrap items-center justify-between gap-2 mb-6">/g,
  '<div className="grid grid-cols-3 gap-2 mb-4">'
);
code = code.replace(
  /<div className="flex items-center gap-3 bg-neutral-800\/50 px-4 py-2 rounded-lg border border-neutral-700\/50">/g,
  '<div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 bg-neutral-800/50 p-2 sm:px-4 sm:py-2 rounded-lg border border-neutral-700/50 text-center sm:text-left">'
);

// Fix 2: Do the same for aerosol metrics
code = code.replace(
  /<div className="flex flex-wrap items-center justify-between gap-4 mb-6">/g,
  '<div className="grid grid-cols-2 gap-2 mb-4">'
);

// Also remove overflow-hidden on the root and make it overflow-y-auto just in case
code = code.replace(
  /<div className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-hidden shadow-lg border border-neutral-800 p-4 relative">/g,
  '<div className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-y-auto overflow-x-hidden shadow-lg border border-neutral-800 p-3 sm:p-4 relative">'
);

// Decrease text sizes slightly in the metrics boxes for mobile
code = code.replace(
  /<div className="text-\[10px\] text-neutral-400 font-medium uppercase tracking-wider">/g,
  '<div className="text-[8px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider leading-tight">'
);
code = code.replace(
  /<div className="text-lg font-bold">/g,
  '<div className="text-sm sm:text-lg font-bold mt-1 sm:mt-0">'
);

// Fix 3: In the Academic Metrics Banner at the top, make it wrap gracefully
code = code.replace(
  /<div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-4 pb-4 border-b border-neutral-800\/50">/g,
  '<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pb-4 border-b border-neutral-800/50">'
);
code = code.replace(
  /<div className="flex flex-wrap items-center gap-6">/g,
  '<div className="grid grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 sm:gap-6">'
);

fs.writeFileSync('components/ChartAnalysis.tsx', code);
