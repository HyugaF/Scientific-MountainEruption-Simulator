const fs = require('fs');
let code = fs.readFileSync('utils/exportPdf.ts', 'utf8');

code = code.replace(
  /import 'jspdf-autotable';/,
  `import autoTable from 'jspdf-autotable';`
);

code = code.replace(/\(doc as any\)\.autoTable\(/g, 'autoTable(doc, ');

fs.writeFileSync('utils/exportPdf.ts', code);
console.log("Patched exportPdf.ts");
