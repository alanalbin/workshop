import { NextRequest, NextResponse } from 'next/server';
import { GET as getById } from '../[id]/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') || req.nextUrl.searchParams.get('q') || '';
  if (!query.trim()) {
    return NextResponse.json(
      { success: false, message: 'Please provide an email, phone number, or registration ID to search.' },
      { status: 400 }
    );
  }

  return getById(req, { params: Promise.resolve({ id: query.trim() }) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || body.q || body.email || body.phone || body.registrationId || '';

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide an email, phone number, or registration ID to search.' },
        { status: 400 }
      );
    }

    return getById(req, { params: Promise.resolve({ id: query.trim() }) });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error processing lookup request' },
      { status: 500 }
    );
  }
}
