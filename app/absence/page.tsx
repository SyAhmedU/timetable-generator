'use client';

import { useState, useEffect } from 'react';
import type { Class, Subject, Mentor, TimetableSlot, AbsenceRecord } from '@/lib/types';
import { DAYS } from '@/lib/types';
import {
  getClasses, getSubjects, getMentors, getTimetable, getAbsenceLog, addAbsenceRecords,
} from '@/lib/client-store';
import { exportAbsenceLogExcel } from '@/lib/client-export';

const SESSION_LABELS: Record<number, string> = {
  1: 'S1 (8:30–9:20)', 2: 'S2 (9:20–10:10)', 3: 'S3 (10:20–11:10)',
  4: 'S4 (11:10–12:00)', 5: 'S5 (12:45–1:30)', 6: 'S6 (1:30–2:15)', 7: 'S7 (2:15–3:00)',
};

export default function AbsencePage() {
  const [classes, setClasses]     = useState<Class[]>([]);
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [mentors, setMentors]     = useState<Mentor[]>([]);
  const [slots, setSlots]         = useState<TimetableSlot[]>([]);
  const [log, setLog]             = useState<AbsenceRecord[]>([]);
  const [tab, setTab]             = useState<'mark' | 'log'>('mark');

  const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [absentMentor, setAbsent] = useState('');

  useEffect(() => {
    const cls = getClasses();
    const men = getMentors();
    setClasses(cls);
    setSubjects(getSubjects());
    setMentors(men);
    setSlots(getTimetable().slots ?? []);
    setLog(getAbsenceLog());
    if (men.length) setAbsent(men[0].id);
  }, []);

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap   = Object.fromEntries(classes.map(c => [c.id, c]));
  const mentorMap  = Object.fromEntries(mentors.map(m => [m.id, m]));

  const dayOfWeek = (iso: string): number => {
    const d  = new Date(iso + 'T00:00:00');
    const js = d.getDay();
    return js === 0 ? 5 : js;
  };

  const absenceDay = dayOfWeek(date);

  const affectedSlots = slots.filter(s =>
    s.mentorId === absentMentor && s.day === absenceDay
  ).sort((a, b) => a.session - b.session);

  const suggestSubs = (slot: TimetableSlot): Mentor[] => {
    const sub = subjectMap[slot.subjectId];
    if (!sub) return [];
    const busyAtSlot = new Set(
      slots.filter(s => s.day === slot.day && s.session === slot.session && s.mentorId)
           .map(s => s.mentorId!)
    );
    busyAtSlot.add(absentMentor);
    const sameCat  = mentors.filter(m => m.category === sub.category && !busyAtSlot.has(m.id));
    const otherFree = mentors.filter(m => m.category !== sub.category && !busyAtSlot.has(m.id) && !sameCat.includes(m));
    return [...sameCat, ...otherFree].slice(0, 5);
  };

  const [subMap, setSubMap] = useState<Record<string, string>>({});
  const slotKey = (s: TimetableSlot) => `${s.classId}-${s.session}`;
  const assignSub = (slot: TimetableSlot, subId: string) =>
    setSubMap(prev => ({ ...prev, [slotKey(slot)]: subId }));

  const saveAbsence = () => {
    const records: AbsenceRecord[] = affectedSlots.map(s => ({
      id: `abs_${Date.now()}_${s.session}`,
      createdAt: new Date().toISOString(),
      date,
      absentMentorId: absentMentor,
      substituteId: subMap[slotKey(s)] ?? null,
      classId: s.classId,
      session: s.session,
      subjectId: s.subjectId,
      notes: '',
    }));
    addAbsenceRecords(records);
    setLog(getAbsenceLog());
    setSubMap({});
    alert('Absence logged successfully!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Absence Manager</h1>
        <div className="ml-auto flex gap-2">
          {(['mark', 'log'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'mark' ? 'Mark Absence' : `Absence Log (${log.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── MARK ABSENCE ──────────────────────────────────────────────── */}
      {tab === 'mark' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-700">Absence Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400" />
              <p className="text-xs text-gray-400 mt-1">Day: {DAYS[absenceDay - 1]}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Absent Mentor</label>
              <select value={absentMentor} onChange={e => setAbsent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400">
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
                ))}
              </select>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{affectedSlots.length}</span> class sessions affected
              </p>
            </div>
            {affectedSlots.length > 0 && (
              <button onClick={saveAbsence}
                className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                💾 Log Absence & Save
              </button>
            )}
          </div>

          <div className="lg:col-span-2 space-y-3">
            {affectedSlots.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 shadow-sm">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">No sessions found for this mentor on {DAYS[absenceDay - 1]}.</p>
                <p className="text-xs mt-1">Either no timetable is generated, or this mentor has a free day.</p>
              </div>
            ) : (
              affectedSlots.map(s => {
                const sub  = subjectMap[s.subjectId];
                const cls  = classMap[s.classId];
                const subs = suggestSubs(s);
                const key  = slotKey(s);
                return (
                  <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">{SESSION_LABELS[s.session]}</p>
                        <p className="text-sm text-gray-600">{cls?.name} · {sub?.name}</p>
                        <span className="text-xs text-gray-400">{sub?.category}</span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-[200px]">
                        <label className="text-xs font-medium text-gray-500">Assign Substitute</label>
                        <select
                          value={subMap[key] ?? ''}
                          onChange={e => assignSub(s, e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">— Leave TBA —</option>
                          {subs.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.code} ({m.category === sub?.category ? '✓ same category' : 'diff. category'})
                            </option>
                          ))}
                        </select>
                        {subs.length === 0 && <p className="text-xs text-red-500">No free mentors found</p>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── ABSENCE LOG ───────────────────────────────────────────────── */}
      {tab === 'log' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Substitution Log</h2>
            <button onClick={() => exportAbsenceLogExcel(classes, subjects, mentors, log)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              📊 Export Log
            </button>
          </div>
          {log.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No absences recorded yet.</div>
          ) : (
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Absent Mentor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Session</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Substitute</th>
                </tr>
              </thead>
              <tbody>
                {log.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="px-5 py-3 text-gray-700">{r.date}</td>
                    <td className="px-4 py-3 font-mono text-blue-700">{mentorMap[r.absentMentorId]?.code ?? r.absentMentorId}</td>
                    <td className="px-4 py-3">{classMap[r.classId]?.shortName ?? r.classId}</td>
                    <td className="px-4 py-3">{SESSION_LABELS[r.session]}</td>
                    <td className="px-4 py-3">{subjectMap[r.subjectId]?.name ?? r.subjectId}</td>
                    <td className="px-4 py-3">
                      {r.substituteId
                        ? <span className="text-green-700 font-mono font-medium">{mentorMap[r.substituteId]?.code}</span>
                        : <span className="text-gray-400">TBA</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
