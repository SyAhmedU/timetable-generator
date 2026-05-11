import { NextResponse } from 'next/server';
import { getClasses, getSubjects, getMentors, saveTimetable, clearTimetable } from '@/lib/store';
import { generateTimetable } from '@/lib/generator';

export async function POST() {
  const classes  = getClasses();
  const subjects = getSubjects();
  const mentors  = getMentors();

  const timetable = generateTimetable(classes, subjects, mentors);
  saveTimetable(timetable);
  return NextResponse.json(timetable);
}

export async function DELETE() {
  clearTimetable();
  return NextResponse.json({ ok: true });
}
