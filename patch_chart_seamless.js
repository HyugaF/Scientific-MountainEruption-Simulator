const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Refactor Ballistic Metrics to be seamless
code = code.replace(
  /<div className="grid grid-cols-3 gap-2 mb-4">/g,
  '<div className="flex items-center justify-between px-2 sm:px-4 mb-2 sm:mb-4">'
);

code = code.replace(
  /<div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 bg-neutral-800\/50 p-2 sm:px-4 sm:py-2 rounded-lg border border-neutral-700\/50 text-center sm:text-left">/g,
  '<div className="flex flex-col items-center sm:flex-row gap-1 sm:gap-2 text-center sm:text-left">'
);

// Simplify metric box inside
code = code.replace(
  /<div className="text-\[8px\] sm:text-\[10px\] text-neutral-400 font-medium uppercase tracking-wider leading-tight">/g,
  '<div className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wider leading-tight">'
);
code = code.replace(
  /<div className="text-sm sm:text-lg font-bold mt-1 sm:mt-0">/g,
  '<div className="text-sm sm:text-xl font-light text-white">'
);

// Also for Aerosol metrics
code = code.replace(
  /<div className="grid grid-cols-2 gap-2 mb-4">/g,
  '<div className="flex items-center justify-around px-2 sm:px-4 mb-2 sm:mb-4">'
);

// Wrapper changes to look more seamless
code = code.replace(
  /className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-y-auto overflow-x-hidden shadow-lg border border-neutral-800 p-3 sm:p-4 relative"/g,
  'className="flex flex-col h-full bg-neutral-900 text-white rounded-xl overflow-y-auto overflow-x-hidden shadow-lg border border-neutral-800 pt-3 sm:pt-4 relative"'
);

// Add padding to Header Row since wrapper padding is removed on sides
code = code.replace(
  /<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pb-4 border-b border-neutral-800\/50">/g,
  '<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pb-4 px-3 sm:px-4 border-b border-neutral-800/50">'
);

// Ensure the chart takes full width minus maybe tiny padding
code = code.replace(
  /<div className="w-full h-\[250px\] sm:h-\[300px\] md:h-auto md:flex-1 mt-2">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2 px-1 sm:px-3 pb-2">'
);
code = code.replace(
  /<div className="w-full h-\[250px\] sm:h-\[300px\] md:h-auto md:flex-1 overflow-auto border border-neutral-800 rounded-lg mt-2">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 overflow-auto border-t border-neutral-800 mt-2">'
);
code = code.replace(
  /<div className="w-full h-\[250px\] sm:h-\[300px\] md:h-auto md:flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-4 font-mono text-sm overflow-auto mt-2">/g,
  '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 bg-black p-4 font-mono text-sm overflow-auto mt-2">'
);

// Make axis strokes less visible to be "seamless"
code = code.replace(/stroke="#666"/g, 'stroke="#333"');
code = code.replace(/fill: '#888'/g, 'fill: "#666"');

// Fix tooltips to be cleaner
code = code.replace(/borderColor: '#333'/g, 'border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"');

fs.writeFileSync('components/ChartAnalysis.tsx', code);
