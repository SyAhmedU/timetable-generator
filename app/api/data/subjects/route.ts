import { NextResponse, type NextRequest } from 'next/server';
import { getSubjects, saveSubjects, updateSubjectHours } from '@/lib/store';
import type { Subject } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getSubjects());
}

export async function PUT(req: NextRequest) {
  const subjects: Subject[] = await req.json();
  saveSubjects(subjects);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { id, hours }: { id: string; hours: number } = await req.json();
  updateSubjectHours(id, hours);
  return NextResponse.json({ ok: true });
}
