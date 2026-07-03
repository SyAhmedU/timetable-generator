// All data lives in localStorage — works anywhere, no server needed
import { SEED_CLASSES, SEED_SUBJECTS, SEED_MENTORS, EMPTY_TIMETABLE, SEED_VERSION } from './seed-data';
import type { Class, Subject, Mentor, Timetable, AbsenceRecord } from './types';

// Auto-migrate: if stored version doesn't match current seed, wipe stale data.
// Runs once at module load time in the browser (before any reads).
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('tt_version');
  if (stored !== SEED_VERSION) {
    localStorage.setItem('tt_subjects',  JSON.stringify(SEED_SUBJECTS));
    localStorage.setItem('tt_mentors',   JSON.stringify(SEED_MENTORS));
    localStorage.setItem('tt_timetable', JSON.stringify(EMPTY_TIMETABLE));
    localStorage.setItem('tt_absence',   JSON.stringify([]));
    localStorage.setItem('tt_version',   SEED_VERSION);
    // Receipt for the migration banner: silent auto-migration is correct
    // behaviour but invisible behaviour — record what happened so the UI can
    // say it once.
    if (stored !== null) {
      localStorage.setItem('tt_migrated', JSON.stringify({
        from: stored, to: SEED_VERSION, at: new Date().toISOString(),
      }));
    }
  }
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Readers ──────────────────────────────────────────────────────────────────
export const getClasses    = (): Class[]         => read('tt_classes',     SEED_CLASSES);
export const getSubjects   = (): Subject[]        => read('tt_subjects',    SEED_SUBJECTS);
export const getMentors    = (): Mentor[]          => read('tt_mentors',     SEED_MENTORS);
export const getTimetable  = (): Timetable         => read('tt_timetable',   EMPTY_TIMETABLE);
export const getPrevTimetable = (): Timetable | null => read<Timetable | null>('tt_timetable_prev', null);
export const getAbsenceLog = (): AbsenceRecord[]   => read('tt_absence',     []);

// ── Writers ──────────────────────────────────────────────────────────────────
export const saveSubjects   = (s: Subject[])    => write('tt_subjects',  s);
export const saveMentors    = (m: Mentor[])      => write('tt_mentors',   m);
export const saveTimetable  = (t: Timetable)     => write('tt_timetable', t);
export const clearTimetable = ()                 => write('tt_timetable', EMPTY_TIMETABLE);
export const backupTimetable = ()                => { const t = getTimetable(); if (t.generated) write('tt_timetable_prev', t); };
export const restorePrevTimetable = ()           => { const p = getPrevTimetable(); if (p) write('tt_timetable', p); };
export const saveAbsenceLog = (l: AbsenceRecord[]) => write('tt_absence', l);

// ── Generation history (last 3, for what-if comparison) ─────────────────────
export const getTimetableHistory = (): Timetable[] => read<Timetable[]>('tt_history', []);
export function pushTimetableHistory(t: Timetable) {
  if (!t.generated) return;
  const hist = [t, ...getTimetableHistory()].slice(0, 3);
  write('tt_history', hist);
}

// ── Migration receipt ─────────────────────────────────────────────────────────
export interface MigrationReceipt { from: string; to: string; at: string }
export const getMigrationReceipt = (): MigrationReceipt | null =>
  read<MigrationReceipt | null>('tt_migrated', null);
export const dismissMigrationReceipt = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('tt_migrated');
};

// ── Subject helpers ───────────────────────────────────────────────────────────
export function addSubject(s: Subject)     { write('tt_subjects', [...getSubjects(), s]); }
export function updateSubject(s: Subject)  { write('tt_subjects', getSubjects().map(x => x.id === s.id ? s : x)); }
export function deleteSubject(id: string)  { write('tt_subjects', getSubjects().filter(s => s.id !== id)); }

// ── Mentor helpers ────────────────────────────────────────────────────────────
export function addMentor(m: Mentor)     { const ms = getMentors(); write('tt_mentors', [...ms, m]); }
export function updateMentor(m: Mentor)  { write('tt_mentors', getMentors().map(x => x.id === m.id ? m : x)); }
export function deleteMentor(id: string) { write('tt_mentors', getMentors().filter(m => m.id !== id)); }

// ── Absence helper ────────────────────────────────────────────────────────────
export function addAbsenceRecords(records: AbsenceRecord[]) {
  saveAbsenceLog([...records, ...getAbsenceLog()]);
}

// ── Factory reset ─────────────────────────────────────────────────────────────
export function resetToDefaults() {
  write('tt_subjects',  SEED_SUBJECTS);
  write('tt_mentors',   SEED_MENTORS);
  write('tt_timetable', EMPTY_TIMETABLE);
  write('tt_absence',   []);
  if (typeof window !== 'undefined') localStorage.setItem('tt_version', SEED_VERSION);
}
