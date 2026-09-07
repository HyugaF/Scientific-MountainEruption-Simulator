import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Simulasi Trajektori Letusan Gunung Api | Informatika UNS',
  description: 'Simulator trajektori vulkanik interaktif untuk memprediksi sebaran proyektil dan awan abu vulkanik.',
  icons: {
    icon: '/image.png',
  },
  openGraph: {
    title: 'Simulasi Trajektori Letusan Gunung Api',
    description: 'Simulator trajektori vulkanik interaktif.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulasi Trajektori Letusan Gunung Api',
    description: 'Simulator trajektori vulkanik interaktif.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
