'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Subject, Mentor, TimetableSlot } from '@/lib/types';
import { DAYS, CATEGORY_COLORS } from '@/lib/types';

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
  const [classes, setClasses]       = useState<Class[]>([]);
  const [subjects, setSubjects]     = useState<Subject[]>([]);
  const [mentors, setMentors]       = useState<Mentor[]>([]);
  const [timetable, setTimetable]   = useState<TimetableState | null>(null);
  const [selectedClass, setSelected] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showMentors, setShowMentors] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/data/classes').then(r => r.json()),
      fetch('/api/data/subjects').then(r => r.json()),
      fetch('/api/data/mentors').then(r => r.json()),
      fetch('/api/data/timetable').then(r => r.json()),
    ]).then(([cls, sub, men, tt]) => {
      setClasses(cls);
      setSubjects(sub);
      setMentors(men);
      setTimetable(tt);
      if (cls.length) setSelected(cls[0].id);
    });
  }, []);

  const generate = async () => {
    setGenerating(true);
    const res = await fetch('/api/timetable/generate', { method: 'POST' });
    const tt  = await res.json();
    setTimetable(tt);
    setGenerating(false);
  };

  const clearTT = async () => {
    if (!confirm('Clear the generated timetable?')) return;
    await fetch('/api/timetable/generate', { method: 'DELETE' });
    setTimetable({ generated: false, generatedAt: null, slots: [], warnings: [] });
  };

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));
  const mentorMap  = Object.fromEntries(mentors.map(m => [m.id, m]));

  const slot = (day: number, session: number): TimetableSlot | undefined =>
    timetable?.slots.find(s => s.classId === selectedClass && s.day === day && s.session === session);

  // Build timetable rows with break/lunch rows inserted
  function buildRows() {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < SESSION_INFO.length; i++) {
      const { n, label } = SESSION_INFO[i];
      if (n === 3) {
        rows.push(
          <tr key="break" className="bg-orange-50">
            <td colSpan={6} className="border border-gray-200 px-3 py-1 text-center text-orange-600 text-xs italic font-medium">
              ☕ Break  10:10–10:20
            </td>
          </tr>
        );
      }
      if (n === 5) {
        rows.push(
          <tr key="lunch" className="bg-green-50">
            <td colSpan={6} className="border border-gray-200 px-3 py-1 text-center text-green-700 text-xs italic font-medium">
              🍽 Lunch  12:00–12:45
            </td>
          </tr>
        );
      }
      rows.push(
        <tr key={n} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
          <td className="border border-gray-200 px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
            <div>S{n}</div>
            <div className="text-gray-400 text-[10px]">{label}</div>
          </td>
          {[1, 2, 3, 4, 5].map(day => {
            const s      = slot(day, n);
            const sub    = s ? subjectMap[s.subjectId] : null;
            const mentor = s?.mentorId ? mentorMap[s.mentorId] : null;
            return (
              <td key={day} className="border border-gray-200 px-2 py-1.5 align-top min-w-[120px]">
                {sub ? (
                  <div className={`rounded px-1.5 py-1 ${CATEGORY_COLORS[sub.category]}`}>
                    <div className="font-medium leading-tight text-[11px]">{sub.name}</div>
                    {showMentors && mentor && (
                      <div className="mt-0.5 font-mono text-[10px] opacity-70">{mentor.code}</div>
                    )}
                    {showMentors && !mentor && s && (
                      <div className="mt-0.5 text-[10px] text-red-500 font-medium">TBA</div>
                    )}
                    {sub.isLab && <span className="text-[9px] opacity-60 ml-1">Lab</span>}
                  </div>
                ) : (
                  <div className="text-gray-300 text-center py-1 text-xs">—</div>
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
    <div className="space-y-4">
      <style>{`@media print { header { display:none !important; } body { background:white !important; } }`}</style>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Timetable</h1>
        <div className="ml-auto flex gap-2 flex-wrap">
          {timetable?.generated && (
            <>
              <button onClick={() => setShowMentors(v => !v)}
                className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-gray-50 transition">
                {showMentors ? 'Hide Mentors' : 'Show Mentors'}
              </button>
              <button onClick={() => window.print()}
                className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 hover:bg-gray-50 transition">
                🖨 Print
              </button>
              <button onClick={() => { window.location.href = `/api/export/excel?classId=${selectedClass}`; }}
                className="px-3 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 transition">
                📊 Export Class
              </button>
              <button onClick={() => { window.location.href = '/api/export/excel'; }}
                className="px-3 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 transition">
                📊 Export All
              </button>
              <button onClick={clearTT}
                className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition">
                🗑 Clear
              </button>
            </>
          )}
          <button onClick={generate} disabled={generating}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition">
            {generating ? '⏳ Generating…' : timetable?.generated ? '🔄 Re-generate' : '⚡ Generate Timetable'}
          </button>
        </div>
      </div>

      {timetable?.warnings && timetable.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="font-medium text-amber-700 mb-1">⚠️ {timetable.warnings.length} warning(s) — re-generate for a different arrangement</p>
          <ul className="text-xs text-amber-700 space-y-0.5 max-h-32 overflow-y-auto">
            {timetable.warnings.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </div>
      )}

      {!timetable?.generated && !generating && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 shadow-sm">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-lg font-medium text-gray-600">No timetable generated yet</p>
          <p className="text-sm mt-1">Click Generate Timetable above to schedule all 11 classes.</p>
        </div>
      )}

      {timetable?.generated && (
        <>
          {/* Class selector */}
          <div className="flex gap-2 flex-wrap">
            {classes.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedClass === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {c.shortName}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
            <div className="px-6 py-4 border-b">
              <h2 className="font-bold text-lg">{classes.find(c => c.id === selectedClass)?.name}</h2>
              <p className="text-xs text-gray-400">AY 2026-27 · Odd Semester</p>
            </div>
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 w-28">Session</th>
                  {DAYS.map(d => (
                    <th key={d} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{buildRows()}</tbody>
            </table>
            <div className="px-6 py-3 border-t flex flex-wrap gap-2">
              {(Object.entries(CATEGORY_COLORS) as [keyof typeof CATEGORY_COLORS, string][]).map(([cat, cls]) => (
                <span key={cat} className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>{cat}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
