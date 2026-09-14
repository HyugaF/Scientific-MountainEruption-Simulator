const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const target = `Masuk Aplikasi
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </motion.button>`;

const replacement = `Masuk Aplikasi
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </motion.button>
            
            <Link href="/custom" className="w-full block">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full justify-center px-8 py-3 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 rounded-full font-medium transition-all duration-300 flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                Simulasi Kustom (Pilih Titik)
              </motion.button>
            </Link>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app/page.tsx', code);
  console.log('Success');
} else {
  console.log('Target not found');
}
