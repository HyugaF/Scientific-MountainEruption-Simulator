const fs = require('fs');
let code = fs.readFileSync('hooks/use-mobile.ts', 'utf8');
code = code.replace(/const onChange = \(\) => \{[\s\S]*?mql\.addEventListener\("change", onChange\)\n    const check = \(\) => setIsMobile\(window\.innerWidth < MOBILE_BREAKPOINT\); check\(\);\n    return \(\) => mql\.removeEventListener\("change", onChange\)\n  \}, \[\]\)/m, 
`const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange)
  }, [])`);
fs.writeFileSync('hooks/use-mobile.ts', code);
