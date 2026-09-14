const fs = require('fs');
let code = fs.readFileSync('components/InputPanel.tsx', 'utf8');

code = code.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport Link from 'next/link';");

const target = `<h2 className="text-xl font-bold text-white tracking-tight">Simulator Erupsi</h2>
            <p className="text-xs text-neutral-400">Advanced Physical Simulation</p>
          </div>
          <button`;

const replacement = `<h2 className="text-xl font-bold text-white tracking-tight">Simulator Erupsi</h2>
            <p className="text-xs text-neutral-400">Advanced Physical Simulation</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/custom" className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors" title="Simulasi Kustom (Pilih Titik)">
              <Target className="w-5 h-5" />
            </Link>
            <button`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('components/InputPanel.tsx', code);
  console.log('Success');
} else {
  console.log('Target not found');
}
