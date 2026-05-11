'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Subject, Mentor, TimetableSlot, DepartmentCode } from '@/lib/types';
import { DAYS, CATEGORY_COLORS, DEPT_LABELS } from '@/lib/types';
import {
  getClasses, getSubjects, getMentors, getTimetable, saveTimetable, clearTimetable,
} from '@/lib/client-store';
import { generateTimetable } from '@/lib/generator';
import { exportTimetableExcel } from '@/lib/client-export';

interface TimetableState {
  generated: boolean;
  generatedAt: string | null;
  slots: TimetableSlot[];
  warnings: string[];
}

const SESSION_INFO = [
  { n: 1, label: '8:30–9:20'   },
  { n: 2, label: '9:20–10:10'  },
  { n: 3, label: '10:20–11:10' },
  { n: 4, label: '11:10–12:00' },
  { n: 5, label: '12:45–1:30'  },
  { n: 6, label: '1:30–2:15'   },
  { n: 7, label: '2:15–3:00'   },
];

export default function TimetablePage() {
  const [classes, setClasses]         = useState<Class[]>([]);
  const [subjects, setSubjects]       = useState<Subject[]>([]);
  const [mentors, setMentors]         = useState<Mentor[]>([]);
  const [timetable, setTimetable]     = useState<TimetableState | null>(null);
  const [selectedClass, setSelected]  = useState('');
  const [generating, setGenerating]   = useState(false);
  const [showMentors, setShowMentors] = useState(true);

  useEffect(() => {
    const cls = getClasses();
    setClasses(cls);
    setSubjects(getSubjects());
    setMentors(getMentors());
    setTimetable(getTimetable());
    if (cls.length) setSelected(cls[0].id);
  }, []);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      const cls = getClasses();
      const sub = getSubjects();
      const men = getMentors();
      const tt  = generateTimetable(cls, sub, men);
      saveTimetable(tt);
      setTimetable(tt);
      setClasses(cls);
      setSubjects(sub);
      setMentors(men);
      if (cls.length && !selectedClass) setSelected(cls[0].id);
      setGenerating(false);
    }, 10);
  };

  const handleClear = () => {
    if (!confirm('Clear the generated timetable?')) return;
    clearTimetable();
    setTimetable({ generated: false, generatedAt: null, slots: [], warnings: [] });
  };

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));
  const mentorMap  = Object.fromEntries(mentors.map(m => [m.id, m]));

  const slot = (day: number, session: number): TimetableSlot | undefined =>
    timetable?.slots.find(s => s.classId === selectedClass && s.day === day && s.session === session);

  const selectedClass_ = classes.find(c => c.id === selectedClass);

  function buildRows() {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < SESSION_INFO.length; i++) {
      const { n, label } = SESSION_INFO[i];

      if (n === 3) rows.push(
        <tr key="break">
          <td colSpan={6}
            style={{ background: 'rgba(251,191,36,0.08)', borderTop: '2px dashed rgba(251,191,36,0.4)', borderBottom: '2px dashed rgba(251,191,36,0.4)' }}
            className="py-1.5 text-center text-amber-600 text-xs font-semibold tracking-widest">
            ─────  ☕  Break  10:10 – 10:20  ─────
          </td>
        </tr>
      );
      if (n === 5) rows.push(
        <tr key="lunch">
          <td colSpan={6}
            style={{ background: 'rgba(16,185,129,0.07)', borderTop: '2px dashed rgba(16,185,129,0.35)', borderBottom: '2px dashed rgba(16,185,129,0.35)' }}
            className="py-1.5 text-center text-emerald-600 text-xs font-semibold tracking-widest">
            ─────  🍽  Lunch  12:00 – 12:45  ─────
          </td>
        </tr>
      );

      rows.push(
        <tr key={n}>
          {/* Session label */}
          <td className="p-2 align-top w-24 border-r border-gray-100">
            <div style={{ color: 'var(--navy)' }} className="font-extrabold text-sm">S{n}</div>
            <div className="text-gray-400 text-[10px] mt-0.5 leading-tight">{label}</div>
          </td>

          {[1, 2, 3, 4, 5].map(day => {
            const s      = slot(day, n);
            const sub    = s ? subjectMap[s.subjectId] : null;
            const mentor = s?.mentorId ? mentorMap[s.mentorId] : null;
            return (
              <td key={day} className="p-1.5 align-top border-r border-b border-gray-100 last:border-r-0">
                {sub ? (
                  <div className={`rounded-xl px-2.5 pt-2.5 pb-2 min-h-[72px] flex flex-col justify-between shadow-sm ${CATEGORY_COLORS[sub.category]}`}>
                    <p className="font-semibold text-[11.5px] leading-snug">{sub.name}</p>
                    <div className="flex items-center justify-between mt-2 gap-1">
                      {showMentors && (
                        mentor
                          ? <span className="text-[10px] font-mono font-bold bg-black/10 px-1.5 py-0.5 rounded-md">{mentor.code}</span>
                          : <span className="text-[10px] font-semibold text-red-500">TBA</span>
                      )}
                      {sub.isLab && (
                        <span className="text-[9px] font-semibold bg-black/10 px-1.5 py-0.5 rounded-full ml-auto">Lab</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[72px] flex items-center justify-center">
                    <span className="text-gray-200 text-lg">·</span>
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      );
    }
    return rows;
  }

  return (
    <div className="space-y-5">
      <style>{`@media print {
        header { display:none !important; }
        body { background:white !important; }
        .no-print { display:none !important; }
        table { page-break-inside: avoid; }
      }`}</style>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap no-print">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--navy)' }}>Timetable</h1>
          <p className="text-xs text-gray-400 mt-0.5">AY 2026-27 · Odd Semester</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          {timetable?.generated && (
            <>
              <button onClick={() => setShowMentors(v => !v)}
                className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                {showMentors ? 'Hide Mentors' : 'Show Mentors'}
              </button>
              <button onClick={() => window.print()}
                className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                🖨 Print
              </button>
              <button onClick={() => exportTimetableExcel(classes, subjects, mentors, timetable, selectedClass)}
                className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition">
                📊 Export Class
              </button>
              <button onClick={() => exportTimetableExcel(classes, subjects, mentors, timetable)}
                className="px-3 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition">
                📊 Export All
              </button>
              <button onClick={handleClear}
                className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition">
                🗑 Clear
              </button>
            </>
          )}
          <button onClick={generate} disabled={generating}
            style={!generating ? { background: 'var(--navy)' } : undefined}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:bg-gray-400 transition">
            {generating ? '⏳ Generating…' : timetable?.generated ? '🔄 Re-generate' : '⚡ Generate Timetable'}
          </button>
        </div>
      </div>

      {/* ── Warnings ─────────────────────────────────────────────────────── */}
      {timetable?.warnings && timetable.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 no-print">
          <p className="font-semibold text-amber-700 mb-1">⚠️ {timetable.warnings.length} warning(s) — re-generate for a different arrangement</p>
          <ul className="text-xs text-amber-700 space-y-0.5 max-h-32 overflow-y-auto">
            {timetable.warnings.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!timetable?.generated && !generating && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <p className="text-6xl mb-5">📅</p>
          <p className="text-xl font-bold text-gray-700">No timetable generated yet</p>
          <p className="text-sm text-gray-400 mt-2">Click <strong>Generate Timetable</strong> above to schedule all 11 classes automatically.</p>
        </div>
      )}

      {/* ── Generated view ───────────────────────────────────────────────── */}
      {timetable?.generated && (
        <>
          {/* Class tabs */}
          <div className="flex gap-1.5 flex-wrap no-print">
            {classes.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                style={selectedClass === c.id ? { background: 'var(--navy)', color: 'white' } : undefined}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  selectedClass === c.id ? '' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {c.shortName}
              </button>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div style={{ background: 'var(--navy)' }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-extrabold text-lg text-white">{selectedClass_?.name}</h2>
                <p className="text-white/50 text-xs mt-0.5">
                  {selectedClass_ ? DEPT_LABELS[selectedClass_.departmentId as DepartmentCode] : ''} · Semester {selectedClass_?.semester} · AY 2026-27 Odd
                </p>
              </div>
              {timetable.generatedAt && (
                <span className="text-white/40 text-xs">
                  Generated {new Date(timetable.generatedAt).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[740px]">
                <thead>
                  <tr>
                    <th style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.5)' }}
                      className="text-left px-3 py-3 text-xs font-semibold tracking-widest w-24 border-r border-white/10">
                      SESSION
                    </th>
                    {DAYS.map(d => (
                      <th key={d}
                        style={{ background: 'var(--navy)', color: 'white' }}
                        className="px-3 py-3 text-sm font-bold text-center border-r border-white/10 last:border-r-0 tracking-wide">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{buildRows()}</tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2 items-center no-print">
              <span className="text-xs text-gray-400 font-semibold mr-1 uppercase tracking-wider">Legend:</span>
              {(Object.entries(CATEGORY_COLORS) as [keyof typeof CATEGORY_COLORS, string][]).map(([cat, cls]) => (
                <span key={cat} className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{cat}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
