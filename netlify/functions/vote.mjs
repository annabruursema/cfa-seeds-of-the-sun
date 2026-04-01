import { getStore } from '@netlify/blobs';

const STORE_NAME = 'cfa-votes';
const MAX_VOTES_PER_USER = 3;

function getVoteStore() {
  return getStore({ name: STORE_NAME, consistency: 'strong' });
}

function hashIP(ip) {
  const n = (ip || 'unknown').trim();
  let h = 0;
  for (let i = 0; i < n.length; i++) {
    const c = n.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return 'voter_' + Math.abs(h).toString(36);
}

function getClientIP(req, context) {
  // Netlify provides the client IP via context or headers
  if (context && context.ip) return context.ip;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip') || req.headers.get('x-nf-client-connection-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

async function submitVote(artworkId, clientIP) {
  const store = getVoteStore();
  const voterId = hashIP(clientIP);
  const voterKey = `voter:${voterId}`;
  let rec;
  try {
    const raw = await store.get(voterKey);
    rec = raw ? JSON.parse(raw) : { votes: [], ip: clientIP };
  } catch {
    rec = { votes: [], ip: clientIP };
  }
  if (rec.votes.includes(artworkId)) return { success: false, message: 'You have already voted for this artwork.' };
  if (rec.votes.length >= MAX_VOTES_PER_USER) return { success: false, message: `You have already used all ${MAX_VOTES_PER_USER} votes. Remove a vote to vote for another artwork.` };

  const tallyKey = `tally:${artworkId}`;
  let tally;
  try {
    const raw = await store.get(tallyKey);
    tally = raw ? JSON.parse(raw) : { count: 0 };
  } catch {
    tally = { count: 0 };
  }
  tally.count += 1;
  await store.set(tallyKey, JSON.stringify(tally));

  rec.votes.push(artworkId);
  rec.lastVotedAt = new Date().toISOString();
  await store.set(voterKey, JSON.stringify(rec));
  return { success: true, message: 'Vote recorded!', votesRemaining: MAX_VOTES_PER_USER - rec.votes.length, votes: rec.votes };
}

async function removeVote(artworkId, clientIP) {
  const store = getVoteStore();
  const voterId = hashIP(clientIP);
  const voterKey = `voter:${voterId}`;
  let rec;
  try {
    const raw = await store.get(voterKey);
    rec = raw ? JSON.parse(raw) : null;
  } catch {
    rec = null;
  }
  if (!rec || !rec.votes.includes(artworkId)) return { success: false, message: 'You have not voted for this artwork.' };

  const tallyKey = `tally:${artworkId}`;
  try {
    const raw = await store.get(tallyKey);
    const t = raw ? JSON.parse(raw) : { count: 0 };
    t.count = Math.max(0, t.count - 1);
    await store.set(tallyKey, JSON.stringify(t));
  } catch {}

  rec.votes = rec.votes.filter((id) => id !== artworkId);
  await store.set(voterKey, JSON.stringify(rec));
  return { success: true, message: 'Vote removed.', votesRemaining: MAX_VOTES_PER_USER - rec.votes.length, votes: rec.votes };
}

async function getVoterVotes(clientIP) {
  const store = getVoteStore();
  const voterId = hashIP(clientIP);
  try {
    const raw = await store.get(`voter:${voterId}`);
    const r = raw ? JSON.parse(raw) : { votes: [] };
    return r.votes;
  } catch {
    return [];
  }
}

export default async (req, context) => {
  const h = { 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: h });

  const clientIP = getClientIP(req, context);

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { artworkId, action } = body;
      if (!artworkId) return new Response(JSON.stringify({ success: false, message: 'Missing artworkId.' }), { status: 400, headers: h });
      const result = action === 'remove' ? await removeVote(artworkId, clientIP) : await submitVote(artworkId, clientIP);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 409, headers: h });
    } catch (e) {
      console.error('Vote error:', e);
      return new Response(JSON.stringify({ success: false, message: 'Something went wrong.' }), { status: 500, headers: h });
    }
  }

  if (req.method === 'GET') {
    try {
      const votes = await getVoterVotes(clientIP);
      return new Response(JSON.stringify({ votes }), { headers: h });
    } catch (e) {
      return new Response(JSON.stringify({ votes: [] }), { headers: h });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
};

export const config = { path: '/api/vote' };
