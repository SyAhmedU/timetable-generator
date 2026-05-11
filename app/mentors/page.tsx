'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Subject, Mentor, TimetableSlot } from '@/lib/types';
import { CATEGORY_COLORS, DAYS } from '@/lib/types';
import { getClasses, getSubjects, getMentors, getTimetable } from '@/lib/client-store';
import { exportMentorSummaryExcel } from '@/lib/client-export';

const SESSION_INFO = [
  { n: 1, label: '8:30–9:20'   },
  { n: 2, label: '9:20–10:10'  },
  { n: 3, label: '10:20–11:10' },
  { n: 4, label: '11:10–12:00' },
  { n: 5, label: '12:45–1:30'  },
  { n: 6, label: '1:30–2:15'   },
  { n: 7, label: '2:15–3:00'   },
];

export default function MentorsPage() {
  const [classes, setClasses]     = useState<Class[]>([]);
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [mentors, setMentors]     = useState<Mentor[]>([]);
  const [slots, setSlots]         = useState<TimetableSlot[]>([]);
  const [tab, setTab]             = useState<'individual' | 'summary'>('summary');
  const [selectedMentor, setSelected] = useState('');

  useEffect(() => {
    const cls = getClasses();
    const sub = getSubjects();
    const men = getMentors();
    const tt  = getTimetable();
    setClasses(cls);
    setSubjects(sub);
    setMentors(men);
    setSlots(tt.slots ?? []);
    if (men.length) setSelected(men[0].id);
  }, []);

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap   = Object.fromEntries(classes.map(c => [c.id, c]));

  const mentorSummary = mentors.map(m => {
    const mySlots    = slots.filter(s => s.mentorId === m.id);
    const totalHours = mySlots.length;
    const classSet   = [...new Set(mySlots.map(s => s.classId))];
    const subjectSet = [...new Set(mySlots.map(s => s.subjectId))];
    return {
      ...m, totalHours,
      classCount:   classSet.length,
      subjectCount: subjectSet.length,
      classNames:   classSet.map(id => classMap[id]?.shortName ?? id),
      subjectNames: subjectSet.map(id => subjectMap[id]?.name ?? id),
    };
  }).sort((a, b) => b.totalHours - a.totalHours);

  const mentorSlot = (day: number, session: number) =>
    slots.find(s => s.mentorId === selectedMentor && s.day === day && s.session === session);

  const selectedMentorObj = mentors.find(m => m.id === selectedMentor);

  const timetable = { generated: slots.length > 0, generatedAt: null, slots, warnings: [] };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Mentors</h1>
        <div className="ml-auto flex gap-2">
          {(['summary', 'individual'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'summary' ? 'All Mentors Summary' : 'Individual Schedule'}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUMMARY TAB ───────────────────────────────────────────────── */}
      {tab === 'summary' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">All Mentor Workload Summary</h2>
          </div>
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Hrs/Wk</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Classes</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Classes Assigned</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subjects</th>
              </tr>
            </thead>
            <tbody>
              {mentorSummary.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="px-5 py-3 font-mono font-semibold text-blue-700">{m.code}</td>
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[m.category]}`}>
                      {m.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${m.totalHours > m.maxHoursPerWeek ? 'text-red-600' : m.totalHours === 0 ? 'text-gray-300' : 'text-gray-800'}`}>
                      {m.totalHours}
                    </span>
                    <span className="text-gray-400 text-xs"> / {m.maxHoursPerWeek}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{m.classCount || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.classNames.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                    {m.subjectNames.slice(0, 3).join(', ')}{m.subjectNames.length > 3 ? ` +${m.subjectNames.length - 3} more` : ''}
                    {m.subjectNames.length === 0 && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t flex gap-3">
            <button onClick={() => exportMentorSummaryExcel(classes, subjects, mentors, timetable)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              📊 Export Summary Excel
            </button>
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL TAB ────────────────────────────────────────────── */}
      {tab === 'individual' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2 shadow-sm">
            {mentors.map(m => (
              <button key={m.id} onClick={() => setSelected(m.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition ${
                  selectedMentor === m.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {m.code}
              </button>
            ))}
          </div>

          {selectedMentorObj && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
              <div className="px-6 py-4 border-b flex items-center gap-4">
                <div>
                  <h2 className="font-bold text-lg">{selectedMentorObj.name} ({selectedMentorObj.code})</h2>
                  <p className="text-xs text-gray-500">
                    {selectedMentorObj.category} · {selectedMentorObj.qualification ?? 'N/A'} ·{' '}
                    {slots.filter(s => s.mentorId === selectedMentor).length} hrs/wk
                    (max {selectedMentorObj.maxHoursPerWeek})
                  </p>
                </div>
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
                <tbody>
                  {(() => {
                    const rows: React.ReactNode[] = [];
                    SESSION_INFO.forEach(({ n, label }, idx) => {
                      if (n === 3) rows.push(
                        <tr key="break" className="bg-orange-50">
                          <td colSpan={6} className="border border-gray-200 px-3 py-1 text-center text-orange-500 text-xs italic">☕ Break  10:10–10:20</td>
                        </tr>
                      );
                      if (n === 5) rows.push(
                        <tr key="lunch" className="bg-green-50">
                          <td colSpan={6} className="border border-gray-200 px-3 py-1 text-center text-green-600 text-xs italic">🍽 Lunch  12:00–12:45</td>
                        </tr>
                      );
                      rows.push(
                        <tr key={n} className={idx % 2 === 0 ? '' : 'bg-gray-50/50'}>
                          <td className="border border-gray-200 px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                            <div>S{n}</div>
                            <div className="text-gray-400 text-[10px]">{label}</div>
                          </td>
                          {[1, 2, 3, 4, 5].map(day => {
                            const s   = mentorSlot(day, n);
                            const sub = s ? subjectMap[s.subjectId] : null;
                            const cls = s ? classMap[s.classId] : null;
                            return (
                              <td key={day} className="border border-gray-200 px-2 py-1.5 align-top min-w-[120px]">
                                {sub && cls ? (
                                  <div className={`rounded px-1.5 py-1 ${CATEGORY_COLORS[sub.category]}`}>
                                    <div className="font-medium leading-tight">{cls.shortName}</div>
                                    <div className="text-[10px] opacity-75 leading-tight">{sub.name}</div>
                                  </div>
                                ) : (
                                  <div className="text-gray-200 text-center py-1">—</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    });
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
