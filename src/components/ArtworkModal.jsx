'use client';

import { useEffect } from 'react';

export default function ArtworkModal({ artwork, isVoted, canVote, loading, onVote, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-3/5 bg-gallery-100">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"
            />
          </div>

          {/* Details */}
          <div className="md:w-2/5 p-8 flex flex-col">
            <button
              onClick={onClose}
              className="self-end w-8 h-8 flex items-center justify-center rounded-full hover:bg-gallery-100 text-gallery-400 hover:text-gallery-700 transition-colors -mt-2 -mr-2 mb-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-400 mb-3">
              {artwork.category === 'sopa' ? 'SOPA Submission' : 'General Submission'}
            </span>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gallery-900 mb-2 leading-tight">
              {artwork.title}
            </h2>

            <p className="text-gallery-600 font-medium mb-6">{artwork.artist}</p>

            <div className="space-y-3 text-sm mb-8">
              {artwork.medium && (
                <div className="flex justify-between py-2 border-b border-gallery-100">
                  <span className="text-gallery-400">Medium</span>
                  <span className="text-gallery-700">{artwork.medium}</span>
                </div>
              )}
              {artwork.dimensions && (
                <div className="flex justify-between py-2 border-b border-gallery-100">
                  <span className="text-gallery-400">Dimensions</span>
                  <span className="text-gallery-700">{artwork.dimensions}</span>
                </div>
              )}
            </div>

            {artwork.description && (
              <p className="text-sm text-gallery-500 leading-relaxed mb-8 flex-grow">
                {artwork.description}
              </p>
            )}

            <button
              onClick={onVote}
              disabled={loading || (!isVoted && !canVote)}
              className={`w-full ${isVoted ? 'btn-voted' : 'btn-primary'} py-3 text-base`}
            >
              {loading ? 'Processing...' : isVoted ? 'Remove Vote' : 'Vote for This Artwork'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
