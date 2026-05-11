'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClasses, getSubjects, getMentors, getTimetable } from '@/lib/client-store';
import type { Class, Subject, Mentor, Timetable, DepartmentCode } from '@/lib/types';
import { DEPT_LABELS } from '@/lib/types';

const DEPT_COLORS: Record<DepartmentCode, string> = {
  ACS:  'bg-blue-50  border-blue-300  text-blue-700',
  PCOM: 'bg-orange-50 border-orange-300 text-orange-700',
  PBF:  'bg-emerald-50 border-emerald-300 text-emerald-700',
};

const KPI_ICONS = ['🏛️', '📘', '👤', '📋'];

export default function DashboardPage() {
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

  const deptCounts: Partial<Record<DepartmentCode, number>> = {};
  for (const c of classes) deptCounts[c.departmentId] = (deptCounts[c.departmentId] ?? 0) + 1;

  const kpis = [
    { label: 'Classes',          value: classes.length,         sub: '11 total'           },
    { label: 'Subjects',         value: subjects.length,        sub: 'across all classes'  },
    { label: 'Mentors',          value: mentors.length,         sub: 'on roster'           },
    { label: 'Slots Generated',  value: timetable.slots.length, sub: 'sessions assigned'   },
  ];

  const navCards = [
    { href: '/setup',     label: 'Setup',           desc: 'Configure hours per subject, add/edit mentors',  icon: '⚙️',  border: 'border-l-[var(--navy)]'  },
    { href: '/timetable', label: 'Timetable',        desc: 'Generate & view class-wise timetable grid',       icon: '📅',  border: 'border-l-blue-500'         },
    { href: '/mentors',   label: 'Mentors',          desc: 'Individual mentor schedule and full summary',     icon: '👥',  border: 'border-l-purple-500'       },
    { href: '/absence',   label: 'Absence Manager',  desc: 'Mark absences, assign substitutes, view log',     icon: '🔄',  border: 'border-l-orange-500'       },
  ];

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
                ? `Timetable generated on ${new Date(timetable.generatedAt!).toLocaleString('en-IN')}`
                : 'Timetable not yet generated'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {timetable.generated
                ? `${timetable.slots.length} slots assigned · ${timetable.warnings.length} warning(s)`
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
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
          </div>
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
          <h3 className="font-bold text-red-700 mb-2">⚠️ Generation Warnings ({timetable.warnings.length})</h3>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {timetable.warnings.map((w, i) => (
              <li key={i} className="text-sm text-red-600 flex gap-2">
                <span className="shrink-0 text-red-400">•</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
