import { NextResponse, type NextRequest } from 'next/server';
import { getMentors, addMentor, updateMentor, deleteMentor } from '@/lib/store';
import type { Mentor } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getMentors());
}

export async function POST(req: NextRequest) {
  const mentor: Mentor = await req.json();
  addMentor(mentor);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const mentor: Mentor = await req.json();
  updateMentor(mentor);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) deleteMentor(id);
  return NextResponse.json({ ok: true });
}
