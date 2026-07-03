'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',          label: 'Dashboard' },
  { href: '/setup',     label: 'Setup'     },
  { href: '/timetable', label: 'Timetable' },
  { href: '/mentors',   label: 'Mentors'   },
  { href: '/absence',   label: 'Absence'   },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-0.5 shrink-0">
      {NAV.map(n => {
        const active = n.href === '/' ? pathname === '/' : pathname?.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? 'page' : undefined}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
              active ? 'text-white bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
