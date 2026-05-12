import type { Class, Subject, Mentor, TimetableSlot, Timetable } from './types';

// Subjects that must only occupy session 7 (the last period) each day
const LAST_SESSION_KEYWORDS = ['mentor hour', 'pet', 'library hour', 'library'];

function isLastSessionOnly(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return LAST_SESSION_KEYWORDS.some(kw => lower === kw || lower.includes(kw));
}

interface ClassWithSubjects extends Class {
  subjects: Subject[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTimetable(
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
): Timetable {
  const warnings: string[] = [];
  const allSlots: TimetableSlot[] = [];

  // mentorBusy: mentorId → Set<"day-session">
  const mentorBusy = new Map<string, Set<string>>(
    mentors.map(m => [m.id, new Set()])
  );
  const mentorHours = new Map<string, number>(
    mentors.map(m => [m.id, 0])
  );

  const isBusy = (mid: string, day: number, session: number) =>
    mentorBusy.get(mid)?.has(`${day}-${session}`) ?? true;

  const markBusy = (mid: string, day: number, session: number) => {
    mentorBusy.get(mid)?.add(`${day}-${session}`);
    mentorHours.set(mid, (mentorHours.get(mid) ?? 0) + 1);
  };

  const findMentor = (
    category: string,
    day: number,
    session: number,
    prefer?: string
  ): { id: string | null; reason: string } => {
    if (prefer) {
      const p = mentors.find(m => m.id === prefer);
      if (p && !isBusy(prefer, day, session) &&
          (mentorHours.get(prefer) ?? 0) < p.maxHoursPerWeek) {
        return { id: prefer, reason: '' };
      }
    }
    const catMentors = mentors.filter(m => m.category === category);
    const eligible = catMentors
      .filter(m =>
        !isBusy(m.id, day, session) &&
        (mentorHours.get(m.id) ?? 0) < m.maxHoursPerWeek
      )
      .sort((a, b) => (mentorHours.get(a.id) ?? 0) - (mentorHours.get(b.id) ?? 0));
    if (eligible.length > 0) return { id: eligible[0].id, reason: '' };

    if (catMentors.length === 0) {
      return { id: null, reason: `no ${category} mentors exist on roster` };
    }
    const atCapacity = catMentors.filter(
      m => (mentorHours.get(m.id) ?? 0) >= m.maxHoursPerWeek
    );
    const busyAtSlot = catMentors.filter(m => isBusy(m.id, day, session));
    if (atCapacity.length === catMentors.length) {
      return { id: null, reason: `all ${catMentors.length} ${category} mentor(s) have reached weekly capacity` };
    }
    return { id: null, reason: `all ${busyAtSlot.length}/${catMentors.length} ${category} mentor(s) are booked at this slot` };
  };

  // Group subjects by class
  const subjectsByClass = new Map<string, Subject[]>();
  for (const cls of classes) subjectsByClass.set(cls.id, []);
  for (const sub of subjects) {
    subjectsByClass.get(sub.classId)?.push(sub);
  }

  for (const cls of classes) {
    const clsSubjects = subjectsByClass.get(cls.id) ?? [];
    const totalHours = clsSubjects.reduce((s, sub) => s + sub.hoursPerWeek, 0);
    if (totalHours > 35) {
      warnings.push(`${cls.shortName}: total hours (${totalHours}) exceed 35 slots — some sessions will be dropped`);
    }

    // ── Phase 1: distribute subjects into (day, session) slots ──────────────
    // grid[day 1-5][session 1-7] = subjectId | null
    const grid: (string | null)[][] = Array.from({ length: 6 }, () =>
      Array<string | null>(8).fill(null)
    );

    // Split subjects: those locked to session 7 vs regular
    const lastOnlySubs = clsSubjects.filter(s => isLastSessionOnly(s.name));
    const regularSubs  = clsSubjects.filter(s => !isLastSessionOnly(s.name));

    // Track how many times each subject appears per day (for spreading)
    const subjectDayCount = new Map<string, Map<number, number>>(
      clsSubjects.map(s => [s.id, new Map()])
    );

    // Step A: place NA subjects in session 7 FIRST to reserve their slots
    const lastQueue = shuffle(
      lastOnlySubs.flatMap(sub => Array.from({ length: sub.hoursPerWeek }, () => sub.id))
    );
    for (const subjectId of lastQueue) {
      const sub = lastOnlySubs.find(s => s.id === subjectId)!;
      const dayCount = subjectDayCount.get(subjectId)!;
      const days = [1, 2, 3, 4, 5].sort(
        (a, b) => (dayCount.get(a) ?? 0) - (dayCount.get(b) ?? 0)
      );
      let placed = false;
      for (const day of days) {
        if (!grid[day][7]) {
          grid[day][7] = subjectId;
          dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
          placed = true;
          break;
        }
      }
      if (!placed) {
        warnings.push(`${cls.shortName}: could not place "${sub.name}" in session 7 — all 5 days' session 7 slots are taken`);
      }
    }

    // Step B: place regular subjects in sessions 1–7; session 7 slots already
    // taken by NA subjects are blocked by the grid check automatically.
    const regularQueue = shuffle(
      regularSubs.flatMap(sub => Array.from({ length: sub.hoursPerWeek }, () => sub.id))
    );
    for (const subjectId of regularQueue) {
      const dayCount = subjectDayCount.get(subjectId)!;
      const days = [1, 2, 3, 4, 5].sort(
        (a, b) => (dayCount.get(a) ?? 0) - (dayCount.get(b) ?? 0)
      );
      let placed = false;
      outer: for (const day of days) {
        for (let session = 1; session <= 7; session++) {
          if (!grid[day][session]) {
            grid[day][session] = subjectId;
            dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
            placed = true;
            break outer;
          }
        }
      }
      if (!placed) {
        warnings.push(`${cls.shortName}: could not place all sessions for "${subjectId}" — reduce hours`);
      }
    }

    // ── Phase 2: assign mentors per slot ────────────────────────────────────
    // classSubjectMentor: tracks which mentor was assigned to each subject so far
    // (enables consistency and theory→lab linking)
    const classSubjectMentor = new Map<string, string | null>();

    for (let day = 1; day <= 5; day++) {
      for (let session = 1; session <= 7; session++) {
        const subjectId = grid[day][session];
        if (!subjectId) continue;

        const sub = clsSubjects.find(s => s.id === subjectId);
        if (!sub) continue;

        // Determine preferred mentor:
        // 1. If previously assigned in this class, prefer consistency
        // 2. If lab, prefer theory subject's mentor
        let prefer: string | undefined;
        const prev = classSubjectMentor.get(subjectId);
        if (prev) {
          prefer = prev;
        } else if (sub.isLab && sub.labForSubjectId) {
          const theoryMentor = classSubjectMentor.get(sub.labForSubjectId);
          if (theoryMentor) prefer = theoryMentor;
        }

        // NA-category subjects (PET, Library Hour, Mentor Hour) need no mentor
        if (sub.category === 'NA' || isLastSessionOnly(sub.name)) {
          allSlots.push({ classId: cls.id, subjectId, mentorId: null, day, session });
          continue;
        }

        const { id: mentorId, reason } = findMentor(sub.category, day, session, prefer);

        if (mentorId) {
          markBusy(mentorId, day, session);
          // Only record first assignment for consistency tracking
          if (!classSubjectMentor.has(subjectId)) {
            classSubjectMentor.set(subjectId, mentorId);
          }
        } else {
          if (!classSubjectMentor.has(subjectId)) {
            classSubjectMentor.set(subjectId, null);
          }
          warnings.push(
            `${cls.shortName}: "${sub.name}" (${sub.category}) unassigned at Day ${day} S${session} — ${reason}`
          );
        }

        allSlots.push({ classId: cls.id, subjectId, mentorId, day, session });
      }
    }
  }

  // Detect any remaining double-bookings (should be none, but just in case)
  const slotMap = new Map<string, string[]>();
  for (const slot of allSlots) {
    if (!slot.mentorId) continue;
    const key = `${slot.day}-${slot.session}`;
    if (!slotMap.has(key)) slotMap.set(key, []);
    slotMap.get(key)!.push(slot.mentorId);
  }
  for (const [key, ids] of slotMap) {
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dups.length) {
      const [day, session] = key.split('-');
      const codes = [...new Set(dups)].map(
        id => mentors.find(m => m.id === id)?.code ?? id
      );
      warnings.push(`Double-booking detected at Day ${day} / Session ${session}: ${codes.join(', ')}`);
    }
  }

  return {
    generated: true,
    generatedAt: new Date().toISOString(),
    slots: allSlots,
    warnings,
  };
}
