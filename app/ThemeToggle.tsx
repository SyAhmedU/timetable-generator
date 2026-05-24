'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const cur = document.documentElement.getAttribute('data-theme');
    setTheme(cur === 'dark' ? 'dark' : 'light');
  }, []);

  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('syed-theme', next); } catch { /* ignore */ }
    setTheme(next);
  };

  return (
    <button
      onClick={flip}
      aria-label="Toggle light/dark theme"
      title="Toggle light/dark"
      className="print:hidden"
      style={{
        width: 34, height: 34, borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        color: 'var(--bar-text)', cursor: 'pointer', fontSize: '1rem',
        flexShrink: 0, marginLeft: 4, fontFamily: 'inherit',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
