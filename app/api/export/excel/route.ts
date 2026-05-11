import { type NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getClasses, getSubjects, getMentors, getTimetable, getAbsenceLog } from '@/lib/store';
import { DAYS } from '@/lib/types';

const SESSION_LABELS: Record<number, string> = {
  1: '8:30–9:20', 2: '9:20–10:10', 3: '10:20–11:10',
  4: '11:10–12:00', 5: '12:45–1:30', 6: '1:30–2:15', 7: '2:15–3:00',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const view    = searchParams.get('view');  // 'mentors' | 'absence' | null
  const classId = searchParams.get('classId');

  const [classes, subjects, mentors, timetable, absenceLog] = [
    getClasses(), getSubjects(), getMentors(), getTimetable(), getAbsenceLog(),
  ];

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));
  const classMap   = Object.fromEntries(classes.map(c => [c.id, c]));
  const mentorMap  = Object.fromEntries(mentors.map(m => [m.id, m]));

  const wb = XLSX.utils.book_new();

  if (view === 'absence') {
    // ── Absence log sheet ───────────────────────────────────────────────────
    const rows = absenceLog.map(r => ({
      Date:            r.date,
      'Absent Mentor': mentorMap[r.absentMentorId]?.code ?? r.absentMentorId,
      Class:           classMap[r.classId]?.shortName ?? r.classId,
      Session:         SESSION_LABELS[r.session],
      Subject:         subjectMap[r.subjectId]?.name ?? r.subjectId,
      Substitute:      r.substituteId ? (mentorMap[r.substituteId]?.code ?? r.substituteId) : 'TBA',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Absence Log');

  } else if (view === 'mentors') {
    // ── Mentor summary sheet ────────────────────────────────────────────────
    const rows = mentors.map(m => {
      const mySlots     = timetable.slots.filter(s => s.mentorId === m.id);
      const classSet    = [...new Set(mySlots.map(s => s.classId))];
      const subjectSet  = [...new Set(mySlots.map(s => s.subjectId))];
      return {
        Code:           m.code,
        Name:           m.name,
        Category:       m.category,
        Qualification:  m.qualification ?? '',
        Department:     m.departmentId ?? 'Cross-dept',
        'Total Hrs/Wk': mySlots.length,
        'Max Hrs/Wk':   m.maxHoursPerWeek,
        'Classes Count': classSet.length,
        'Classes':      classSet.map(id => classMap[id]?.shortName).join(', '),
        'Subjects':     subjectSet.map(id => subjectMap[id]?.name).join('; '),
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Mentor Summary');

  } else {
    // ── Class timetable sheets ──────────────────────────────────────────────
    const targetClasses = classId
      ? classes.filter(c => c.id === classId)
      : classes;

    for (const cls of targetClasses) {
      const header = ['Session', ...DAYS];
      const rows: (string | undefined)[][] = [header];

      for (let session = 1; session <= 7; session++) {
        if (session === 3) rows.push(['──── Break 10:10–10:20 ────', ...Array(5).fill('')]);
        if (session === 5) rows.push(['──── Lunch 12:00–12:45 ────', ...Array(5).fill('')]);

        const row: string[] = [`S${session} ${SESSION_LABELS[session]}`];
        for (let day = 1; day <= 5; day++) {
          const slot = timetable.slots.find(
            s => s.classId === cls.id && s.day === day && s.session === session
          );
          if (slot) {
            const sub    = subjectMap[slot.subjectId];
            const mentor = slot.mentorId ? mentorMap[slot.mentorId] : null;
            row.push(sub ? `${sub.name}${mentor ? ` [${mentor.code}]` : ' [TBA]'}` : '');
          } else {
            row.push('');
          }
        }
        rows.push(row);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      // Widen columns
      ws['!cols'] = [{ wch: 22 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }];
      const sheetName = cls.shortName.replace(/[\/\[\]:*?]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  }

  const raw  = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const name = view === 'absence' ? 'absence-log.xlsx'
             : view === 'mentors' ? 'mentor-summary.xlsx'
             : classId ? `${classMap[classId]?.shortName ?? classId}.xlsx`
             : 'all-timetables.xlsx';

  return new NextResponse(raw, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  });
}
