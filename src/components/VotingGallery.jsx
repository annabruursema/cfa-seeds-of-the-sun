'use client';

import { useState, useEffect, useCallback } from 'react';
import ArtworkCard from './ArtworkCard';
import ArtworkModal from './ArtworkModal';
import EmailPrompt from './EmailPrompt';

const MAX_VOTES = 3;

export default function VotingGallery({ artworks, categories }) {
  const [email, setEmail] = useState(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [myVotes, setMyVotes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Restore email from cookie on mount
  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((c) => c.startsWith('cfa_voter_email='));
    if (stored) {
      const storedEmail = decodeURIComponent(stored.split('=')[1]);
      setEmail(storedEmail);
    }
  }, []);

  // Fetch existing votes when email is set
  useEffect(() => {
    if (!email) return;
    fetch(`/api/vote?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => setMyVotes(data.votes || []))
      .catch(() => {});
  }, [email]);

  const handleEmailSubmit = useCallback((submittedEmail) => {
    setEmail(submittedEmail);
    document.cookie = `cfa_voter_email=${encodeURIComponent(submittedEmail)}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    setShowEmailPrompt(false);
  }, []);

  const handleVote = useCallback(
    async (artworkId) => {
      if (!email) {
        setShowEmailPrompt(true);
        return;
      }

      setLoading(true);
      setMessage(null);

      const isVoted = myVotes.includes(artworkId);

      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artworkId,
            email,
            action: isVoted ? 'remove' : 'vote',
          }),
        });
        const data = await res.json();

        if (data.success) {
          setMyVotes((prev) =>
            isVoted ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]
          );
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
    [email, myVotes]
  );

  const filtered =
    activeCategory === 'all'
      ? artworks
      : artworks.filter((a) => a.category === activeCategory);

  const categoryLabels = { all: 'All Works', general: 'General', sopa: 'SOPA' };

  return (
    <>
      {/* Vote counter + category filter */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Status bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            {email ? (
              <div className="flex items-center gap-2 text-sm text-gallery-600">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gallery-950 text-gallery-50 text-xs font-semibold">
                  {MAX_VOTES - myVotes.length}
                </span>
                <span>votes remaining</span>
              </div>
            ) : (
              <button
                onClick={() => setShowEmailPrompt(true)}
                className="btn-primary text-sm"
              >
                Sign in to Vote
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 bg-gallery-100 p-1 rounded-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200
                  ${activeCategory === cat
                    ? 'bg-white text-gallery-900 shadow-sm'
                    : 'text-gallery-500 hover:text-gallery-700'
                  }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
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
          {filtered.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              isVoted={myVotes.includes(artwork.id)}
              canVote={email && myVotes.length < MAX_VOTES}
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
          canVote={email && myVotes.length < MAX_VOTES}
          loading={loading}
          onVote={() => handleVote(selectedArtwork.id)}
          onClose={() => setSelectedArtwork(null)}
        />
      )}

      {/* Email prompt */}
      {showEmailPrompt && (
        <EmailPrompt
          onSubmit={handleEmailSubmit}
          onClose={() => setShowEmailPrompt(false)}
        />
      )}
    </>
  );
}
