const fs = require('fs');
let code = fs.readFileSync('components/Projectile2DView.tsx', 'utf8');

// Ensure HUD stays on screen if projScreenY goes too high
code = code.replace(
  /ctx\.roundRect\(projScreenX \+ 20, projScreenY - 60, 160, 80, 8\);/g,
  `const hudY = Math.max(20, Math.min(h - 100, projScreenY - 60));
    ctx.roundRect(projScreenX + 20, hudY, 160, 80, 8);`
);
code = code.replace(/projScreenY - 40/g, 'hudY + 20');
code = code.replace(/projScreenY - 20/g, 'hudY + 40');
code = code.replace(/projScreenY - 5/g, 'hudY + 55');
code = code.replace(/projScreenY \+ 10/g, 'hudY + 70');

fs.writeFileSync('components/Projectile2DView.tsx', code);
