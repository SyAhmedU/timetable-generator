// Pure timetable analytics — everything derives from (classes, subjects,
// mentors, timetable). No storage, no React. Used by the timetable page's
// pre-flight and analysis panels and by the Excel stats sheet.
import type { Class, Subject, Mentor, Timetable, TimetableSlot } from './types';

export interface MentorLoad {
  mentor: Mentor;
  hours: number;
  cap: number;
  pct: number;          // hours / cap
  idleGaps: number;     // total gap sessions between first and last class, per day, summed
  daysOnCampus: number; // days with ≥1 session
}

export interface FairnessStats {
  min: number;
  max: number;
  spread: number;       // max − min
  mean: number;
  cv: number | null;    // coefficient of variation (null if mean 0)
  n: number;            // mentors with ≥1 assigned hour
}

// ── Mentor loads + idle gaps ──────────────────────────────────────────────────
export function mentorLoads(mentors: Mentor[], timetable: Timetable): MentorLoad[] {
  return mentors.map(m => {
    const mine = timetable.slots.filter(s => s.mentorId === m.id);
    let idleGaps = 0;
    let daysOnCampus = 0;
    for (let day = 1; day <= 5; day++) {
      const sessions = mine.filter(s => s.day === day).map(s => s.session).sort((a, b) => a - b);
      if (!sessions.length) continue;
      daysOnCampus++;
      const spanned = sessions[sessions.length - 1] - sessions[0] + 1;
      idleGaps += spanned - sessions.length;
    }
    return {
      mentor: m,
      hours: mine.length,
      cap: m.maxHoursPerWeek,
      pct: m.maxHoursPerWeek > 0 ? mine.length / m.maxHoursPerWeek : 0,
      idleGaps,
      daysOnCampus,
    };
  }).filter(l => l.hours > 0)
    .sort((a, b) => b.hours - a.hours);
}

export function fairness(loads: MentorLoad[]): FairnessStats {
  const hs = loads.map(l => l.hours);
  const n = hs.length;
  if (!n) return { min: 0, max: 0, spread: 0, mean: 0, cv: null, n: 0 };
  const min = Math.min(...hs), max = Math.max(...hs);
  const mean = hs.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(hs.reduce((s, x) => s + (x - mean) ** 2, 0) / n);
  return { min, max, spread: max - min, mean, cv: mean > 0 ? sd / mean : null, n };
}

export function fairnessWording(f: FairnessStats): string {
  if (f.n < 2) return 'not enough assigned mentors to judge balance';
  if (f.cv === null) return '—';
  if (f.cv < 0.15) return 'loads are close to even';
  if (f.cv < 0.3) return 'loads are mostly balanced';
  return 'loads are noticeably uneven — compare with a re-generation';
}

// ── Utilization: classes × sessions occupancy ────────────────────────────────
// occupancy[session 1..7] = share of (class, day) cells filled at that session.
export function sessionUtilization(classes: Class[], timetable: Timetable): { session: number; filled: number; possible: number }[] {
  const withSlots = classes.filter(c => timetable.slots.some(s => s.classId === c.id));
  return [1, 2, 3, 4, 5, 6, 7].map(session => ({
    session,
    filled: timetable.slots.filter(s => s.session === session).length,
    possible: withSlots.length * 5,
  }));
}

// ── Subject spread audit ─────────────────────────────────────────────────────
export interface SpreadRow {
  subject: Subject;
  cls: Class | undefined;
  days: number[];           // which days it lands on (may repeat)
  bunched: boolean;         // consecutive days while others are free
}
export function subjectSpread(classes: Class[], subjects: Subject[], timetable: Timetable): SpreadRow[] {
  const clsMap = new Map(classes.map(c => [c.id, c]));
  return subjects
    .filter(sub => sub.hoursPerWeek >= 2)
    .map(sub => {
      const days = timetable.slots.filter(s => s.subjectId === sub.id).map(s => s.day).sort((a, b) => a - b);
      const distinct = [...new Set(days)];
      // Bunched: ≥2 sessions and all on consecutive days while free days existed
      const consecutive = distinct.length >= 2 &&
        distinct[distinct.length - 1] - distinct[0] === distinct.length - 1 &&
        distinct.length < Math.min(5, days.length + (5 - distinct.length));
      const bunched = days.length >= 2 && (distinct.length === 1 || (consecutive && distinct.length <= Math.ceil(days.length / 2)));
      return { subject: sub, cls: clsMap.get(sub.classId), days, bunched };
    })
    .filter(r => r.days.length > 0);
}

// ── Solve diff ───────────────────────────────────────────────────────────────
// Returns keys "classId|day|session" whose content changed between two runs.
export function diffTimetables(prev: Timetable | null, next: Timetable): Set<string> {
  const changed = new Set<string>();
  if (!prev?.generated) return changed;
  const key = (s: TimetableSlot) => `${s.classId}|${s.day}|${s.session}`;
  const content = (s: TimetableSlot) => `${s.subjectId}|${s.mentorId ?? ''}`;
  const prevMap = new Map(prev.slots.map(s => [key(s), content(s)]));
  const nextMap = new Map(next.slots.map(s => [key(s), content(s)]));
  for (const [k, v] of nextMap) if (prevMap.get(k) !== v) changed.add(k);
  for (const k of prevMap.keys()) if (!nextMap.has(k)) changed.add(k);
  return changed;
}

// ── Pre-solve validation + slack ─────────────────────────────────────────────
export interface PreflightIssue {
  level: 'error' | 'warn';
  text: string;
}
export interface CategorySlack {
  category: string;
  demand: number;    // hours/week needed
  capacity: number;  // Σ maxHoursPerWeek of that category's mentors
  ratio: number;     // demand / capacity (>1 = infeasible)
}
export interface Preflight {
  issues: PreflightIssue[];
  classSlack: { cls: Class; required: number; available: number }[];
  categorySlack: CategorySlack[];
}

export function preflight(classes: Class[], subjects: Subject[], mentors: Mentor[]): Preflight {
  const issues: PreflightIssue[] = [];

  const zeroHour = subjects.filter(s => s.hoursPerWeek <= 0);
  if (zeroHour.length)
    issues.push({ level: 'warn', text: `${zeroHour.length} subject(s) have 0 hours/week and will be skipped: ${zeroHour.slice(0, 4).map(s => s.name).join(', ')}${zeroHour.length > 4 ? '…' : ''}` });

  const noSubjects = classes.filter(c => !subjects.some(s => s.classId === c.id && s.hoursPerWeek > 0));
  for (const c of noSubjects)
    issues.push({ level: 'warn', text: `${c.shortName} has no subjects with hours — it will come out empty` });

  const naMentors = mentors.filter(m => m.category === 'NA');
  if (naMentors.length)
    issues.push({ level: 'warn', text: `${naMentors.length} mentor(s) have no category (NA) and can never be scheduled: ${naMentors.map(m => m.code).join(', ')}` });

  // Per-class: required sessions vs 35 slots
  const classSlack = classes.map(cls => {
    const required = subjects.filter(s => s.classId === cls.id).reduce((sum, s) => sum + s.hoursPerWeek, 0);
    if (required > 35)
      issues.push({ level: 'error', text: `${cls.shortName} needs ${required} sessions but the week has 35 — some sessions WILL be dropped` });
    return { cls, required, available: 35 };
  });

  // Per-category demand vs mentor capacity (MANAGEMENT+COMMERCE pooled, like the solver)
  const demand = new Map<string, number>();
  for (const s of subjects) {
    if (s.category === 'NA' || s.hoursPerWeek <= 0) continue;
    demand.set(s.category, (demand.get(s.category) ?? 0) + s.hoursPerWeek);
  }
  const capacityOf = (cat: string) =>
    mentors.filter(m => m.category === cat).reduce((sum, m) => sum + m.maxHoursPerWeek, 0);

  const categorySlack: CategorySlack[] = [];
  const cats = [...demand.keys()];
  for (const cat of cats) {
    let d = demand.get(cat) ?? 0;
    let cap = capacityOf(cat);
    let label = cat;
    if (cat === 'MANAGEMENT' || cat === 'COMMERCE') {
      if (categorySlack.some(c => c.category === 'MANAGEMENT + COMMERCE')) continue;
      d = (demand.get('MANAGEMENT') ?? 0) + (demand.get('COMMERCE') ?? 0);
      cap = capacityOf('MANAGEMENT') + capacityOf('COMMERCE');
      label = 'MANAGEMENT + COMMERCE';
    }
    const ratio = cap > 0 ? d / cap : Infinity;
    categorySlack.push({ category: label, demand: d, capacity: cap, ratio });
    if (cap === 0)
      issues.push({ level: 'error', text: `${label}: ${d}h/week demanded but no mentors exist for the category` });
    else if (ratio > 1)
      issues.push({ level: 'error', text: `${label}: demand ${d}h exceeds total mentor capacity ${cap}h — unassignable sessions guaranteed` });
    else if (ratio > 0.9)
      issues.push({ level: 'warn', text: `${label}: demand ${d}h is ${Math.round(ratio * 100)}% of capacity ${cap}h — very tight, expect conflicts` });
  }
  categorySlack.sort((a, b) => b.ratio - a.ratio);

  return { issues, classSlack: classSlack.sort((a, b) => b.required - a.required), categorySlack };
}

// ── Per-cell explanation trace ───────────────────────────────────────────────
// Reconstructs (deterministically, from the result) why a cell looks the way
// it does: which rule pinned the subject, where the mentor is at that hour.
export function explainCell(
  slot: TimetableSlot,
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
  timetable: Timetable,
): string[] {
  const notes: string[] = [];
  const sub = subjects.find(s => s.id === slot.subjectId);
  const clsMap = new Map(classes.map(c => [c.id, c]));
  if (!sub) return notes;

  const lower = sub.name.toLowerCase();
  if (['mentor hour', 'pet', 'library'].some(kw => lower.includes(kw)))
    notes.push('Locked to session 7 — last-session-only subject.');
  if (sub.isLab) notes.push('Lab session — prefers the theory subject\'s mentor.');
  if (sub.category === 'NA') notes.push('No mentor needed for this activity.');

  if (slot.mentorId) {
    const m = mentors.find(x => x.id === slot.mentorId);
    if (m) {
      const load = timetable.slots.filter(s => s.mentorId === m.id).length;
      notes.push(`${m.code} teaches ${load}/${m.maxHoursPerWeek}h this week${load >= m.maxHoursPerWeek ? ' (at cap)' : ''}.`);
      const elsewhere = timetable.slots.filter(s =>
        s.mentorId === m.id && s.day === slot.day && s.session !== slot.session);
      if (elsewhere.length) {
        const spots = elsewhere.map(s => `S${s.session} (${clsMap.get(s.classId)?.shortName ?? '?'})`).join(', ');
        notes.push(`Same day, ${m.code} also has: ${spots}.`);
      }
    }
  } else if (sub.category !== 'NA') {
    const pool = mentors.filter(m => m.category === sub.category ||
      (sub.category === 'MANAGEMENT' && m.category === 'COMMERCE'));
    const busyHere = pool.filter(m => timetable.slots.some(s =>
      s.mentorId === m.id && s.day === slot.day && s.session === slot.session));
    notes.push(`Unassigned — ${busyHere.length}/${pool.length} eligible ${sub.category} mentor(s) are booked at this hour; the rest were at weekly cap when this cell was filled.`);
  }
  return notes;
}

// ── Warning → cell mapping (violation heatmap) ───────────────────────────────
// Solver warnings that name "Day X S Y" become cell highlights.
export function warningCells(timetable: Timetable, classes: Class[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const w of timetable.warnings) {
    const m = w.match(/Day (\d) S(\d)/);
    if (!m) continue;
    const cls = classes.find(c => w.startsWith(c.shortName));
    const key = `${cls?.id ?? '*'}|${m[1]}|${m[2]}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(w);
  }
  return map;
}

// ── Version history stats snapshot ───────────────────────────────────────────
export interface VersionStats {
  generatedAt: string | null;
  warnings: number;
  fairnessSpread: number;
  fairnessCv: number | null;
  totalIdleGaps: number;
  mentorHours: { code: string; hours: number }[];
}
export function versionStats(mentors: Mentor[], timetable: Timetable): VersionStats {
  const loads = mentorLoads(mentors, timetable);
  const f = fairness(loads);
  return {
    generatedAt: timetable.generatedAt,
    warnings: timetable.warnings.length,
    fairnessSpread: f.spread,
    fairnessCv: f.cv,
    totalIdleGaps: loads.reduce((s, l) => s + l.idleGaps, 0),
    mentorHours: loads.map(l => ({ code: l.mentor.code, hours: l.hours })),
  };
}
