import { NextResponse } from 'next/server';
import { submitVote, removeVote, getVoterVotes } from '../../../lib/votes';
import { getArtworkById } from '../../../lib/artworks';

export async function POST(request) {
  try {
    const body = await request.json();
    const { artworkId, email, action } = body;

    if (!artworkId || !email) {
      return NextResponse.json({ success: false, message: 'Missing artworkId or email.' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Validate artwork exists
    const artwork = getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ success: false, message: 'Artwork not found.' }, { status: 404 });
    }

    let result;
    if (action === 'remove') {
      result = await removeVote(artworkId, email);
    } else {
      result = await submitVote(artworkId, email);
    }

    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ votes: [] });
    }

    const votes = await getVoterVotes(email);
    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json({ votes: [] });
  }
}
