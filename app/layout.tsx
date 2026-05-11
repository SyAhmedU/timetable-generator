import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'AMET University — Timetable Manager',
  description: 'AY 2026-27 Odd Semester timetable for all 11 classes',
};

const NAV = [
  { href: '/',          label: 'Dashboard' },
  { href: '/setup',     label: 'Setup'     },
  { href: '/timetable', label: 'Timetable' },
  { href: '/mentors',   label: 'Mentors'   },
  { href: '/absence',   label: 'Absence'   },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: '#1a202c', fontFamily: 'var(--font-geist), sans-serif' }}>
        <header style={{ background: 'var(--navy)' }} className="shadow-xl print:hidden">
          <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-6">
            {/* Branding */}
            <div className="flex flex-col leading-none select-none shrink-0">
              <span style={{ color: 'var(--gold)' }} className="font-bold text-base tracking-tight">
                AMET University
              </span>
              <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase mt-0.5">
                Timetable Manager
              </span>
            </div>

            {/* Divider */}
            <div className="h-7 w-px bg-white/10 shrink-0" />

            {/* Nav */}
            <nav className="flex gap-0.5">
              {NAV.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Right badge */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.3)' }}
                className="text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide">
                AY 2026–27 · Odd Sem
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-7">
          {children}
        </main>
      </body>
    </html>
  );
}
