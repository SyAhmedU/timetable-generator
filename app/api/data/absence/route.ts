import { NextResponse, type NextRequest } from 'next/server';
import { getAbsenceLog, addAbsenceRecord } from '@/lib/store';
import type { AbsenceRecord } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getAbsenceLog());
}

export async function POST(req: NextRequest) {
  const records: Omit<AbsenceRecord, 'id' | 'createdAt'>[] = await req.json();
  const saved: AbsenceRecord[] = records.map(r => ({
    ...r,
    id: `abs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  }));
  saved.forEach(r => addAbsenceRecord(r));
  return NextResponse.json(saved);
}
