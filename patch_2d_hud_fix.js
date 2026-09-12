const fs = require('fs');
let code = fs.readFileSync('components/Projectile2DView.tsx', 'utf8');

// Fix duplicate projScreenY declaration
code = code.replace(
  /const projScreenY = cy - \(currentPoint\.y - camY\) \* scale; \/\/ Adjust Y based on camera offset \/\/ Since camera centers on it\n\s*const projScreenY = cy;/g,
  'const projScreenY = cy - (currentPoint.y - camY) * scale; // Adjust Y based on camera offset'
);

fs.writeFileSync('components/Projectile2DView.tsx', code);
