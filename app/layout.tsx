import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import ThemeToggle from './ThemeToggle';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

const SITE_URL = 'https://syahmedu.github.io/timetable-generator';
const OG_URL   = `${SITE_URL}/og.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Timetable Manager — AY 2026-27 Odd Sem',
  description: 'Constraint-based academic timetable generator for 11 classes across 3 departments. Mentor categories, max-hours-per-week, CSV + Excel + print export.',
  alternates: { canonical: SITE_URL + '/' },
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%232563eb'/><text x='16' y='23' text-anchor='middle' font-family='system-ui' font-weight='800' font-size='19' fill='white'>S</text></svg>" },
  openGraph: {
    type: 'website',
    title: 'Timetable Manager — AY 2026-27 Odd Sem',
    description: 'Constraint-based academic timetable. 11 classes · 3 departments · CSV + Excel + print.',
    url: SITE_URL + '/',
    siteName: 'Syed Asrar',
    images: [{ url: OG_URL, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timetable Manager — AY 2026-27',
    description: '11 classes · 3 departments · CSV + Excel + print.',
    images: [OG_URL],
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF7EF',
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
    <html lang="en" className={`${geist.variable} h-full`} data-theme="light">
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-geist), sans-serif' }}>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('syed-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
        {/* syed-juice: game-grade interaction polish — additive (transforms + currentColor click-burst), reduced-motion aware */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){if(document.getElementById('syed-juice'))return;var css='@media (prefers-reduced-motion: no-preference){button,[role=button],.btn,[class*=btn],input[type=submit],input[type=button],select,summary{transition:transform .16s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease,border-color .18s ease,background-color .18s ease,color .18s ease}button:active,[role=button]:active,.btn:active,[class*=btn]:active,input[type=submit]:active,select:active,summary:active{transform:translateY(1px) scale(.96);transition-duration:.06s}}.syed-burst{position:fixed;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;pointer-events:none;z-index:99999;background:radial-gradient(circle,currentColor 0%,transparent 70%);transform:scale(0);opacity:.5;animation:syed-burst .5s cubic-bezier(.22,1,.36,1) forwards}@keyframes syed-burst{to{transform:scale(3.4);opacity:0}}@media (prefers-reduced-motion:reduce){.syed-burst{display:none}}';var s=document.createElement('style');s.id='syed-juice';s.textContent=css;document.head.appendChild(s);if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;addEventListener('pointerdown',function(e){if(e.button!==0)return;var t=e.target&&e.target.closest&&e.target.closest('button,a,[role=button],input[type=button],input[type=submit],summary,.btn,[class*=btn]');if(!t)return;var b=document.createElement('span');b.className='syed-burst';b.style.left=e.clientX+'px';b.style.top=e.clientY+'px';b.style.color=getComputedStyle(t).color;document.body.appendChild(b);setTimeout(function(){b.remove()},520)},{passive:true})})();` }} />
        <a href="#main-content" className="skip-link">Skip to content</a>
        {/* Syed brand bar — storytale palette */}
        <style>{`@keyframes syed-glow{0%,100%{box-shadow:0 4px 14px -4px rgba(241,69,117,.45)}50%{box-shadow:0 6px 22px -4px rgba(146,112,244,.55)}}`}</style>
        <div style={{ position:'sticky',top:0,zIndex:9999,display:'flex',alignItems:'center',gap:12,padding:'0 18px',height:48,background:'var(--bar-bg)',backdropFilter:'blur(20px) saturate(150%)',WebkitBackdropFilter:'blur(20px) saturate(150%)',borderBottom:'1px solid var(--border)',flexShrink:0,fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif" }} className="print:hidden">
          <a href="https://syahmedu.github.io/nexus/" target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:9,textDecoration:'none',flexShrink:0 }}>
            <span style={{ width:28,height:28,background:'linear-gradient(135deg,#FF9656 0%,#F14575 55%,#9270F4 100%)',borderRadius:8,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'.78rem',fontWeight:800,color:'#fff',flexShrink:0,boxShadow:'0 4px 14px -4px rgba(241,69,117,.55)',animation:'syed-glow 5s ease-in-out infinite' }}>S</span>
            <span style={{ fontSize:'.9rem',fontWeight:800,color:'var(--bar-text)',letterSpacing:'-.02em' }}>Syed</span>
          </a>
          <span style={{ width:1,height:16,background:'var(--border)',flexShrink:0,margin:'0 3px' }} />
          <span style={{ fontSize:'.74rem',color:'var(--bar-muted)',fontWeight:500,flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',letterSpacing:'.01em' }}>Timetable Manager</span>
          <nav style={{ display:'flex',alignItems:'center',marginLeft:'auto',gap:2 }}>
            <a href="https://syahmedu.github.io/journaltime/" target="_blank" rel="noopener noreferrer" style={{ fontSize:'.74rem',color:'var(--bar-muted)',textDecoration:'none',padding:'5px 11px',borderRadius:999,whiteSpace:'nowrap',fontWeight:600,letterSpacing:'.01em' }}>JournalTime</a>
            <a href="https://scalescope.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize:'.74rem',color:'var(--bar-muted)',textDecoration:'none',padding:'5px 11px',borderRadius:999,whiteSpace:'nowrap',fontWeight:600,letterSpacing:'.01em' }}>ScaleScope</a>
            <a href="https://syahmedu.github.io/nexus/" target="_blank" rel="noopener noreferrer" style={{ fontSize:'.74rem',fontWeight:700,textDecoration:'none',padding:'5px 13px',borderRadius:999,background:'linear-gradient(135deg,#FF9656 0%,#F14575 55%,#9270F4 100%)',color:'#fff',whiteSpace:'nowrap',letterSpacing:'.01em',boxShadow:'0 6px 16px -6px rgba(241,69,117,.55)' }}>All Projects →</a>
          </nav>
          <ThemeToggle />
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

        <main id="main-content" tabIndex={-1} className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-7">
          {children}
        </main>
      </body>
    </html>
  );
}
