import { getStore } from '@netlify/blobs';

const STORE_NAME = 'cfa-votes';
const MAX_VOTES_PER_USER = 3;

function getVoteStore() {
  return getStore({ name: STORE_NAME, consistency: 'strong' });
}

/**
 * Hash an email to create a voter ID (simple hash, not cryptographic).
 */
function hashEmail(email) {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'voter_' + Math.abs(hash).toString(36);
}

/**
 * Submit a vote. Returns { success, message } or throws.
 */
export async function submitVote(artworkId, email) {
  const store = getVoteStore();
  const voterId = hashEmail(email);

  // Get existing voter record
  const voterKey = `voter:${voterId}`;
  let voterRecord;
  try {
    const raw = await store.get(voterKey);
    voterRecord = raw ? JSON.parse(raw) : { votes: [], email: email.trim().toLowerCase() };
  } catch {
    voterRecord = { votes: [], email: email.trim().toLowerCase() };
  }

  // Check if already voted for this artwork
  if (voterRecord.votes.includes(artworkId)) {
    return { success: false, message: 'You have already voted for this artwork.' };
  }

  // Check max votes
  if (voterRecord.votes.length >= MAX_VOTES_PER_USER) {
    return {
      success: false,
      message: `You have already used all ${MAX_VOTES_PER_USER} votes. Remove a vote to vote for another artwork.`,
    };
  }

  // Increment tally for artwork
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

  // Update voter record
  voterRecord.votes.push(artworkId);
  voterRecord.lastVotedAt = new Date().toISOString();
  await store.set(voterKey, JSON.stringify(voterRecord));

  return { success: true, message: 'Vote recorded!', votesRemaining: MAX_VOTES_PER_USER - voterRecord.votes.length };
}

/**
 * Remove a vote. Returns { success, message }.
 */
export async function removeVote(artworkId, email) {
  const store = getVoteStore();
  const voterId = hashEmail(email);

  const voterKey = `voter:${voterId}`;
  let voterRecord;
  try {
    const raw = await store.get(voterKey);
    voterRecord = raw ? JSON.parse(raw) : null;
  } catch {
    voterRecord = null;
  }

  if (!voterRecord || !voterRecord.votes.includes(artworkId)) {
    return { success: false, message: 'You have not voted for this artwork.' };
  }

  // Decrement tally
  const tallyKey = `tally:${artworkId}`;
  try {
    const raw = await store.get(tallyKey);
    const tally = raw ? JSON.parse(raw) : { count: 0 };
    tally.count = Math.max(0, tally.count - 1);
    await store.set(tallyKey, JSON.stringify(tally));
  } catch {
    // Ignore tally errors on removal
  }

  // Update voter record
  voterRecord.votes = voterRecord.votes.filter((id) => id !== artworkId);
  await store.set(voterKey, JSON.stringify(voterRecord));

  return { success: true, message: 'Vote removed.', votesRemaining: MAX_VOTES_PER_USER - voterRecord.votes.length };
}

/**
 * Get votes for a specific voter by email.
 */
export async function getVoterVotes(email) {
  const store = getVoteStore();
  const voterId = hashEmail(email);
  try {
    const raw = await store.get(`voter:${voterId}`);
    const record = raw ? JSON.parse(raw) : { votes: [] };
    return record.votes;
  } catch {
    return [];
  }
}

/**
 * Get vote tallies for all artworks. Returns { [artworkId]: count }.
 */
export async function getAllTallies(artworkIds) {
  const store = getVoteStore();
  const tallies = {};

  await Promise.all(
    artworkIds.map(async (id) => {
      try {
        const raw = await store.get(`tally:${id}`);
        const tally = raw ? JSON.parse(raw) : { count: 0 };
        tallies[id] = tally.count;
      } catch {
        tallies[id] = 0;
      }
    })
  );

  return tallies;
}

/**
 * Get total number of unique voters.
 */
export async function getVoterCount() {
  const store = getVoteStore();
  try {
    const { blobs } = await store.list({ prefix: 'voter:' });
    return blobs.length;
  } catch {
    return 0;
  }
}
