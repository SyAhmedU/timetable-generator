export type MentorCategory =
  | 'CS'        // ACS computer science (B.Sc.)
  | 'MTECH'     // M.Tech qualified (B.Tech)
  | 'MANAGEMENT'
  | 'ENGLISH'
  | 'MATH'
  | 'COMMERCE'
  | 'APTITUDE';

export type DepartmentCode = 'ACS' | 'PCOM' | 'PBF';

export interface Department {
  id: DepartmentCode;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  shortName: string;
  year: number;
  semester: number;
  group: string | null;
  departmentId: DepartmentCode;
  studentCount: number | null;
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  category: MentorCategory;
  hoursPerWeek: number;
  isLab: boolean;
  labForSubjectId: string | null; // theory subject this lab belongs to
}

export interface Mentor {
  id: string;
  code: string;         // e.g. "CS1", "ENG2"
  name: string;
  category: MentorCategory;
  departmentId: DepartmentCode | null;
  maxHoursPerWeek: number;
  qualification: string | null; // "MTech", "MBA", etc.
}

export interface TimetableSlot {
  classId: string;
  subjectId: string;
  mentorId: string | null;
  day: number;     // 1=Mon … 5=Fri
  session: number; // 1–7
}

export interface Timetable {
  generated: boolean;
  generatedAt: string | null;
  slots: TimetableSlot[];
  warnings: string[];
}

export interface AbsenceRecord {
  id: string;
  date: string;             // ISO date "YYYY-MM-DD"
  absentMentorId: string;
  substituteId: string | null;
  classId: string;
  session: number;
  subjectId: string;
  notes: string;
  createdAt: string;
}

export const SESSIONS = [
  { number: 1, start: '8:30',  end: '9:20'  },
  { number: 2, start: '9:20',  end: '10:10' },
  { number: 3, start: '10:20', end: '11:10' },
  { number: 4, start: '11:10', end: '12:00' },
  { number: 5, start: '12:45', end: '1:30'  },
  { number: 6, start: '1:30',  end: '2:15'  },
  { number: 7, start: '2:15',  end: '3:00'  },
] as const;

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DEPT_LABELS: Record<DepartmentCode, string> = {
  ACS:  'Advanced Computing Science',
  PCOM: 'Commerce Department',
  PBF:  'Management Department',
};

export const CATEGORY_COLORS: Record<MentorCategory, string> = {
  CS:         'bg-blue-100 text-blue-800',
  MTECH:      'bg-indigo-100 text-indigo-800',
  MANAGEMENT: 'bg-green-100 text-green-800',
  ENGLISH:    'bg-yellow-100 text-yellow-800',
  MATH:       'bg-purple-100 text-purple-800',
  COMMERCE:   'bg-orange-100 text-orange-800',
  APTITUDE:   'bg-pink-100 text-pink-800',
};
