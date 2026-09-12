const fs = require('fs');
let code = fs.readFileSync('utils/physics.ts', 'utf8');

// Replace the fixed dt definition
code = code.replace(
  /\/\/ Adaptive time step based on velocity \[\.\.\.\]\n\s*const dt = Math\.max\(0\.01, Math\.min\(0\.5, 200 \/ v0\)\);/,
  `// Dynamic time step is used inside the loop`
);

const rk4Code = `    // 4th-Order Runge-Kutta (RK4) Step
    const k1 = getDerivatives(state, t);
    const k2 = getDerivatives(state_k2, t + 0.5 * dt);
    const state_k3 = state.map((s, i) => s + 0.5 * dt * k2[i]);
    const k3 = getDerivatives(state_k3, t + 0.5 * dt);
    const state_k4 = state.map((s, i) => s + dt * k3[i]);
    const k4 = getDerivatives(state_k4, t + dt);
    
    state = state.map((s, i) => s + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += dt;`;

// Let's do a replace using regex for the RK4 part
code = code.replace(
  /    \/\/ 4th-Order Runge-Kutta \(RK4\) Step\n    const k1 = getDerivatives\(state, t\);\n    const state_k2 = state\.map\(\(s, i\) => s \+ 0\.5 \* dt \* k1\[i\]\);\n    const k2 = getDerivatives\(state_k2, t \+ 0\.5 \* dt\);\n    const state_k3 = state\.map\(\(s, i\) => s \+ 0\.5 \* dt \* k2\[i\]\);\n    const k3 = getDerivatives\(state_k3, t \+ 0\.5 \* dt\);\n    const state_k4 = state\.map\(\(s, i\) => s \+ dt \* k3\[i\]\);\n    const k4 = getDerivatives\(state_k4, t \+ dt\);\n    \n    state = state\.map\(\(s, i\) => s \+ \(dt \/ 6\) \* \(k1\[i\] \+ 2 \* k2\[i\] \+ 2 \* k3\[i\] \+ k4\[i\]\)\);\n    t \+= dt;/,
  `    // 4th-Order Runge-Kutta (RK4) Step
    const k1 = getDerivatives(state, t);
    
    const vMag = Math.sqrt(state[3]**2 + state[4]**2 + state[5]**2);
    const aMag = Math.sqrt(k1[3]**2 + k1[4]**2 + k1[5]**2);
    let dt = 0.5;
    if (aMag > 0) {
      dt = Math.max(0.001, Math.min(0.5, Math.max(5, vMag * 0.1) / aMag));
    }
    
    const state_k2 = state.map((s, i) => s + 0.5 * dt * k1[i]);
    const k2 = getDerivatives(state_k2, t + 0.5 * dt);
    const state_k3 = state.map((s, i) => s + 0.5 * dt * k2[i]);
    const k3 = getDerivatives(state_k3, t + 0.5 * dt);
    const state_k4 = state.map((s, i) => s + dt * k3[i]);
    const k4 = getDerivatives(state_k4, t + dt);
    
    state = state.map((s, i) => s + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += dt;`
);

fs.writeFileSync('utils/physics.ts', code);
console.log("Patched physics.ts RK4");
