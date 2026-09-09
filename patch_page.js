const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
code = code.replace(/useEffect\(\(\) => \{[\s\S]*?return \(\) => window\.removeEventListener\('resize', handleResize\);\n  \}, \[\]\);/m, 
`useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`);
fs.writeFileSync('app/page.tsx', code);
