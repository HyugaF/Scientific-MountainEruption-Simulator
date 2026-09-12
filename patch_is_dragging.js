const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace(
  /const \[isDragging, setIsDragging\] = useState\(false\);/,
  `const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);`
);

fs.writeFileSync('components/InputPanel.tsx', code);
console.log("Patched dragging");
