const fs = require('fs');
let code = fs.readFileSync('utils/physics.ts', 'utf8');

code = code.replace(
  /let dt = 0\.5;\n    if \(aMag > 0\) {/,
  `dt = 0.5;\n    if (aMag > 0) {`
);

fs.writeFileSync('utils/physics.ts', code);
console.log("Fixed dt shadowing");
