// All data lives in localStorage — works anywhere, no server needed
import { SEED_CLASSES, SEED_SUBJECTS, SEED_MENTORS, EMPTY_TIMETABLE } from './seed-data';
import type { Class, Subject, Mentor, Timetable, AbsenceRecord } from './types';

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
export const getAbsenceLog = (): AbsenceRecord[]   => read('tt_absence',     []);

// ── Writers ──────────────────────────────────────────────────────────────────
export const saveSubjects   = (s: Subject[])    => write('tt_subjects',  s);
export const saveMentors    = (m: Mentor[])      => write('tt_mentors',   m);
export const saveTimetable  = (t: Timetable)     => write('tt_timetable', t);
export const clearTimetable = ()                 => write('tt_timetable', EMPTY_TIMETABLE);
export const saveAbsenceLog = (l: AbsenceRecord[]) => write('tt_absence', l);

// ── Mentor helpers ────────────────────────────────────────────────────────────
export function addMentor(m: Mentor)     { const ms = getMentors(); write('tt_mentors', [...ms, m]); }
export function updateMentor(m: Mentor)  { write('tt_mentors', getMentors().map(x => x.id === m.id ? m : x)); }
export function deleteMentor(id: string) { write('tt_mentors', getMentors().filter(m => m.id !== id)); }

// ── Absence helper ────────────────────────────────────────────────────────────
export function addAbsenceRecords(records: AbsenceRecord[]) {
  saveAbsenceLog([...records, ...getAbsenceLog()]);
}
