import { NextResponse } from 'next/server';
import { getAllTallies, getVoterCount } from '../../../lib/votes';
import { getArtworks } from '../../../lib/artworks';

export async function GET(request) {
  try {
    // Simple admin auth check via query param or header
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('x-admin-token');
    const authParam = searchParams.get('token');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword && authHeader !== adminPassword && authParam !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const artworks = getArtworks();
    const artworkIds = artworks.map((a) => a.id);
    const tallies = await getAllTallies(artworkIds);
    const voterCount = await getVoterCount();

    const results = artworks.map((artwork) => ({
      ...artwork,
      voteCount: tallies[artwork.id] || 0,
    }));

    // Sort by vote count descending
    results.sort((a, b) => b.voteCount - a.voteCount);

    return NextResponse.json({
      results,
      totalVotes: Object.values(tallies).reduce((sum, c) => sum + c, 0),
      totalVoters: voterCount,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json({ error: 'Failed to load results.' }, { status: 500 });
  }
}
