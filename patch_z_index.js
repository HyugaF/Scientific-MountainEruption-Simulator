const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /<div className="space-y-2 relative w-full">/g,
  `<div className={\`space-y-2 relative w-full \${isDragging ? 'z-[1000]' : 'z-10'}\`}>`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched z-index wrapper");
