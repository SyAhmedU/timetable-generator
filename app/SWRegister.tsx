'use client';

import { useEffect } from 'react';

// Registers the PWA service worker so the Timetable Manager is installable + works
// offline. basePath is /timetable-generator, so the worker lives at that absolute
// path (relative paths would break on deep routes like /setup or /timetable).
export default function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/timetable-generator/sw.js').catch(() => {});
  }, []);
  return null;
}
