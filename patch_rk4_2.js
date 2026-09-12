const fs = require('fs');
let code = fs.readFileSync('utils/physics.ts', 'utf8');

code = code.replace(
  /const dt = Math\.max\(0\.01, Math\.min\(0\.5, 200 \/ v0\)\);/,
  `let dt = 0.5; // Changed to let dt so it can be used for interpolation`
);

fs.writeFileSync('utils/physics.ts', code);
console.log("Fixed dt declaration");
