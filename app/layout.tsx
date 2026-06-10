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
        {/* syed-juice: subtle, professional interaction polish — additive (calm button feedback + top scroll-progress bar), reduced-motion aware. No particle/burst or cursor-magnet effects. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){if(document.getElementById('syed-juice'))return;var css='@media (prefers-reduced-motion: no-preference){button,[role=button],.btn,[class*=btn],input[type=submit],input[type=button],select,summary{transition:transform .18s cubic-bezier(.4,0,.2,1),box-shadow .2s ease,border-color .18s ease,background-color .18s ease,color .18s ease}button:active,[role=button]:active,.btn:active,[class*=btn]:active,input[type=submit]:active,select:active,summary:active{transform:translateY(1px) scale(.985);transition-duration:.06s}}';var s=document.createElement('style');s.id='syed-juice';s.textContent=css;document.head.appendChild(s);if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;var pb=document.createElement('div');pb.id='syed-scroll-prog';pb.setAttribute('aria-hidden','true');pb.style.cssText='position:fixed;top:0;left:0;height:3px;width:0;z-index:100000;background:linear-gradient(135deg,#FF9656 0%,#F14575 55%,#9270F4 100%);box-shadow:0 0 10px rgba(241,69,117,.45);transition:width .12s linear;pointer-events:none';(document.body||document.documentElement).appendChild(pb);var pu=function(){var h=document.documentElement;var mx=h.scrollHeight-h.clientHeight;pb.style.width=(mx>0?(h.scrollTop/mx)*100:0)+'%';};addEventListener('scroll',pu,{passive:true});addEventListener('resize',pu,{passive:true});pu();})();` }} />
        {/* syed-tour: "Watch the tour" button + lightbox — narrated tour video served from the throughline-media Pages repo (pattern: research-suite/tools/tour-button/inject.mjs) */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var SLUG='timetable-generator',NAME='Timetable Generator',BASE='https://syahmedu.github.io/throughline-media/videos/tours/';function init(){if(document.getElementById('syed-tour-btn')||!document.body)return;var btn=document.createElement('button');btn.id='syed-tour-btn';btn.type='button';btn.setAttribute('aria-label','Watch the '+NAME+' tour');btn.style.cssText='position:fixed;right:18px;bottom:18px;z-index:9000;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid rgba(203,184,232,.4);background:rgba(21,16,31,.88);color:#f3eefc;font:600 13px/1 "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 4px 18px rgba(0,0,0,.35)';btn.innerHTML='<span style="display:inline-grid;place-items:center;width:18px;height:18px;border-radius:999px;background:linear-gradient(135deg,#FF9656,#F14575 55%,#9270F4);color:#fff;font-size:8px;line-height:1">\\u25B6</span><span>Tour</span>';btn.addEventListener('click',open);document.body.appendChild(btn)}function open(){if(document.getElementById('syed-tour-box'))return;var bd=document.createElement('div');bd.id='syed-tour-box';bd.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,5,14,.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:grid;place-items:center;padding:24px';var wrap=document.createElement('div');wrap.style.cssText='width:min(1100px,94vw);display:flex;flex-direction:column;gap:10px';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-label',NAME+' narrated tour');var v=document.createElement('video');v.src=BASE+SLUG+'.mp4';v.poster=BASE+'posters/'+SLUG+'.jpg';v.controls=true;v.autoplay=true;v.playsInline=true;v.style.cssText='width:100%;border-radius:16px;border:1px solid rgba(203,184,232,.3);background:#000';var x=document.createElement('button');x.type='button';x.textContent='Close \\u2715';x.style.cssText='align-self:flex-end;padding:6px 14px;border-radius:999px;border:1px solid rgba(203,184,232,.4);background:transparent;color:#cbb8e8;font:600 13px/1 "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer';function close(){bd.remove();document.removeEventListener('keydown',onKey)}function onKey(e){if(e.key==='Escape')close()}bd.addEventListener('click',function(e){if(e.target===bd)close()});x.addEventListener('click',close);document.addEventListener('keydown',onKey);wrap.appendChild(v);wrap.appendChild(x);bd.appendChild(wrap);document.body.appendChild(bd)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();` }} />
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
