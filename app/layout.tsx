import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import ThemeToggle from './ThemeToggle';
import SWRegister from './SWRegister';
import NavLinks from './NavLinks';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

const SITE_URL = 'https://syahmedu.github.io/timetable-generator';
const OG_URL   = `${SITE_URL}/og.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Timetable Manager — AY 2026-27 Odd Sem',
  description: 'Constraint-based academic timetable generator for 11 classes across 3 departments. Mentor categories, max-hours-per-week, CSV + Excel + print export.',
  alternates: { canonical: SITE_URL + '/' },
  manifest: '/timetable-generator/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Timetable', statusBarStyle: 'default' },
  other: { 'mobile-web-app-capable': 'yes' },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%232563eb'/><text x='16' y='23' text-anchor='middle' font-family='system-ui' font-weight='800' font-size='19' fill='white'>S</text></svg>",
    apple: '/timetable-generator/icon.svg',
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} data-theme="light">
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-geist), sans-serif' }}>
        {/* SYED-GATE: client-side entry password (29071993), re-locks every load. Obscurity, not real security. Mirrors research-suite/tools/gate/inject.mjs */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){"use strict";if(window.__syedGate)return;window.__syedGate=1;var PASS="29071993";function mk(){if(document.getElementById("syed-gate"))return;var ov=document.createElement("div");ov.id="syed-gate";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Password required");ov.style.cssText="position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 18%,#221c16 0%,#181410 60%,#120e0a 100%);color:#e9ddc9;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased;padding:24px";var box=document.createElement("div");box.style.cssText="width:min(380px,86vw);text-align:center";box.innerHTML="<div style='font-size:11.5px;letter-spacing:.4em;text-transform:uppercase;color:#7d6f5b;margin-bottom:24px'>private</div><div style='font:italic 400 30px/1.2 Georgia,serif;margin-bottom:30px'>Enter to continue</div><input id='syed-gate-i' inputmode='numeric' autocomplete='off' autocapitalize='off' spellcheck='false' aria-label='password' placeholder='········' maxlength='24' style='width:100%;background:transparent;border:0;border-bottom:1px solid #3a3128;color:#e9ddc9;font:400 24px/1 Georgia,serif;text-align:center;letter-spacing:.4em;padding:8px 0 10px;outline:none;caret-color:#bb6a57'/><div id='syed-gate-h' style='margin-top:18px;font-size:12px;letter-spacing:.12em;color:#7d6f5b;height:16px'>enter to open</div>";ov.appendChild(box);(document.body||document.documentElement).appendChild(ov);var html=document.documentElement,prev=html.style.overflow;html.style.overflow="hidden";var inp=box.querySelector("#syed-gate-i"),hint=box.querySelector("#syed-gate-h");function ok(){html.style.overflow=prev;if(ov.parentNode)ov.parentNode.removeChild(ov);}function tryit(){var v=(inp.value||"").trim();if(v===PASS){ok();return;}if(v.length>=PASS.length){hint.textContent="not quite";inp.value="";inp.style.borderBottomColor="#9c4a3c";setTimeout(function(){hint.textContent="enter to open";inp.style.borderBottomColor="#3a3128";},800);}}inp.addEventListener("input",function(){if((inp.value||"").trim().length>=PASS.length)tryit();});inp.addEventListener("keydown",function(e){if(e.key==="Enter")tryit();});setTimeout(function(){try{inp.focus();}catch(e){}},50);}mk();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mk);})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('syed-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
        {/* syed-juice: subtle, professional interaction polish — additive (calm button feedback + top scroll-progress bar), reduced-motion aware. No particle/burst or cursor-magnet effects. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){if(document.getElementById('syed-juice'))return;var css='@media (prefers-reduced-motion: no-preference){button,[role=button],.btn,[class*=btn],input[type=submit],input[type=button],select,summary{transition:transform .18s cubic-bezier(.4,0,.2,1),box-shadow .2s ease,border-color .18s ease,background-color .18s ease,color .18s ease}button:active,[role=button]:active,.btn:active,[class*=btn]:active,input[type=submit]:active,select:active,summary:active{transform:translateY(1px) scale(.985);transition-duration:.06s}}';var s=document.createElement('style');s.id='syed-juice';s.textContent=css;document.head.appendChild(s);if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;var pb=document.createElement('div');pb.id='syed-scroll-prog';pb.setAttribute('aria-hidden','true');pb.style.cssText='position:fixed;top:0;left:0;height:3px;width:0;z-index:100000;background:linear-gradient(135deg,#FF9656 0%,#F14575 55%,#9270F4 100%);box-shadow:0 0 10px rgba(241,69,117,.45);transition:width .12s linear;pointer-events:none';(document.body||document.documentElement).appendChild(pb);var pu=function(){var h=document.documentElement;var mx=h.scrollHeight-h.clientHeight;pb.style.width=(mx>0?(h.scrollTop/mx)*100:0)+'%';};addEventListener('scroll',pu,{passive:true});addEventListener('resize',pu,{passive:true});pu();})();` }} />
        {/* syed-ambient: living ambient backdrop — brand aurora blobs + sheen + flowing thread (pattern: research-suite/tools/ambient/inject.mjs); hidden under reduced-motion and in print */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){if(document.getElementById('syed-ambient'))return;var css='#syed-ambient{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}#syed-ambient i{position:absolute;display:block;border-radius:50%;will-change:transform}#syed-ambient .sa-a{width:58vmax;height:58vmax;left:-16vmax;top:-20vmax;background:radial-gradient(circle,rgba(255,150,86,.17),transparent 62%);animation:sa-a 30s ease-in-out infinite alternate}#syed-ambient .sa-b{width:52vmax;height:52vmax;right:-18vmax;top:-2vmax;background:radial-gradient(circle,rgba(146,112,244,.17),transparent 62%);animation:sa-b 38s ease-in-out infinite alternate}#syed-ambient .sa-c{width:48vmax;height:48vmax;left:24vmax;bottom:-26vmax;background:radial-gradient(circle,rgba(241,69,117,.13),transparent 62%);animation:sa-c 46s ease-in-out infinite alternate}@keyframes sa-a{to{transform:translate(10vmax,8vmax) scale(1.15)}}@keyframes sa-b{to{transform:translate(-12vmax,10vmax) scale(.9)}}@keyframes sa-c{to{transform:translate(-9vmax,-9vmax) scale(1.18)}}#syed-ambient .sa-sheen{inset:-35%;width:auto;height:auto;border-radius:0;background:conic-gradient(from 0deg at 50% 50%,transparent 0deg,rgba(241,69,117,.04) 50deg,transparent 110deg,rgba(146,112,244,.038) 215deg,transparent 280deg);animation:sa-spin 90s linear infinite}@keyframes sa-spin{to{transform:rotate(360deg)}}#syed-ambient svg{position:absolute;inset:0;width:100%;height:100%;opacity:.45}#syed-ambient svg path{fill:none;stroke:url(#syedAmbGrad);stroke-width:1.5;stroke-linecap:round;vector-effect:non-scaling-stroke;opacity:.32;stroke-dasharray:7 43;animation:sa-flow 26s linear infinite}@keyframes sa-flow{to{stroke-dashoffset:-100}}[data-theme="light"] #syed-ambient{opacity:.55}@media (prefers-reduced-motion: reduce){#syed-ambient{display:none}}@media print{#syed-ambient{display:none}}';function init(){if(!document.body||document.getElementById('syed-ambient'))return;var s=document.createElement('style');s.id='syed-ambient-css';s.textContent=css;document.head.appendChild(s);var d=document.createElement('div');d.id='syed-ambient';d.setAttribute('aria-hidden','true');d.innerHTML='<i class="sa-a"></i><i class="sa-b"></i><i class="sa-c"></i><i class="sa-sheen"></i><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="syedAmbGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF9656"/><stop offset=".5" stop-color="#F14575"/><stop offset="1" stop-color="#9270F4"/></linearGradient></defs><path d="M -4 82 C 20 66, 32 94, 52 72 C 68 54, 76 30, 104 14" pathLength="100"/></svg>';document.body.insertBefore(d,document.body.firstChild)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();` }} />
        {/* syed-dynamic: rich-but-tasteful motion layer — page entrance, staggered scroll reveals, verbatim-safe count-up stats, hover depth (pattern: research-suite/tools/dynamic/inject.mjs — keep in sync by hand, Next has no index.html for the injector) */}
        <script dangerouslySetInnerHTML={{ __html: `(function () {
  if (typeof document === 'undefined' || document.getElementById('syed-dynamic')) return;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = ':where(a,button,input,select,textarea,summary,[role=button]):focus-visible{outline:2px solid #F14575;outline-offset:2px}'
    + ':where(input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select):focus-visible{box-shadow:0 0 0 3px rgba(241,69,117,.16)}';
  if (!RM) css += [
    'html{scroll-behavior:smooth}',
    'body{transition:background-color .35s ease,color .35s ease}',
    '@keyframes sdyn-page{from{opacity:0}to{opacity:1}}',
    '.sdyn-in body{animation:sdyn-page .45s ease-out both}',
    '.sdyn-hide{opacity:0;transform:translateY(16px)}',
    '.sdyn-show{opacity:1;transform:none;transition:opacity .65s cubic-bezier(.22,1,.36,1) var(--sdyn-d,0ms),transform .65s cubic-bezier(.22,1,.36,1) var(--sdyn-d,0ms)}',
    '@media (hover:hover){.sdyn-lift{transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s cubic-bezier(.22,1,.36,1)}.sdyn-lift:hover{transform:translateY(-3px);box-shadow:0 2px 8px rgba(20,17,28,.08),0 14px 32px -12px rgba(146,112,244,.30)}}',
    '@media (hover:hover){.sdyn-cta{position:relative;overflow:hidden}.sdyn-cta::after{content:"";position:absolute;top:0;bottom:0;left:-70%;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.33),transparent);transform:skewX(-18deg);transition:left .6s cubic-bezier(.22,1,.36,1);pointer-events:none}.sdyn-cta:hover::after{left:125%}}',
    '@media print{.sdyn-hide{opacity:1!important;transform:none!important}}'
  ].join('');
  var style = document.createElement('style');
  style.id = 'syed-dynamic';
  style.textContent = css;
  document.head.appendChild(style);
  if (RM) return;
  document.documentElement.classList.add('sdyn-in');
  var SEL = '[data-reveal],section,article,[class*="card" i],[class*="tile"],[class*="panel"],[class*="station"],[class*="feature"]';
  function countUp() {
    var cand = document.querySelectorAll('[data-count],[class*="stat"],[class*="metric"],[class*="kpi"],[class*="count" i]');
    var list = [];
    for (var i = 0; i < cand.length && list.length < 40; i++) {
      var el = cand[i];
      if (el.__sdyn || el.children.length || el.closest('[data-no-dynamic]')) continue;
      var t = (el.textContent || '').trim();
      if (!t || t.length > 14) continue;
      var m = /^([^0-9+-]{0,3})([0-9][0-9,]*)(\\.[0-9]+)?( ?[%+kKMx\\u00d7]?)$/.exec(t);
      if (!m) continue;
      var v = parseFloat(m[2].replace(/,/g, '') + (m[3] || ''));
      if (!v) continue;
      if (!m[1] && !m[3] && !m[4].trim() && m[2].indexOf(',') === -1 && v >= 1900 && v <= 2099) continue;
      list.push({ el: el, t: t, v: v, pre: m[1], dec: m[3] ? m[3].length - 1 : 0, suf: m[4], sep: m[2].indexOf(',') !== -1 });
    }
    if (!list.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var d = en.target.__sdyn;
        if (!d || d.done) return;
        d.done = true;
        var t0 = performance.now(), DUR = 900;
        requestAnimationFrame(function tick(now) {
          var p = Math.min((now - t0) / DUR, 1), e = 1 - Math.pow(1 - p, 3);
          if (p >= 1) { d.el.textContent = d.t; return; }
          var cur = d.v * e;
          var s = d.dec ? cur.toFixed(d.dec) : (d.sep ? Math.round(cur).toLocaleString('en-US') : String(Math.round(cur)));
          d.el.textContent = d.pre + s + d.suf;
          requestAnimationFrame(tick);
        });
      });
    }, { threshold: 0.4 });
    list.forEach(function (d) { d.el.__sdyn = d; io.observe(d.el); });
  }
  var revList = [], rio = null;
  function getRio() {
    if (rio) return rio;
    rio = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        rio.unobserve(t);
        t.style.setProperty('--sdyn-d', (Math.min(n++, 5) * 70) + 'ms');
        t.classList.add('sdyn-show');
        setTimeout(function () { t.classList.remove('sdyn-hide', 'sdyn-show'); t.style.removeProperty('--sdyn-d'); }, 1500);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    window.addEventListener('beforeprint', function () {
      revList.forEach(function (el) { el.classList.remove('sdyn-hide', 'sdyn-show'); });
    });
    return rio;
  }
  function arm() {
    if (!('IntersectionObserver' in window)) return;
    try {
      var vh = window.innerHeight, vw = window.innerWidth;
      var els = document.querySelectorAll(SEL);
      for (var i = 0; i < els.length && revList.length < 200; i++) {
        var el = els[i];
        if (el.__sdynSeen) continue;
        if (el.classList.contains('is-watched') || el.classList.contains('is-revealed')) { el.__sdynSeen = 1; continue; }
        if (el.closest('[data-no-dynamic]') || el.closest('#syed-ambient')) { el.__sdynSeen = 1; continue; }
        var cs = getComputedStyle(el);
        if (cs.display === 'none') continue;
        if (cs.position === 'fixed' || cs.position === 'sticky') { el.__sdynSeen = 1; continue; }
        var r = el.getBoundingClientRect();
        if (r.height < 24 || r.width < 40 || r.height > vh * 0.9) continue;
        el.__sdynSeen = 1;
        if (r.height < vh * 0.7 && r.width < vw * 0.92 && !/transform|all/.test(cs.transitionProperty)) el.classList.add('sdyn-lift');
        if (r.top > vh * 0.88 && !el.closest('.sdyn-hide')) { el.classList.add('sdyn-hide'); revList.push(el); getRio().observe(el); }
      }
      var ctas = document.querySelectorAll('button,[role=button],a,input[type=submit]');
      var tagged = 0;
      for (var j = 0; j < ctas.length && tagged < 60; j++) {
        var b = ctas[j];
        if (b.__sdynCta) continue;
        b.__sdynCta = 1;
        if (b.closest('[data-no-dynamic]')) continue;
        var bs = getComputedStyle(b);
        if (bs.backgroundImage.indexOf('gradient') === -1) continue;
        if (getComputedStyle(b, '::after').content !== 'none') continue;
        var br = b.getBoundingClientRect();
        if (!br.width || br.width > 480) continue;
        b.classList.add('sdyn-cta');
        tagged++;
      }
      countUp();
    } catch (e) {}
  }
  var mt = null;
  function queueArm() { clearTimeout(mt); mt = setTimeout(arm, 450); }
  function boot() {
    setTimeout(arm, 350);
    if (window.MutationObserver && document.body) {
      new MutationObserver(queueArm).observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener('hashchange', queueArm);
    window.addEventListener('popstate', queueArm);
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();` }} />
        {/* syed-tour: "Watch the tour" button + lightbox — narrated tour video served from the throughline-media Pages repo (pattern: research-suite/tools/tour-button/inject.mjs) */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var SLUG='timetable-generator',NAME='Timetable Generator',BASE='https://syahmedu.github.io/throughline-media/videos/tours/';function init(){if(document.getElementById('syed-tour-btn')||!document.body)return;var btn=document.createElement('button');btn.id='syed-tour-btn';btn.type='button';btn.setAttribute('aria-label','Watch the '+NAME+' tour');btn.style.cssText='position:fixed;right:18px;bottom:18px;z-index:9000;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid rgba(203,184,232,.4);background:rgba(21,16,31,.88);color:#f3eefc;font:600 13px/1 "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 4px 18px rgba(0,0,0,.35)';btn.innerHTML='<span style="display:inline-grid;place-items:center;width:18px;height:18px;border-radius:999px;background:linear-gradient(135deg,#FF9656,#F14575 55%,#9270F4);color:#fff;font-size:8px;line-height:1">\\u25B6</span><span>Tour</span>';btn.addEventListener('click',open);document.body.appendChild(btn)}function open(){if(document.getElementById('syed-tour-box'))return;var bd=document.createElement('div');bd.id='syed-tour-box';bd.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,5,14,.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:grid;place-items:center;padding:24px';var wrap=document.createElement('div');wrap.style.cssText='width:min(1100px,94vw);display:flex;flex-direction:column;gap:10px';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-label',NAME+' narrated tour');var v=document.createElement('video');v.src=BASE+SLUG+'.mp4';v.poster=BASE+'posters/'+SLUG+'.jpg';v.controls=true;v.autoplay=true;v.playsInline=true;v.style.cssText='width:100%;border-radius:16px;border:1px solid rgba(203,184,232,.3);background:#000';var x=document.createElement('button');x.type='button';x.textContent='Close \\u2715';x.style.cssText='align-self:flex-end;padding:6px 14px;border-radius:999px;border:1px solid rgba(203,184,232,.4);background:transparent;color:#cbb8e8;font:600 13px/1 "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer';function close(){bd.remove();document.removeEventListener('keydown',onKey)}function onKey(e){if(e.key==='Escape')close()}bd.addEventListener('click',function(e){if(e.target===bd)close()});x.addEventListener('click',close);document.addEventListener('keydown',onKey);wrap.appendChild(v);wrap.appendChild(x);bd.appendChild(wrap);document.body.appendChild(bd)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();` }} />
        <SWRegister />
        <a href="#main-content" className="skip-link">Skip to content</a>
        {/* Syed brand bar — storytale palette */}
        <style>{`@keyframes syed-glow{0%,100%{box-shadow:0 4px 14px -4px rgba(241,69,117,.45)}50%{box-shadow:0 6px 22px -4px rgba(146,112,244,.55)}}
/* Collapse the brand-bar links on mobile so they can't force a desktop-width layout (house .syed-suite-nav pattern) */
@media(max-width:760px){.syed-suite-nav{display:none!important}}`}</style>
        <div style={{ position:'sticky',top:0,zIndex:9999,display:'flex',alignItems:'center',gap:12,padding:'0 18px',height:48,background:'var(--bar-bg)',backdropFilter:'blur(20px) saturate(150%)',WebkitBackdropFilter:'blur(20px) saturate(150%)',borderBottom:'1px solid var(--border)',flexShrink:0,fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif" }} className="print:hidden">
          <a href="https://syahmedu.github.io/nexus/" target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:9,textDecoration:'none',flexShrink:0 }}>
            <span style={{ width:28,height:28,background:'linear-gradient(135deg,#FF9656 0%,#F14575 55%,#9270F4 100%)',borderRadius:8,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'.78rem',fontWeight:800,color:'#fff',flexShrink:0,boxShadow:'0 4px 14px -4px rgba(241,69,117,.55)',animation:'syed-glow 5s ease-in-out infinite' }}>S</span>
            <span style={{ fontSize:'.9rem',fontWeight:800,color:'var(--bar-text)',letterSpacing:'-.02em' }}>Syed</span>
          </a>
          <span style={{ width:1,height:16,background:'var(--border)',flexShrink:0,margin:'0 3px' }} />
          <span style={{ fontSize:'.74rem',color:'var(--bar-muted)',fontWeight:500,flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',letterSpacing:'.01em' }}>Timetable Manager</span>
          <nav className="syed-suite-nav" style={{ display:'flex',alignItems:'center',marginLeft:'auto',gap:2 }}>
            <a href="https://syahmedu.github.io/journaltime/" target="_blank" rel="noopener noreferrer" style={{ fontSize:'.74rem',color:'var(--bar-muted)',textDecoration:'none',padding:'5px 11px',borderRadius:999,whiteSpace:'nowrap',fontWeight:600,letterSpacing:'.01em' }}>JournalTime</a>
            <a href="https://scalescope.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize:'.74rem',color:'var(--bar-muted)',textDecoration:'none',padding:'5px 11px',borderRadius:999,whiteSpace:'nowrap',fontWeight:600,letterSpacing:'.01em' }}>ScaleScope</a>
            <a href="https://syahmedu.github.io/nexus/" target="_blank" rel="noopener noreferrer" style={{ fontSize:'.74rem',fontWeight:700,textDecoration:'none',padding:'5px 13px',borderRadius:999,background:'linear-gradient(135deg,#FF9656 0%,#F14575 55%,#9270F4 100%)',color:'#fff',whiteSpace:'nowrap',letterSpacing:'.01em',boxShadow:'0 6px 16px -6px rgba(241,69,117,.55)' }}>All Projects →</a>
          </nav>
          <ThemeToggle />
        </div>
        <header style={{ background: 'var(--navy)' }} className="shadow-xl print:hidden">
          {/* overflow-x-auto: the row's ~850px min-content must scroll internally
              on phones instead of widening the page (457px overflow at 390px) */}
          <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-6 overflow-x-auto">
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
            <NavLinks />

            {/* Right badge */}
            <div className="ml-auto hidden sm:flex items-center gap-2 shrink-0">
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
