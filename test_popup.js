const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /className="absolute bottom-full left-0 w-full mb-3 z-\[100\]/g,
  `className="absolute bottom-full left-0 w-full mb-3 z-[99999]`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Increased Z-Index");
