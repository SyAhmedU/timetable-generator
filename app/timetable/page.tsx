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
  const [classes, setClasses]               = useState<Class[]>([]);
  const [subjects, setSubjects]             = useState<Subject[]>([]);
  const [mentors, setMentors]               = useState<Mentor[]>([]);
  const [timetable, setTimetable]           = useState<TimetableState | null>(null);
  const [selectedClass, setSelected]        = useState('');
  const [generating, setGenerating]         = useState(false);
  const [genAttempts, setGenAttempts]       = useState(0);
  const [showMentors, setShowMentors]       = useState(true);
  const [activeIds, setActiveIds]           = useState<Set<string>>(new Set());
  const [showClassPicker, setShowPicker]    = useState(false);

  useEffect(() => {
    const cls = getClasses();
    setClasses(cls);
    setSubjects(getSubjects());
    setMentors(getMentors());
    setTimetable(getTimetable());
    setActiveIds(new Set(cls.map(c => c.id)));
    if (cls.length) setSelected(cls[0].id);
  }, []);

  const toggleClass = (id: string) =>
    setActiveIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      const cls = getClasses();
      const sub = getSubjects();
      const men = getMentors();
      const filteredCls = cls.filter(c => activeIds.has(c.id));
      const filteredSub = sub.filter(s => activeIds.has(s.classId));

      // Calculate demand per category from selected subjects only
      const demand: Record<string, number> = {};
      for (const s of filteredSub) {
        if (s.category === 'NA') continue;
        demand[s.category] = (demand[s.category] ?? 0) + s.hoursPerWeek;
      }

      // Minimum mentors = ceil(demand / maxHoursPerWeek) per category.
      // Fallback pools (mirrors generator fallback logic):
      //   CS + DS share a combined budget (DS covers both)
      //   MANAGEMENT + COMMERCE share a combined budget (COMMERCE covers both)
      const combinedCsDs   = (demand['CS'] ?? 0) + (demand['DS'] ?? 0);
      const combinedMgmCom = (demand['MANAGEMENT'] ?? 0) + (demand['COMMERCE'] ?? 0);

      const filteredMen = men.filter(m => {
        if (m.category === 'NA') return false;

        if (m.category === 'CS' || m.category === 'DS') {
          const pool = men.filter(x => x.category === 'CS' || x.category === 'DS');
          if (combinedCsDs === 0) return false;
          const needed = Math.min(pool.length, Math.ceil(combinedCsDs / m.maxHoursPerWeek));
          // DS mentors first (handle both CS and DS)
          const sorted = [...pool].sort((a, b) =>
            (a.category === 'DS' ? 0 : 1) - (b.category === 'DS' ? 0 : 1)
          );
          return sorted.indexOf(m) < needed;
        }

        if (m.category === 'MANAGEMENT' || m.category === 'COMMERCE') {
          const pool = men.filter(x => x.category === 'MANAGEMENT' || x.category === 'COMMERCE');
          if (combinedMgmCom === 0) return false;
          const needed = Math.min(pool.length, Math.ceil(combinedMgmCom / m.maxHoursPerWeek));
          // MANAGEMENT mentors first (primary), then COMMERCE
          const sorted = [...pool].sort((a, b) =>
            (a.category === 'MANAGEMENT' ? 0 : 1) - (b.category === 'MANAGEMENT' ? 0 : 1)
          );
          return sorted.indexOf(m) < needed;
        }

        const catDemand = demand[m.category] ?? 0;
        if (catDemand === 0) return false;
        const pool = men.filter(x => x.category === m.category);
        const needed = Math.min(pool.length, Math.ceil(catDemand / m.maxHoursPerWeek));
        return pool.indexOf(m) < needed;
      });

      // Run up to 100 attempts; stop early if 0 warnings found
      const MAX_ATTEMPTS = 100;
      let best = generateTimetable(filteredCls, filteredSub, filteredMen);
      let attempts = 1;
      while (best.warnings.length > 0 && attempts < MAX_ATTEMPTS) {
        const candidate = generateTimetable(filteredCls, filteredSub, filteredMen);
        if (candidate.warnings.length < best.warnings.length) best = candidate;
        attempts++;
        if (best.warnings.length === 0) break;
      }

      saveTimetable(best);
      setTimetable(best);
      setGenAttempts(attempts);
      setClasses(cls);
      setSubjects(sub);
      setMentors(men);
      const firstActive = filteredCls[0];
      if (firstActive) setSelected(firstActive.id);
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

  const renderCell = (day: number, n: number) => {
    const s      = slot(day, n);
    const sub    = s ? subjectMap[s.subjectId] : null;
    const mentor = s?.mentorId ? mentorMap[s.mentorId] : null;
    return (
      <td key={n} className="p-1.5 align-top border-r border-b border-gray-100">
        {sub ? (
          <div className={`print-cell rounded-xl px-2.5 pt-2.5 pb-2 min-h-[72px] flex flex-col justify-between shadow-sm ${CATEGORY_COLORS[sub.category]}`}>
            <div>
              <p className="font-semibold text-[11.5px] leading-snug">{sub.name}</p>
              <span className="cat-label">[{sub.category}]</span>
            </div>
            <div className="flex items-center justify-between mt-2 gap-1">
              {/* Always in DOM so print can show mentor even when toggled off on screen */}
              {mentor ? (
                <span className={`mentor-code text-[10px] font-mono font-bold bg-black/10 px-1.5 py-0.5 rounded-md ${showMentors ? '' : 'print-only'}`}>
                  {mentor.code}
                </span>
              ) : (
                <span className={`text-[10px] font-semibold text-red-500 ${showMentors ? '' : 'print-only'}`}>TBA</span>
              )}
              {sub.isLab && (
                <span className="lab-badge text-[9px] font-semibold bg-black/10 px-1.5 py-0.5 rounded-full ml-auto">Lab</span>
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
  };

  return (
    <div className="space-y-5">
      <style>{`
        /* Screen: hide print-only helpers */
        .cat-label  { display: none; }
        .print-only { display: none; }
        .print-header { display: none; }

        @media print {
          @page { size: A4 landscape; margin: 1.2cm 1.6cm; }

          /* Hide all UI chrome */
          header, nav, .no-print { display: none !important; }
          body { background: white !important; font-family: Arial, Helvetica, sans-serif !important; }

          /* Reveal print-only helpers */
          .print-header { display: block !important; }
          .print-only   { display: inline !important; }
          .cat-label    { display: inline !important; font-size: 7pt; color: #555; margin-left: 1px; }

          /* Print letterhead block */
          .print-header {
            border-bottom: 2pt solid #000;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }

          /* Table overflow fix */
          .overflow-x-auto { overflow: visible !important; }
          table { min-width: 0 !important; width: 100% !important; }
          tr    { page-break-inside: avoid; }

          /* ── Card header ──────────────────────────────── */
          .print-card-header {
            background: white !important;
            border-bottom: 2pt solid #000 !important;
            padding: 8px 14px !important;
          }
          .print-card-header * { color: #000 !important; }

          /* ── Table column headers ─────────────────────── */
          th.day-th {
            background: #111 !important; color: #fff !important;
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          th.session-th {
            background: #111 !important; color: #fff !important;
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          th.break-th {
            background: #ddd !important; color: #000 !important;
            border: 1px solid #bbb !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          th.lunch-th {
            background: #ddd !important; color: #000 !important;
            border: 1px solid #bbb !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }

          /* ── Table body cells ─────────────────────────── */
          tbody tr   { background: white !important; }
          tbody td   { border: 1px solid #ccc !important; }

          td.day-col {
            background: #f0f0f0 !important; color: #000 !important;
            border-right: 2px solid #333 !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          td.break-col, td.lunch-col {
            background: #ebebeb !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }

          /* ── Subject cards ────────────────────────────── */
          .print-cell {
            background: white !important;
            color: #000 !important;
            border: 1.5px solid #444 !important;
            border-radius: 2px !important;
            box-shadow: none !important;
          }
          .print-cell p, .print-cell span { color: #000 !important; }
          .print-cell .mentor-code {
            background: #e0e0e0 !important; color: #000 !important;
            border-radius: 2px !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          .print-cell .lab-badge {
            background: #d0d0d0 !important; color: #000 !important;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        }
      `}</style>

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
          <button
            onClick={() => setShowPicker(v => !v)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
              showClassPicker
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            🏫 Classes&nbsp;
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeIds.size < classes.length ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {activeIds.size}/{classes.length}
            </span>
          </button>
          <button onClick={generate} disabled={generating || activeIds.size === 0}
            style={!generating && activeIds.size > 0 ? { background: 'var(--navy)' } : undefined}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:bg-gray-400 transition">
            {generating ? '⏳ Optimising…' : timetable?.generated ? '🔄 Re-generate' : '⚡ Generate Timetable'}
          </button>
        </div>
      </div>

      {/* ── Class picker panel ───────────────────────────────────────────── */}
      {showClassPicker && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm no-print">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm text-gray-700">Select classes to include in generation</p>
            <div className="flex gap-2">
              <button onClick={() => setActiveIds(new Set(classes.map(c => c.id)))}
                className="text-xs text-indigo-600 hover:underline">Select all</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setActiveIds(new Set())}
                className="text-xs text-gray-400 hover:underline">Clear all</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {classes.map(c => (
              <label key={c.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer select-none transition ${
                  activeIds.has(c.id)
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                <input
                  type="checkbox"
                  checked={activeIds.has(c.id)}
                  onChange={() => toggleClass(c.id)}
                  className="accent-indigo-600"
                />
                {c.shortName}
              </label>
            ))}
          </div>
          {activeIds.size === 0 && (
            <p className="text-xs text-red-500 mt-2">Select at least one class to generate.</p>
          )}
        </div>
      )}

      {/* ── Result banner ────────────────────────────────────────────────── */}
      {timetable?.generated && genAttempts > 0 && (
        timetable.warnings.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2 no-print">
            <span className="text-emerald-600 font-bold">✓ No conflicts</span>
            <span className="text-emerald-500 text-xs">— clean result found in {genAttempts} attempt{genAttempts > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 no-print">
            <p className="font-semibold text-amber-700 mb-1">
              ⚠️ {timetable.warnings.length} conflict{timetable.warnings.length > 1 ? 's' : ''} remaining
              <span className="ml-2 text-xs font-normal text-amber-500">— best of {genAttempts} attempts; try re-generating or add mentors</span>
            </p>
            <ul className="text-xs text-amber-700 space-y-0.5 max-h-32 overflow-y-auto">
              {timetable.warnings.map((w, i) => <li key={i}>• {w}</li>)}
            </ul>
          </div>
        )
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
          {/* Print-only letterhead — hidden on screen */}
          <div className="print-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '18pt', fontWeight: '900', letterSpacing: '-0.3px' }}>AMET University</div>
                <div style={{ fontSize: '10.5pt', marginTop: '3px' }}>
                  {selectedClass_ ? DEPT_LABELS[selectedClass_.departmentId as DepartmentCode] : ''}
                </div>
                <div style={{ fontSize: '10pt', marginTop: '5px', fontWeight: 'bold' }}>
                  {selectedClass_?.name}&nbsp;&nbsp;·&nbsp;&nbsp;Semester {selectedClass_?.semester}&nbsp;&nbsp;·&nbsp;&nbsp;Academic Year 2026-27 (Odd Semester)
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '9pt', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '800', letterSpacing: '1px', fontSize: '10pt' }}>TIMETABLE</div>
                {timetable.generatedAt && (
                  <div style={{ color: '#555', marginTop: '4px' }}>
                    Generated: {new Date(timetable.generatedAt).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Class tabs — only show classes included in this generation */}
          <div className="flex gap-1.5 flex-wrap no-print">
            {classes
              .filter(c => timetable.slots.some(s => s.classId === c.id))
              .map(c => (
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
            <div style={{ background: 'var(--navy)' }} className="print-card-header px-6 py-4 flex items-center justify-between flex-wrap gap-2">
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

            {/* Table — sessions as columns, days as rows */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1020px]">
                <thead>
                  <tr>
                    {/* Day label column */}
                    <th style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.45)' }}
                      className="day-th text-left px-4 py-3 text-xs font-semibold tracking-widest w-28 border-r border-white/10">
                      DAY
                    </th>
                    {/* S1, S2 */}
                    {SESSION_INFO.slice(0, 2).map(({ n, label }) => (
                      <th key={n} style={{ background: 'var(--navy)', color: 'white' }}
                        className="session-th px-2 py-3 text-center border-r border-white/10">
                        <div className="text-sm font-bold">S{n}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
                      </th>
                    ))}
                    {/* Break */}
                    <th style={{ background: 'rgba(251,191,36,0.18)', color: '#92700a' }}
                      className="break-th px-2 py-3 text-center border-r border-amber-300/40 w-16">
                      <div className="text-sm">☕</div>
                      <div className="text-[9px] font-semibold mt-0.5 leading-tight">Break<br/>10:10–10:20</div>
                    </th>
                    {/* S3, S4 */}
                    {SESSION_INFO.slice(2, 4).map(({ n, label }) => (
                      <th key={n} style={{ background: 'var(--navy)', color: 'white' }}
                        className="session-th px-2 py-3 text-center border-r border-white/10">
                        <div className="text-sm font-bold">S{n}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
                      </th>
                    ))}
                    {/* Lunch */}
                    <th style={{ background: 'rgba(16,185,129,0.15)', color: '#065f46' }}
                      className="lunch-th px-2 py-3 text-center border-r border-emerald-300/40 w-16">
                      <div className="text-sm">🍽</div>
                      <div className="text-[9px] font-semibold mt-0.5 leading-tight">Lunch<br/>12:00–12:45</div>
                    </th>
                    {/* S5, S6, S7 */}
                    {SESSION_INFO.slice(4).map(({ n, label }) => (
                      <th key={n} style={{ background: 'var(--navy)', color: 'white' }}
                        className="session-th px-2 py-3 text-center border-r border-white/10 last:border-r-0">
                        <div className="text-sm font-bold">S{n}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(day => (
                    <tr key={day} className={day % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}>
                      {/* Day label */}
                      <td style={{ color: 'var(--navy)' }}
                        className="day-col px-4 py-2 font-extrabold text-sm border-r border-b border-gray-100 whitespace-nowrap align-middle">
                        {DAYS[day - 1]}
                      </td>
                      {/* S1, S2 */}
                      {[1, 2].map(n => renderCell(day, n))}
                      {/* Break spacer */}
                      <td style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.25)' }}
                        className="break-col border-r border-b w-16" />
                      {/* S3, S4 */}
                      {[3, 4].map(n => renderCell(day, n))}
                      {/* Lunch spacer */}
                      <td style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}
                        className="lunch-col border-r border-b w-16" />
                      {/* S5, S6, S7 */}
                      {[5, 6, 7].map(n => renderCell(day, n))}
                    </tr>
                  ))}
                </tbody>
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
