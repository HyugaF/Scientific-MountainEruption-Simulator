const fs = require('fs');
let code = fs.readFileSync('components/ChartAnalysis.tsx', 'utf8');

// Soften Cartesian grid
code = code.replace(/<CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} \/>/g, '<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />');

// Adjust chart margins to be flush with the box
code = code.replace(/margin=\{\{ top: 5, right: 20, left: 10, bottom: 0 \}\}/g, 'margin={{ top: 10, right: 0, left: -20, bottom: 0 }}');

// Adjust the chart container to allow the chart to bleed to the edges better
code = code.replace(/<div className="w-full h-\[250px\] sm:h-\[300px\] md:h-auto md:flex-1 mt-2 px-1 sm:px-3 pb-2">/g, '<div className="w-full h-[250px] sm:h-[300px] md:h-auto md:flex-1 mt-2 px-0 sm:px-2 pb-0">');

// For the Axis, we can remove the axis lines completely to look extremely seamless
code = code.replace(/stroke="#333"/g, 'stroke="transparent"'); // Axis lines invisible

// Improve axis text
code = code.replace(/tick=\{\{ fill: "#666", fontSize: 11 \}\}/g, 'tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}');

fs.writeFileSync('components/ChartAnalysis.tsx', code);
