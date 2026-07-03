'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClasses, getSubjects, getMentors, getTimetable } from '@/lib/client-store';
import type { Class, Subject, Mentor, Timetable, DepartmentCode } from '@/lib/types';
import { DEPT_LABELS } from '@/lib/types';

// Relative "X minutes/hours/days ago" for the generated timestamp — cheaper
// to scan at a glance than a full localized date string.
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const DEPT_COLORS: Record<DepartmentCode, string> = {
  ACS:  'bg-blue-50  border-blue-300  text-blue-700',
  PCOM: 'bg-orange-50 border-orange-300 text-orange-700',
  PBF:  'bg-emerald-50 border-emerald-300 text-emerald-700',
};

const KPI_ICONS = ['🏛️', '📘', '👤', '📋'];

export default function DashboardPage() {
  const router = useRouter();
  const [classes,   setClasses]   = useState<Class[]>([]);
  const [subjects,  setSubjects]  = useState<Subject[]>([]);
  const [mentors,   setMentors]   = useState<Mentor[]>([]);
  const [timetable, setTimetable] = useState<Timetable>({ generated: false, generatedAt: null, slots: [], warnings: [] });

  useEffect(() => {
    setClasses(getClasses());
    setSubjects(getSubjects());
    setMentors(getMentors());
    setTimetable(getTimetable());
  }, []);

  const deptCounts = useMemo(() => {
    const counts: Partial<Record<DepartmentCode, number>> = {};
    for (const c of classes) counts[c.departmentId] = (counts[c.departmentId] ?? 0) + 1;
    return counts;
  }, [classes]);

  // Mentor workload & double-booking detection — single pass through slots
  const { mentorHours, doubleBookings, overloadedMentors, nearLimitMentors } = useMemo(() => {
    const hours: Record<string, number> = {};
    const bookings: Array<{ mentorId: string; day: number; session: number }> = [];
    if (timetable.generated) {
      const seen: Record<string, string> = {};
      for (const slot of timetable.slots) {
        if (!slot.mentorId) continue;
        hours[slot.mentorId] = (hours[slot.mentorId] ?? 0) + 1;
        const key = `${slot.mentorId}-${slot.day}-${slot.session}`;
        if (seen[key] !== undefined && seen[key] !== slot.classId) {
          if (!bookings.find(d => d.mentorId === slot.mentorId && d.day === slot.day && d.session === slot.session))
            bookings.push({ mentorId: slot.mentorId, day: slot.day, session: slot.session });
        } else {
          seen[key] = slot.classId;
        }
      }
    }
    const overloaded = mentors.filter(m => (hours[m.id] ?? 0) > m.maxHoursPerWeek);
    const nearLimit  = mentors.filter(m => {
      const h = hours[m.id] ?? 0;
      return h > 0 && h <= m.maxHoursPerWeek && h / m.maxHoursPerWeek >= 0.85;
    });
    return { mentorHours: hours, doubleBookings: bookings, overloadedMentors: overloaded, nearLimitMentors: nearLimit };
  }, [timetable, mentors]);

  const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const sortedMentorLoad = useMemo(() =>
    mentors
      .filter(m => (mentorHours[m.id] ?? 0) > 0)
      .sort((a, b) => {
        const ra = (mentorHours[a.id] ?? 0) / a.maxHoursPerWeek;
        const rb = (mentorHours[b.id] ?? 0) / b.maxHoursPerWeek;
        return rb - ra;
      }),
  [mentors, mentorHours]);

  const kpis = [
    { label: 'Classes',          value: classes.length,         sub: '11 total',            href: '/setup'     },
    { label: 'Subjects',         value: subjects.length,        sub: 'across all classes',   href: '/setup'     },
    { label: 'Mentors',          value: mentors.length,         sub: 'on roster',            href: '/mentors'   },
    { label: 'Slots Generated',  value: timetable.slots.length, sub: 'sessions assigned',    href: '/timetable' },
  ];

  const navCards = [
    { href: '/setup',     label: 'Setup',           desc: 'Configure hours per subject, add/edit mentors',  icon: '⚙️',  border: 'border-l-[var(--navy)]'  },
    { href: '/timetable', label: 'Timetable',        desc: 'Generate & view class-wise timetable grid',       icon: '📅',  border: 'border-l-blue-500'         },
    { href: '/mentors',   label: 'Mentors',          desc: 'Individual mentor schedule and full summary',     icon: '👥',  border: 'border-l-purple-500'       },
    { href: '/absence',   label: 'Absence Manager',  desc: 'Mark absences, assign substitutes, view log',     icon: '🔄',  border: 'border-l-orange-500'       },
  ];

  if (classes.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
        <div className="text-4xl mb-3">🏛️</div>
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--navy)' }}>No classes configured yet</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Head to Setup to add classes and subject hours, then come back here to generate the timetable.
        </p>
        <Link href="/setup" style={{ background: 'var(--navy)' }}
          className="inline-block mt-6 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition">
          Go to Setup →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* ── Status Banner ────────────────────────────────────────────────── */}
      <div className={`rounded-2xl p-5 border-2 ${timetable.generated
        ? 'bg-emerald-50 border-emerald-300'
        : 'bg-amber-50 border-amber-300'}`}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${timetable.generated ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            {timetable.generated ? '✅' : '⚠️'}
          </div>
          <div>
            <p className="font-bold text-base text-gray-800">
              {timetable.generated
                ? `Generated ${timeAgo(timetable.generatedAt!)}`
                : 'Timetable not yet generated'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {timetable.generated
                ? `${timetable.slots.length} slots assigned · ${timetable.warnings.length} warning(s) · ${new Date(timetable.generatedAt!).toLocaleString('en-IN')}`
                : 'Go to Setup to configure hours, then generate the timetable'}
            </p>
          </div>
          {!timetable.generated && (
            <Link href="/timetable"
              style={{ background: 'var(--navy)' }}
              className="ml-auto text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
              Generate Now →
            </Link>
          )}
          {timetable.generated && (
            <button
              onClick={() => {
                const lines = [
                  `Timetable status — ${new Date(timetable.generatedAt!).toLocaleString('en-IN')}`,
                  `${classes.length} classes · ${subjects.length} subjects · ${mentors.length} mentors`,
                  `${timetable.slots.length} slots assigned · ${timetable.warnings.length} warning(s)`,
                  overloadedMentors.length ? `${overloadedMentors.length} mentor(s) overloaded: ${overloadedMentors.map(m => m.name).join(', ')}` : 'No mentors overloaded',
                  doubleBookings.length ? `${doubleBookings.length} double-booking(s) detected` : 'No double-bookings',
                ];
                navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
              }}
              className="ml-auto text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition print:hidden"
              title="Copy a plain-text status summary to the clipboard"
            >
              📋 Copy Summary
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Link key={k.label} href={k.href} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all block">
            <div style={{ background: 'var(--navy)' }} className="h-1.5 w-full" />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ color: 'var(--navy)' }} className="text-3xl font-extrabold tabular-nums">{k.value}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{k.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                </div>
                <span className="text-2xl opacity-60 mt-1">{KPI_ICONS[i]}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Departments ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Departments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(deptCounts) as [DepartmentCode, number][]).map(([dept, count]) => (
            <div key={dept} className={`rounded-xl p-4 border-2 ${DEPT_COLORS[dept]}`}>
              <p className="font-bold text-sm">{DEPT_LABELS[dept]}</p>
              <p className="text-3xl font-extrabold mt-3">
                {count} <span className="text-sm font-normal opacity-60">classes</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigation Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {navCards.map(c => (
          <Link key={c.href} href={c.href}
            className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${c.border} p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
            <div className="text-3xl mb-3">{c.icon}</div>
            <p className="font-bold text-gray-800">{c.label}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Warnings ─────────────────────────────────────────────────────── */}
      {timetable.generated && timetable.warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-red-700">⚠️ Generation Warnings ({timetable.warnings.length})</h3>
            <button
              onClick={() => navigator.clipboard?.writeText(timetable.warnings.join('\n')).catch(() => {})}
              className="text-xs font-semibold text-red-600 hover:underline print:hidden"
              title="Copy all warnings to clipboard"
            >
              📋 Copy all
            </button>
          </div>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {timetable.warnings.map((w, i) => (
              <li key={i} className="text-sm text-red-600 flex gap-2">
                <span className="shrink-0 text-red-400">•</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Mentor Workload Analysis ──────────────────────────────────────── */}
      {timetable.generated && mentors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Mentor Workload</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {overloadedMentors.length > 0 && (
                <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  {overloadedMentors.length} overloaded
                </span>
              )}
              {doubleBookings.length > 0 && (
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  {doubleBookings.length} conflict{doubleBookings.length > 1 ? 's' : ''}
                </span>
              )}
              {overloadedMentors.length === 0 && doubleBookings.length === 0 && (
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  All clear
                </span>
              )}
            </div>
          </div>

          {/* Double-booking alerts */}
          {doubleBookings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold text-amber-700 mb-2">🔴 Double-Bookings Detected</p>
              <div className="space-y-1">
                {doubleBookings.map((db, i) => {
                  const m = mentors.find(x => x.id === db.mentorId);
                  return (
                    <button key={i}
                      onClick={() => router.push(`/mentors?id=${db.mentorId}`)}
                      className="block text-left w-full text-xs text-amber-700 hover:underline">
                      <span className="font-semibold">{m?.name ?? db.mentorId}</span> is assigned to 2+ classes on{' '}
                      <span className="font-semibold">{DAYS_SHORT[db.day - 1]}</span> Session {db.session}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Workload bars */}
          <div className="space-y-2.5">
            {sortedMentorLoad.map(m => {
                const hours = mentorHours[m.id] ?? 0;
                const pct   = Math.min(hours / m.maxHoursPerWeek, 1);
                const over  = hours > m.maxHoursPerWeek;
                const near  = !over && pct >= 0.85;
                const barColor = over ? 'bg-red-500' : near ? 'bg-amber-400' : 'bg-emerald-500';
                const textColor = over ? 'text-red-600' : near ? 'text-amber-600' : 'text-gray-500';
                return (
                  <button key={m.id} onClick={() => router.push(`/mentors?id=${m.id}`)}
                    className="block w-full text-left hover:bg-gray-50 rounded-lg px-1 -mx-1 py-0.5 transition">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-700 truncate">{m.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{m.code}</span>
                      </div>
                      <span className={`text-[11px] font-bold tabular-nums shrink-0 ml-3 ${textColor}`}>
                        {hours}/{m.maxHoursPerWeek}h {over ? '⚠' : ''}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
          </div>

          {nearLimitMentors.length > 0 && (
            <p className="text-xs text-amber-600 mt-4">
              {nearLimitMentors.length} mentor{nearLimitMentors.length > 1 ? 's are' : ' is'} within 15% of their weekly limit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
