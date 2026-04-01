'use client';

import { useState, useEffect, useCallback } from 'react';
import ArtworkCard from './ArtworkCard';
import ArtworkModal from './ArtworkModal';

const MAX_VOTES = 3;

export default function VotingGallery({ artworks }) {
  const [myVotes, setMyVotes] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch existing votes on mount (IP-based, no email needed)
  useEffect(() => {
    fetch('/api/vote')
      .then((r) => r.json())
      .then((data) => {
        setMyVotes(data.votes || []);
        setInitialized(true);
      })
      .catch(() => setInitialized(true));
  }, []);

  const handleVote = useCallback(
    async (artworkId) => {
      setLoading(true);
      setMessage(null);

      const isVoted = myVotes.includes(artworkId);

      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artworkId,
            action: isVoted ? 'remove' : 'vote',
          }),
        });
        const data = await res.json();

        if (data.success) {
          if (data.votes) {
            setMyVotes(data.votes);
          } else {
            setMyVotes((prev) =>
              isVoted ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]
            );
          }
          setMessage({ type: 'success', text: data.message });
        } else {
          setMessage({ type: 'error', text: data.message });
        }
      } catch {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(null), 3000);
      }
    },
    [myVotes]
  );

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Votes remaining indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-sm text-gallery-600">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gallery-950 text-gallery-50 text-xs font-semibold">
              {MAX_VOTES - myVotes.length}
            </span>
            <span>votes remaining</span>
          </div>
          <p className="text-xs text-gallery-400">
            Select up to {MAX_VOTES} of your favorites
          </p>
        </div>

        {/* Toast message */}
        {message && (
          <div
            className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-slideUp
              ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}
          >
            {message.text}
          </div>
        )}

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              isVoted={myVotes.includes(artwork.id)}
              canVote={myVotes.length < MAX_VOTES}
              loading={loading}
              onView={() => setSelectedArtwork(artwork)}
              onVote={() => handleVote(artwork.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          isVoted={myVotes.includes(selectedArtwork.id)}
          canVote={myVotes.length < MAX_VOTES}
          loading={loading}
          onVote={() => handleVote(selectedArtwork.id)}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </>
  );
}
