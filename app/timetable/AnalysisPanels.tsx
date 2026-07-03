'use client';

// Analysis & pre-flight panels for the timetable page. All numbers are
// deterministic recomputations from the generated result — nothing here
// guesses; unknowns say so.
import React, { useMemo, useState } from 'react';
import type { Class, Subject, Mentor, Timetable } from '@/lib/types';
import { DAYS, CATEGORY_COLORS } from '@/lib/types';
import {
  mentorLoads, fairness, fairnessWording, sessionUtilization, subjectSpread,
  preflight, versionStats,
} from '@/lib/analytics';

// ── Pre-flight: catch bad inputs before the solver runs ─────────────────────
export function PreflightPanel({ classes, subjects, mentors }: {
  classes: Class[]; subjects: Subject[]; mentors: Mentor[];
}) {
  const [open, setOpen] = useState(false);
  const pf = useMemo(() => preflight(classes, subjects, mentors), [classes, subjects, mentors]);
  const errors = pf.issues.filter(i => i.level === 'error');
  const warns = pf.issues.filter(i => i.level === 'warn');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm no-print overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition">
        <span className="text-sm font-bold text-gray-700">🩺 Pre-flight checks</span>
        {errors.length > 0 ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{errors.length} blocking</span>
        ) : warns.length > 0 ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{warns.length} to review</span>
        ) : (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ inputs look solvable</span>
        )}
        <span className="ml-auto text-gray-300 text-sm">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {pf.issues.length > 0 && (
            <ul className="space-y-1 text-xs">
              {pf.issues.map((i, idx) => (
                <li key={idx} className={i.level === 'error' ? 'text-red-600' : 'text-amber-600'}>
                  {i.level === 'error' ? '✖' : '⚠'} {i.text}
                </li>
              ))}
            </ul>
          )}
          {/* Slack meters: how tight is this instance, before the solver fails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Category demand vs mentor capacity</p>
              <div className="space-y-1.5">
                {pf.categorySlack.map(c => (
                  <div key={c.category} className="flex items-center gap-2 text-xs">
                    <span className="w-44 truncate text-gray-600">{c.category}</span>
                    <div className="flex-1 h-3 rounded bg-gray-100 overflow-hidden relative">
                      <div className={`h-full rounded ${c.ratio > 1 ? 'bg-red-400' : c.ratio > 0.9 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, c.ratio * 100)}%` }} />
                    </div>
                    <span className="w-24 text-right text-gray-500 tabular-nums">{c.demand}h / {c.capacity || '0'}h</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Class sessions vs 35 weekly slots</p>
              <div className="space-y-1.5">
                {pf.classSlack.slice(0, 8).map(c => (
                  <div key={c.cls.id} className="flex items-center gap-2 text-xs">
                    <span className="w-24 truncate text-gray-600">{c.cls.shortName}</span>
                    <div className="flex-1 h-3 rounded bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded ${c.required > 35 ? 'bg-red-400' : c.required > 32 ? 'bg-amber-400' : 'bg-indigo-300'}`}
                        style={{ width: `${Math.min(100, c.required / 35 * 100)}%` }} />
                    </div>
                    <span className="w-14 text-right text-gray-500 tabular-nums">{c.required}/35</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Post-solve analysis ──────────────────────────────────────────────────────
export function AnalysisPanel({ classes, subjects, mentors, timetable }: {
  classes: Class[]; subjects: Subject[]; mentors: Mentor[]; timetable: Timetable;
}) {
  const [open, setOpen] = useState(false);
  const loads = useMemo(() => mentorLoads(mentors, timetable), [mentors, timetable]);
  const f = useMemo(() => fairness(loads), [loads]);
  const util = useMemo(() => sessionUtilization(classes, timetable), [classes, timetable]);
  const spread = useMemo(() => subjectSpread(classes, subjects, timetable), [classes, subjects, timetable]);
  const bunched = spread.filter(r => r.bunched);
  const maxCap = Math.max(1, ...loads.map(l => l.cap));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm no-print overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition">
        <span className="text-sm font-bold text-gray-700">📊 Analysis</span>
        <span className="text-xs text-gray-400">
          fairness spread {f.spread}h · {fairnessWording(f)}
        </span>
        <span className="ml-auto text-gray-300 text-sm">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-6 border-t border-gray-100 pt-4">

          {/* Mentor load vs cap */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Mentor load vs weekly cap</p>
              <p className="text-[11px] text-gray-400 tabular-nums">
                spread {f.min}–{f.max}h · CV {f.cv === null ? '—' : f.cv.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1.5">
              {loads.map(l => (
                <div key={l.mentor.id} className="flex items-center gap-2 text-xs">
                  <span className="w-14 font-mono font-bold text-gray-600">{l.mentor.code}</span>
                  <div className="flex-1 h-3.5 rounded bg-gray-100 overflow-hidden relative"
                    title={`${l.mentor.name}: ${l.hours}h of ${l.cap}h cap · ${l.idleGaps} idle gap session(s) · on campus ${l.daysOnCampus} day(s)`}>
                    {/* cap marker line */}
                    <div className="h-full rounded"
                      style={{
                        width: `${(l.hours / maxCap) * 100}%`,
                        background: l.pct >= 1 ? '#f87171' : l.pct > 0.9 ? '#fbbf24' : '#818cf8',
                      }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-gray-500/70"
                      style={{ left: `${(l.cap / maxCap) * 100}%` }} />
                  </div>
                  <span className="w-16 text-right text-gray-500 tabular-nums">{l.hours}/{l.cap}h</span>
                  <span className="w-16 text-right tabular-nums" title="Idle gap sessions between first and last class, summed over days"
                    style={{ color: l.idleGaps >= 4 ? '#d97706' : '#9ca3af' }}>
                    {l.idleGaps} idle
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Dark tick = each mentor's cap. Idle = free sessions trapped between classes on the same day — the waste mentors actually feel.</p>
          </div>

          {/* Session utilization */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Session utilisation across all classes</p>
            <div className="flex items-end gap-2 h-20">
              {util.map(u => {
                const pct = u.possible ? u.filled / u.possible : 0;
                return (
                  <div key={u.session} className="flex-1 flex flex-col items-center gap-1"
                    title={`S${u.session}: ${u.filled}/${u.possible} class-days filled (${Math.round(pct * 100)}%)`}>
                    <span className="text-[9px] text-gray-400 tabular-nums">{Math.round(pct * 100)}%</span>
                    <div className="w-full rounded-t bg-indigo-300" style={{ height: `${pct * 52}px`, minHeight: u.filled ? 3 : 0 }} />
                    <span className="text-[9px] text-gray-400">S{u.session}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Systematically empty late sessions are a planning fact worth knowing, not a bug.</p>
          </div>

          {/* Subject spread audit */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Subject spacing {bunched.length > 0 ? `— ${bunched.length} bunched` : '— all spread out ✓'}
            </p>
            {bunched.length > 0 ? (
              <div className="space-y-1">
                {bunched.slice(0, 8).map(r => (
                  <div key={r.subject.id} className="flex items-center gap-2 text-xs">
                    <span className="w-52 truncate text-gray-600">{r.cls?.shortName} · {r.subject.name}</span>
                    <span className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(d => {
                        const n = r.days.filter(x => x === d).length;
                        return (
                          <span key={d} title={`${DAYS[d - 1]}: ${n} session(s)`}
                            className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center ${n ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-300'}`}>
                            {n || '·'}
                          </span>
                        );
                      })}
                    </span>
                    <span className="text-[10px] text-amber-600">bunched — consider spacing</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Multi-hour subjects land on separate days.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Version history compare (last 3 generations) ─────────────────────────────
export function HistoryCompare({ mentors, history, onRestore }: {
  mentors: Mentor[]; history: Timetable[]; onRestore: (t: Timetable) => void;
}) {
  if (history.length < 2) return null;
  const stats = history.map(t => versionStats(mentors, t));
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm no-print p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
        Last {history.length} generations — compare on equity, not just feasibility
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-xl border p-3 ${i === 0 ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}>
            <p className="text-[10px] font-bold text-gray-500 mb-1.5">
              {i === 0 ? 'Current' : `−${i}`} · {s.generatedAt ? new Date(s.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
            <div className="space-y-0.5 text-xs text-gray-600 tabular-nums">
              <p>Conflicts: <b className={s.warnings ? 'text-amber-600' : 'text-emerald-600'}>{s.warnings}</b></p>
              <p>Load spread: <b>{s.fairnessSpread}h</b> · CV {s.fairnessCv === null ? '—' : s.fairnessCv.toFixed(2)}</p>
              <p>Idle gaps: <b>{s.totalIdleGaps}</b></p>
            </div>
            {i > 0 && (
              <button onClick={() => onRestore(history[i])}
                className="mt-2 text-[11px] font-semibold text-indigo-600 hover:underline">↩ Restore this one</button>
            )}
          </div>
        ))}
      </div>
      {/* Load drift across versions — fairness debt accumulating quietly */}
      {stats.length >= 2 && (() => {
        const codes = [...new Set(stats.flatMap(s => s.mentorHours.map(m => m.code)))].sort();
        const drifted = codes.map(code => ({
          code,
          hours: stats.map(s => s.mentorHours.find(m => m.code === code)?.hours ?? 0),
        })).filter(r => Math.max(...r.hours) - Math.min(...r.hours) >= 3);
        if (!drifted.length) return <p className="text-[10px] text-gray-400 mt-3">No mentor's load drifted by 3h+ across these versions.</p>;
        return (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-gray-500 mb-1">Load drift (3h+ between versions):</p>
            <div className="flex flex-wrap gap-2">
              {drifted.map(r => (
                <span key={r.code} className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full tabular-nums">
                  {r.code}: {r.hours.slice().reverse().join(' → ')}h
                </span>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Per-mentor weekly view ────────────────────────────────────────────────────
export function MentorWeekView({ classes, subjects, mentors, timetable, mentorId, onPick }: {
  classes: Class[]; subjects: Subject[]; mentors: Mentor[]; timetable: Timetable;
  mentorId: string; onPick: (id: string) => void;
}) {
  const subMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const clsMap = useMemo(() => new Map(classes.map(c => [c.id, c])), [classes]);
  const assigned = useMemo(() => mentors.filter(m => timetable.slots.some(s => s.mentorId === m.id)), [mentors, timetable]);
  const m = mentors.find(x => x.id === mentorId) ?? assigned[0];
  if (!m) return <p className="text-sm text-gray-400 p-6 text-center">No mentors have assignments.</p>;
  const mine = timetable.slots.filter(s => s.mentorId === m.id);
  const load = mentorLoads([m], timetable)[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div style={{ background: 'var(--navy)' }} className="print-card-header px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-extrabold text-lg text-white">{m.name} <span className="font-mono text-white/60 text-sm">({m.code})</span></h2>
          <p className="text-white/50 text-xs mt-0.5 tabular-nums">
            {mine.length}/{m.maxHoursPerWeek}h this week · {load?.idleGaps ?? 0} idle gap session(s) · on campus {load?.daysOnCampus ?? 0} day(s)
          </p>
        </div>
        <select value={m.id} onChange={e => onPick(e.target.value)}
          className="no-print text-sm rounded-lg px-2 py-1.5 bg-white/10 text-white border border-white/20">
          {assigned.map(x => <option key={x.id} value={x.id} className="text-gray-800">{x.code} — {x.name}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[840px]">
          <thead>
            <tr>
              <th className="day-th text-left px-4 py-2.5 text-xs font-semibold w-28 border-r"
                style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.45)' }}>DAY</th>
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <th key={n} className="session-th px-2 py-2.5 text-center text-sm font-bold border-r border-white/10"
                  style={{ background: 'var(--navy)', color: 'white' }}>S{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(day => {
              const daySlots = mine.filter(s => s.day === day).map(s => s.session);
              const first = Math.min(...daySlots), last = Math.max(...daySlots);
              return (
                <tr key={day} className={day % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}>
                  <td className="day-col px-4 py-2 font-extrabold text-sm border-r border-b border-gray-100" style={{ color: 'var(--navy)' }}>
                    {DAYS[day - 1]}
                  </td>
                  {[1, 2, 3, 4, 5, 6, 7].map(n => {
                    const s = mine.find(x => x.day === day && x.session === n);
                    const isGap = !s && daySlots.length > 0 && n > first && n < last;
                    const sub = s ? subMap.get(s.subjectId) : null;
                    return (
                      <td key={n} className="p-1.5 align-top border-r border-b border-gray-100">
                        {s && sub ? (
                          <div className={`print-cell rounded-lg px-2 py-1.5 min-h-[52px] ${CATEGORY_COLORS[sub.category]}`}>
                            <p className="font-semibold text-[11px] leading-snug">{sub.name}</p>
                            <p className="text-[10px] opacity-70 mt-0.5">{clsMap.get(s.classId)?.shortName}</p>
                          </div>
                        ) : isGap ? (
                          <div className="min-h-[52px] rounded-lg border border-dashed border-amber-300 bg-amber-50/60 flex items-center justify-center"
                            title="Idle gap — free session trapped between classes">
                            <span className="text-[9px] font-semibold text-amber-500">idle</span>
                          </div>
                        ) : (
                          <div className="min-h-[52px] flex items-center justify-center"><span className="text-gray-200">·</span></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── All-classes small multiples ───────────────────────────────────────────────
const CAT_DOT: Record<string, string> = {
  CS: '#3b82f6', DS: '#06b6d4', MATH: '#a855f7', MANAGEMENT: '#22c55e',
  ENGLISH: '#eab308', COMMERCE: '#f97316', NA: '#9ca3af', MTECH: '#6366f1', APTITUDE: '#ec4899',
};
export function AllClassesOverview({ classes, subjects, timetable, onSelect }: {
  classes: Class[]; subjects: Subject[]; timetable: Timetable; onSelect: (id: string) => void;
}) {
  const subMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const withSlots = classes.filter(c => timetable.slots.some(s => s.classId === c.id));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 no-print">
      {withSlots.map(cls => {
        const slots = timetable.slots.filter(s => s.classId === cls.id);
        const unassigned = slots.filter(s => !s.mentorId && subMap.get(s.subjectId)?.category !== 'NA').length;
        return (
          <button key={cls.id} onClick={() => onSelect(cls.id)}
            className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-indigo-300 hover:shadow-sm transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">{cls.shortName}</p>
              {unassigned > 0
                ? <span className="text-[9px] font-bold text-red-500">{unassigned} TBA</span>
                : <span className="text-[9px] font-bold text-emerald-500">✓</span>}
            </div>
            <div className="grid grid-rows-5 gap-0.5">
              {[1, 2, 3, 4, 5].map(day => (
                <div key={day} className="flex gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7].map(n => {
                    const s = slots.find(x => x.day === day && x.session === n);
                    const cat = s ? subMap.get(s.subjectId)?.category : null;
                    return (
                      <span key={n} className="flex-1 h-2 rounded-sm"
                        title={s ? `${DAYS[day - 1]} S${n}: ${subMap.get(s.subjectId)?.name ?? ''}` : ''}
                        style={{ background: cat ? CAT_DOT[cat] : '#f3f4f6', opacity: s && !s.mentorId && cat !== 'NA' ? 0.35 : 1 }} />
                    );
                  })}
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
