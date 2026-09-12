const fs = require('fs');
let code = fs.readFileSync('utils/physics.ts', 'utf8');

code = code.replace(
  'const { v0, angle, mass, windSpeed, windDirection, windShearEnabled, stratosphericWindSpeed, stratosphericWindDir, airDragEnabled, dragCoefficient, lat, lng, elevation } = params;',
  `let { v0, angle, mass, windSpeed, windDirection, windShearEnabled, stratosphericWindSpeed, stratosphericWindDir, airDragEnabled, dragCoefficient, lat, lng, elevation } = params;
  mass = Math.max(0.000001, mass);`
);

fs.writeFileSync('utils/physics.ts', code);
console.log("Patched physics.ts");
