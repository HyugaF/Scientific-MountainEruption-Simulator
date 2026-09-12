const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /<input\s+type="range"[\s\S]*?className=\{`w-full cursor-pointer relative z-10 \$\{accentClass\}`\}\s*\/>/,
  `<input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onMouseEnter={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
          className={\`w-full cursor-pointer relative z-10 \${accentClass}\`}
        />`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched slider events");
