import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin password not configured.' }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true, token: adminPassword });
    }

    return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Auth error.' }, { status: 500 });
  }
}
