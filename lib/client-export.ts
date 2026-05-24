// Client-side Excel export (runs in browser, triggers download directly)
import * as XLSX from 'xlsx';
import type { Class, Subject, Mentor, MentorCategory, Timetable, AbsenceRecord } from './types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SESSION_LABELS: Record<number, string> = {
  1: '8:30–9:20', 2: '9:20–10:10', 3: '10:20–11:10',
  4: '11:10–12:00', 5: '12:45–1:30', 6: '1:30–2:15', 7: '2:15–3:00',
};

export function exportTimetableExcel(
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
  timetable: Timetable,
  classId?: string,
) {
  const subMap    = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap  = Object.fromEntries(classes.map(c => [c.id, c]));
  const mentorMap = Object.fromEntries(mentors.map(m => [m.id, m]));
  const wb        = XLSX.utils.book_new();
  const targets   = classId ? classes.filter(c => c.id === classId) : classes;

  // Sessions in order with break/lunch separators
  // columns: Day | S1 | S2 | Break | S3 | S4 | Lunch | S5 | S6 | S7
  const SESSION_COLS = [1, 2, null, 3, 4, null, 5, 6, 7] as const; // null = break/lunch

  const cellContent = (cls: Class, day: number, session: number): string => {
    const slot = timetable.slots.find(
      s => s.classId === cls.id && s.day === day && s.session === session
    );
    if (!slot) return '';
    const sub = subMap[slot.subjectId];
    const m   = slot.mentorId ? mentorMap[slot.mentorId] : null;
    return sub ? `${sub.name}${m ? ` [${m.code}]` : ' [TBA]'}` : '';
  };

  for (const cls of targets) {
    // Header row: Day + session timing labels + separator labels
    const header: string[] = ['Day'];
    let breakDone = false;
    for (const col of SESSION_COLS) {
      if (col === null) {
        header.push(breakDone ? 'Lunch 12:00–12:45' : 'Break 10:10–10:20');
        breakDone = true;
      } else {
        header.push(`S${col}\n${SESSION_LABELS[col]}`);
      }
    }

    const rows: string[][] = [header];

    for (let day = 1; day <= 5; day++) {
      const row: string[] = [DAYS[day - 1]];
      for (const col of SESSION_COLS) {
        row.push(col === null ? '' : cellContent(cls, day, col));
      }
      rows.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Day col = 14, session cols = 30, separator cols = 16
    ws['!cols'] = [
      { wch: 14 },  // Day
      { wch: 30 },  // S1
      { wch: 30 },  // S2
      { wch: 16 },  // Break
      { wch: 30 },  // S3
      { wch: 30 },  // S4
      { wch: 16 },  // Lunch
      { wch: 30 },  // S5
      { wch: 30 },  // S6
      { wch: 30 },  // S7
    ];
    XLSX.utils.book_append_sheet(wb, ws, cls.shortName.slice(0, 31));
  }

  XLSX.writeFile(wb, classId ? `${classMap[classId]?.shortName ?? classId}.xlsx` : 'all-timetables.xlsx');
}

export function exportMentorSummaryExcel(
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
  timetable: Timetable,
) {
  const subMap   = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap = Object.fromEntries(classes.map(c => [c.id, c]));
  const rows = mentors.map(m => {
    const mySlots    = timetable.slots.filter(s => s.mentorId === m.id);
    const classSet   = [...new Set(mySlots.map(s => s.classId))];
    const subjectSet = [...new Set(mySlots.map(s => s.subjectId))];
    return {
      Code:            m.code,
      Name:            m.name,
      Category:        m.category,
      Qualification:   m.qualification ?? '',
      Department:      m.departmentId ?? 'Cross-dept',
      'Total Hrs/Wk':  mySlots.length,
      'Max Hrs/Wk':    m.maxHoursPerWeek,
      Classes:         classSet.map(id => classMap[id]?.shortName).join(', '),
      Subjects:        subjectSet.map(id => subMap[id]?.name).join('; '),
    };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Mentor Summary');
  XLSX.writeFile(wb, 'mentor-summary.xlsx');
}

// AMET University submission format: SL No, Campus Name, Department, Subject, Mentor, Hours
export function exportMentorMappingExcel(
  mentors: Mentor[],
  subjects: Subject[],
  timetable: Timetable,
) {
  const subMap = Object.fromEntries(subjects.map(s => [s.id, s]));

  const CAT_ROLE: Record<MentorCategory, string> = {
    CS:         'Computer Science Mentor',
    DS:         'Data Science Mentor',
    MATH:       'Mathematics Mentor',
    MANAGEMENT: 'Management Mentor',
    ENGLISH:    'English Mentor',
    COMMERCE:   'Commerce Mentor',
    NA:         'Mentor',
    MTECH:      'M.Tech Mentor',
    APTITUDE:   'Aptitude Mentor',
  };

  // Count per category to decide if we need " 1", " 2" suffixes
  const catCounts: Partial<Record<MentorCategory, number>> = {};
  for (const m of mentors) catCounts[m.category] = (catCounts[m.category] ?? 0) + 1;
  const catIdx: Partial<Record<MentorCategory, number>> = {};

  const rows = mentors.map((m, i) => {
    const mySlots = timetable.slots.filter(s => s.mentorId === m.id);
    const uniqueSubNames = [...new Set(
      mySlots.map(s => subMap[s.subjectId]?.name).filter((n): n is string => Boolean(n))
    )];
    catIdx[m.category] = (catIdx[m.category] ?? 0) + 1;
    const roleLabel = (catCounts[m.category] ?? 0) > 1
      ? `${CAT_ROLE[m.category]} ${catIdx[m.category]}`
      : CAT_ROLE[m.category];
    return {
      'SL No':       i + 1,
      'Campus Name': 'AMET University',
      'Department':  roleLabel,
      'Subject':     uniqueSubNames.join(', '),
      'Mentor':      m.name,
      'Hours':       mySlots.length,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 28 }, { wch: 55 }, { wch: 22 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Mentor Subject Mapping');
  XLSX.writeFile(wb, 'AMET-mentor-subject-mapping.xlsx');
}

// ── CSV exports ──────────────────────────────────────────────────────────────
function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadCSV(filename: string, rows: (string | number)[][]) {
  const body = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
  // BOM so Excel auto-detects UTF-8 (preserves diacritics in mentor names)
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function exportTimetableCSV(
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
  timetable: Timetable,
  classId?: string,
) {
  const subMap    = Object.fromEntries(subjects.map(s => [s.id, s]));
  const mentorMap = Object.fromEntries(mentors.map(m => [m.id, m]));
  const targets   = classId ? classes.filter(c => c.id === classId) : classes;

  const sessionHeaders = [1, 2, 3, 4, 5, 6, 7].map(n => `S${n} ${SESSION_LABELS[n]}`);
  const rows: (string | number)[][] = [];
  // Long-form: one CSV with a Class column so it stays useful when multiple classes are exported.
  rows.push(['Class', 'Day', ...sessionHeaders]);

  for (const cls of targets) {
    for (let day = 1; day <= 5; day++) {
      const row: (string | number)[] = [cls.shortName, DAYS[day - 1]];
      for (let s = 1; s <= 7; s++) {
        const slot = timetable.slots.find(x => x.classId === cls.id && x.day === day && x.session === s);
        if (!slot) { row.push(''); continue; }
        const sub = subMap[slot.subjectId];
        const m   = slot.mentorId ? mentorMap[slot.mentorId] : null;
        row.push(sub ? `${sub.name}${m ? ` [${m.code}]` : ' [TBA]'}` : '');
      }
      rows.push(row);
    }
  }
  downloadCSV(classId ? `${classes.find(c => c.id === classId)?.shortName ?? classId}.csv` : 'all-timetables.csv', rows);
}

export function exportMentorScheduleCSV(
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
  timetable: Timetable,
) {
  const subMap    = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap  = Object.fromEntries(classes.map(c => [c.id, c]));

  const sessionHeaders: string[] = [];
  for (const day of DAYS) {
    for (let s = 1; s <= 7; s++) sessionHeaders.push(`${day.slice(0, 3)} S${s}`);
  }
  const rows: (string | number)[][] = [];
  rows.push(['Mentor Code', 'Mentor Name', 'Hrs/Wk', ...sessionHeaders]);

  for (const m of mentors) {
    const mySlots = timetable.slots.filter(s => s.mentorId === m.id);
    const row: (string | number)[] = [m.code, m.name, mySlots.length];
    for (let day = 1; day <= 5; day++) {
      for (let s = 1; s <= 7; s++) {
        const slot = mySlots.find(x => x.day === day && x.session === s);
        if (!slot) { row.push(''); continue; }
        const sub = subMap[slot.subjectId];
        const cls = classMap[slot.classId];
        row.push(`${sub?.name ?? '?'} (${cls?.shortName ?? '?'})`);
      }
    }
    rows.push(row);
  }
  downloadCSV('mentor-schedules.csv', rows);
}

export function exportAbsenceLogExcel(
  classes: Class[],
  subjects: Subject[],
  mentors: Mentor[],
  log: AbsenceRecord[],
) {
  const subMap    = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap  = Object.fromEntries(classes.map(c => [c.id, c]));
  const mentorMap = Object.fromEntries(mentors.map(m => [m.id, m]));
  const rows = log.map(r => ({
    Date:            r.date,
    'Absent Mentor': mentorMap[r.absentMentorId]?.code ?? r.absentMentorId,
    Class:           classMap[r.classId]?.shortName ?? r.classId,
    Session:         SESSION_LABELS[r.session],
    Subject:         subMap[r.subjectId]?.name ?? r.subjectId,
    Substitute:      r.substituteId ? (mentorMap[r.substituteId]?.code ?? r.substituteId) : 'TBA',
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Absence Log');
  XLSX.writeFile(wb, 'absence-log.xlsx');
}
