const fs = require('fs');
let code = fs.readFileSync('hooks/use-mobile.ts', 'utf8');
code = code.replace(
  /mql\.addEventListener\("change", onChange\)\n    setIsMobile\(window\.innerWidth < MOBILE_BREAKPOINT\);\n    return \(\) => mql\.removeEventListener\("change", onChange\)/m,
  `mql.addEventListener("change", onChange)\n    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); setTimeout(check, 0);\n    return () => mql.removeEventListener("change", onChange)`
);
fs.writeFileSync('hooks/use-mobile.ts', code);
