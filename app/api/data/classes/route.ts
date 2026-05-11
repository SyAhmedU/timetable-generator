import { NextResponse } from 'next/server';
import { getClasses } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getClasses());
}
