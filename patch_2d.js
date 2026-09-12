const fs = require('fs');
let code = fs.readFileSync('components/Projectile2DView.tsx', 'utf8');

// The issue is that the camera centers on the projectile, which is fine, but maybe the ground isn't visible?
// Let's modify the view to keep the ground visible if possible, or just adjust the Y center.
// Right now, camY = currentPoint.y, so projectile is always center screen vertically.
// If the projectile is at 10,000m altitude, the ground is 10,000m below it.
// If viewWidthMeters is 3000, then the screen shows +/- 1500m vertically (if 2:1 aspect ratio).
// So the ground at 10,000m below will definitely be cut off.
// Let's change the camera logic.
// We want to show the mountain if it's the beginning, but generally we just need a wider view.

// 1. Change viewWidthMeters to be dynamically based on altitude or just larger.
code = code.replace(
  /const viewWidthMeters = 3000;/g,
  'const viewWidthMeters = Math.max(8000, currentPoint.y * 2.5); // Dynamic zoom'
);

// 2. Adjust camY so it tries to keep ground in view if possible, or just center between ground and projectile
code = code.replace(
  /const camY = currentPoint.y;/g,
  'const currentGround = currentPoint.groundElev || 0;\n    const camY = Math.max(currentPoint.y / 2 + currentGround / 2, currentPoint.y - viewWidthMeters * (h/w) * 0.4);'
);

// 3. Make ground color a bit brighter so it's clearly a mountain
code = code.replace(/ctx\.fillStyle = '#171717';/g, "ctx.fillStyle = '#1f2937'; // slate-800");

// 4. Fill text HUD properly
code = code.replace(
  /const projScreenX = cx;/g,
  `const projScreenX = cx; // X is always center
    const projScreenY = cy - (currentPoint.y - camY) * scale; // Adjust Y based on camera offset`
);

fs.writeFileSync('components/Projectile2DView.tsx', code);
