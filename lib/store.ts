import fs from 'fs';
import path from 'path';
import type { Class, Subject, Mentor, Timetable, AbsenceRecord } from './types';
import { SEED_CLASSES, SEED_SUBJECTS, SEED_MENTORS, EMPTY_TIMETABLE } from './seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(filename: string, fallback: T): T {
  ensureDir();
  const file = path.join(DATA_DIR, filename);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

// ── Classes ──────────────────────────────────────────────────────────────────

export function getClasses(): Class[] {
  return readJson<Class[]>('classes.json', SEED_CLASSES);
}

// ── Subjects ─────────────────────────────────────────────────────────────────

export function getSubjects(): Subject[] {
  return readJson<Subject[]>('subjects.json', SEED_SUBJECTS);
}

export function saveSubjects(subjects: Subject[]): void {
  writeJson('subjects.json', subjects);
}

export function updateSubjectHours(subjectId: string, hours: number): void {
  const subjects = getSubjects();
  const idx = subjects.findIndex(s => s.id === subjectId);
  if (idx !== -1) {
    subjects[idx].hoursPerWeek = Math.max(1, Math.min(7, hours));
    writeJson('subjects.json', subjects);
  }
}

// ── Mentors ──────────────────────────────────────────────────────────────────

export function getMentors(): Mentor[] {
  return readJson<Mentor[]>('mentors.json', SEED_MENTORS);
}

export function saveMentors(mentors: Mentor[]): void {
  writeJson('mentors.json', mentors);
}

export function addMentor(mentor: Mentor): void {
  const mentors = getMentors();
  mentors.push(mentor);
  writeJson('mentors.json', mentors);
}

export function updateMentor(mentor: Mentor): void {
  const mentors = getMentors();
  const idx = mentors.findIndex(m => m.id === mentor.id);
  if (idx !== -1) {
    mentors[idx] = mentor;
    writeJson('mentors.json', mentors);
  }
}

export function deleteMentor(mentorId: string): void {
  const mentors = getMentors().filter(m => m.id !== mentorId);
  writeJson('mentors.json', mentors);
}

// ── Timetable ────────────────────────────────────────────────────────────────

export function getTimetable(): Timetable {
  return readJson<Timetable>('timetable.json', EMPTY_TIMETABLE);
}

export function saveTimetable(tt: Timetable): void {
  writeJson('timetable.json', tt);
}

export function clearTimetable(): void {
  writeJson('timetable.json', EMPTY_TIMETABLE);
}

// ── Absence Log ──────────────────────────────────────────────────────────────

export function getAbsenceLog(): AbsenceRecord[] {
  return readJson<AbsenceRecord[]>('absence-log.json', []);
}

export function addAbsenceRecord(record: AbsenceRecord): void {
  const log = getAbsenceLog();
  log.unshift(record);
  writeJson('absence-log.json', log);
}

export function updateAbsenceRecord(id: string, update: Partial<AbsenceRecord>): void {
  const log = getAbsenceLog();
  const idx = log.findIndex(r => r.id === id);
  if (idx !== -1) {
    log[idx] = { ...log[idx], ...update };
    writeJson('absence-log.json', log);
  }
}
