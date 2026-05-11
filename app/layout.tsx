import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Timetable Generator – AY 2026-27 Odd Semester',
  description: 'Single-point timetable generator for all 11 classes',
};

const NAV = [
  { href: '/',           label: 'Dashboard'  },
  { href: '/setup',      label: 'Setup'       },
  { href: '/timetable',  label: 'Timetable'   },
  { href: '/mentors',    label: 'Mentors'      },
  { href: '/absence',    label: 'Absence'      },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-6 flex items-center gap-8 h-14">
            <span className="font-bold text-blue-700 text-lg whitespace-nowrap">
              TimetablePro
            </span>
            <nav className="flex gap-1">
              {NAV.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <span className="ml-auto text-xs text-gray-400">AY 2026-27 | Odd Semester</span>
          </div>
        </header>
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
