import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Timetable Manager — Syed',
  description: 'AY 2026-27 Odd Semester timetable for all 11 classes',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%232563eb'/><text x='16' y='23' text-anchor='middle' font-family='system-ui' font-weight='800' font-size='19' fill='white'>S</text></svg>" },
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
        {/* Syed brand bar */}
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'0 20px',height:34,background:'#0f172a',borderBottom:'1px solid #1e293b',fontFamily:'inherit',position:'sticky',top:0,zIndex:9999,flexShrink:0 }} className="print:hidden">
          <a href="https://syahmedu.github.io/nexus/" target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none',flexShrink:0 }}>
            <span style={{ width:20,height:20,background:'linear-gradient(135deg,#2563eb,#7c3aed)',borderRadius:5,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'0.68rem',fontWeight:800,color:'#fff' }}>S</span>
            <span style={{ fontSize:'0.8rem',fontWeight:700,color:'#f8fafc',letterSpacing:'-0.01em' }}>Syed</span>
          </a>
          <span style={{ color:'#1e293b',margin:'0 2px' }}>·</span>
          <span style={{ fontSize:'0.73rem',color:'#475569',flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>Timetable Manager</span>
          <nav style={{ display:'flex',alignItems:'center',marginLeft:'auto',gap:0 }}>
            <a href="https://syahmedu.github.io/journaltime/" target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.68rem',color:'#334155',textDecoration:'none',padding:'3px 8px',borderRadius:4,whiteSpace:'nowrap' }}>JournalTime</a>
            <a href="https://scalescope.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.68rem',color:'#334155',textDecoration:'none',padding:'3px 8px',borderRadius:4,whiteSpace:'nowrap' }}>ScaleScope</a>
            <a href="https://syahmedu.github.io/nexus/" target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.68rem',color:'#60a5fa',fontWeight:600,textDecoration:'none',padding:'3px 8px',borderRadius:4,whiteSpace:'nowrap' }}>All Projects →</a>
          </nav>
        </div>
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
