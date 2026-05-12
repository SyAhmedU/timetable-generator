'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Subject, Mentor, TimetableSlot } from '@/lib/types';
import { CATEGORY_COLORS, DAYS } from '@/lib/types';
import { getClasses, getSubjects, getMentors, getTimetable } from '@/lib/client-store';
import { exportMentorSummaryExcel, exportMentorMappingExcel } from '@/lib/client-export';

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

  const hasGenerated = slots.length > 0;

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

  // When a timetable is generated, only mentors with ≥1 assigned hour are "required"
  const activeSummary  = hasGenerated ? mentorSummary.filter(m => m.totalHours > 0) : mentorSummary;
  const activeMentors  = hasGenerated ? mentors.filter(m => mentorSummary.find(ms => ms.id === m.id && ms.totalHours > 0)) : mentors;

  const mentorSlot = (day: number, session: number) =>
    slots.find(s => s.mentorId === selectedMentor && s.day === day && s.session === session);

  const selectedMentorObj = mentors.find(m => m.id === selectedMentor);

  const timetable = { generated: slots.length > 0, generatedAt: null, slots, warnings: [] };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--navy)' }}>Mentors</h1>
          <p className="text-xs text-gray-400 mt-0.5">AY 2026-27 · Odd Semester</p>
        </div>
        <div className="ml-auto flex gap-2">
          {(['summary', 'individual'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={tab === t ? { background: 'var(--navy)' } : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'summary' ? 'All Mentors Summary' : 'Individual Schedule'}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUMMARY TAB ───────────────────────────────────────────────── */}
      {tab === 'summary' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <div className="px-6 py-4 border-b flex items-center gap-4 flex-wrap">
            <h2 className="font-semibold">All Mentor Workload Summary</h2>
            {hasGenerated && (
              <span className="ml-auto text-sm text-gray-500">
                <span className="font-bold text-gray-900 text-base">{activeSummary.length}</span>
                <span className="text-gray-400"> / {mentors.length} mentors required</span>
              </span>
            )}
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
              {activeSummary.map((m, i) => (
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
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.subjectNames.join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t flex gap-3 flex-wrap">
            <button onClick={() => exportMentorSummaryExcel(classes, subjects, mentors, timetable)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              📊 Export Summary Excel
            </button>
            <button onClick={() => exportMentorMappingExcel(mentors, subjects, timetable)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              📋 Export Mentor–Subject Mapping
            </button>
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL TAB ────────────────────────────────────────────── */}
      {tab === 'individual' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2 shadow-sm">
            {activeMentors.map(m => (
              <button key={m.id} onClick={() => setSelected(m.id)}
                style={selectedMentor === m.id ? { background: 'var(--navy)', color: 'white' } : undefined}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold transition ${
                  selectedMentor === m.id ? '' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {m.code}
              </button>
            ))}
            {hasGenerated && activeMentors.length < mentors.length && (
              <span className="self-center text-xs text-gray-400 ml-1">
                {mentors.length - activeMentors.length} mentor(s) not required for this selection
              </span>
            )}
          </div>

          {selectedMentorObj && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card header */}
              <div style={{ background: 'var(--navy)' }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-extrabold text-lg text-white">
                    {selectedMentorObj.name}
                    <span className="ml-2 text-white/50 text-sm font-mono">({selectedMentorObj.code})</span>
                  </h2>
                  <p className="text-white/50 text-xs mt-0.5">
                    {selectedMentorObj.category} · {selectedMentorObj.qualification ?? 'N/A'} ·{' '}
                    {slots.filter(s => s.mentorId === selectedMentor).length} hrs/wk
                    (max {selectedMentorObj.maxHoursPerWeek})
                  </p>
                </div>
              </div>

              {/* Table — sessions as columns, days as rows */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1020px]">
                  <thead>
                    <tr>
                      <th style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.45)' }}
                        className="text-left px-4 py-3 text-xs font-semibold tracking-widest w-28 border-r border-white/10">
                        DAY
                      </th>
                      {SESSION_INFO.slice(0, 2).map(({ n, label }) => (
                        <th key={n} style={{ background: 'var(--navy)', color: 'white' }}
                          className="px-2 py-3 text-center border-r border-white/10">
                          <div className="text-sm font-bold">S{n}</div>
                          <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
                        </th>
                      ))}
                      <th style={{ background: 'rgba(251,191,36,0.18)', color: '#92700a' }}
                        className="px-2 py-3 text-center border-r border-amber-300/40 w-16">
                        <div className="text-sm">☕</div>
                        <div className="text-[9px] font-semibold mt-0.5 leading-tight">Break<br/>10:10–10:20</div>
                      </th>
                      {SESSION_INFO.slice(2, 4).map(({ n, label }) => (
                        <th key={n} style={{ background: 'var(--navy)', color: 'white' }}
                          className="px-2 py-3 text-center border-r border-white/10">
                          <div className="text-sm font-bold">S{n}</div>
                          <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
                        </th>
                      ))}
                      <th style={{ background: 'rgba(16,185,129,0.15)', color: '#065f46' }}
                        className="px-2 py-3 text-center border-r border-emerald-300/40 w-16">
                        <div className="text-sm">🍽</div>
                        <div className="text-[9px] font-semibold mt-0.5 leading-tight">Lunch<br/>12:00–12:45</div>
                      </th>
                      {SESSION_INFO.slice(4).map(({ n, label }) => (
                        <th key={n} style={{ background: 'var(--navy)', color: 'white' }}
                          className="px-2 py-3 text-center border-r border-white/10 last:border-r-0">
                          <div className="text-sm font-bold">S{n}</div>
                          <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(day => (
                      <tr key={day} className={day % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}>
                        <td style={{ color: 'var(--navy)' }}
                          className="px-4 py-2 font-extrabold text-sm border-r border-b border-gray-100 whitespace-nowrap align-middle">
                          {DAYS[day - 1]}
                        </td>
                        {/* S1, S2 */}
                        {[1, 2].map(n => {
                          const s   = mentorSlot(day, n);
                          const sub = s ? subjectMap[s.subjectId] : null;
                          const cls = s ? classMap[s.classId]   : null;
                          return (
                            <td key={n} className="p-1.5 align-top border-r border-b border-gray-100">
                              {sub && cls ? (
                                <div className={`rounded-xl px-2.5 pt-2 pb-1.5 min-h-[72px] flex flex-col justify-between shadow-sm ${CATEGORY_COLORS[sub.category]}`}>
                                  <p className="font-semibold text-[11px] leading-snug">{sub.name}</p>
                                  <span className="text-[10px] font-bold opacity-70 mt-1">{cls.shortName}</span>
                                </div>
                              ) : (
                                <div className="min-h-[72px] flex items-center justify-center">
                                  <span className="text-gray-200 text-lg">·</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        {/* Break spacer */}
                        <td style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.25)' }}
                          className="border-r border-b w-16" />
                        {/* S3, S4 */}
                        {[3, 4].map(n => {
                          const s   = mentorSlot(day, n);
                          const sub = s ? subjectMap[s.subjectId] : null;
                          const cls = s ? classMap[s.classId]   : null;
                          return (
                            <td key={n} className="p-1.5 align-top border-r border-b border-gray-100">
                              {sub && cls ? (
                                <div className={`rounded-xl px-2.5 pt-2 pb-1.5 min-h-[72px] flex flex-col justify-between shadow-sm ${CATEGORY_COLORS[sub.category]}`}>
                                  <p className="font-semibold text-[11px] leading-snug">{sub.name}</p>
                                  <span className="text-[10px] font-bold opacity-70 mt-1">{cls.shortName}</span>
                                </div>
                              ) : (
                                <div className="min-h-[72px] flex items-center justify-center">
                                  <span className="text-gray-200 text-lg">·</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        {/* Lunch spacer */}
                        <td style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}
                          className="border-r border-b w-16" />
                        {/* S5, S6, S7 */}
                        {[5, 6, 7].map(n => {
                          const s   = mentorSlot(day, n);
                          const sub = s ? subjectMap[s.subjectId] : null;
                          const cls = s ? classMap[s.classId]   : null;
                          return (
                            <td key={n} className="p-1.5 align-top border-r border-b border-gray-100 last:border-r-0">
                              {sub && cls ? (
                                <div className={`rounded-xl px-2.5 pt-2 pb-1.5 min-h-[72px] flex flex-col justify-between shadow-sm ${CATEGORY_COLORS[sub.category]}`}>
                                  <p className="font-semibold text-[11px] leading-snug">{sub.name}</p>
                                  <span className="text-[10px] font-bold opacity-70 mt-1">{cls.shortName}</span>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
