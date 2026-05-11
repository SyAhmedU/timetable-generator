import { NextResponse } from 'next/server';
import { getTimetable } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getTimetable());
}
