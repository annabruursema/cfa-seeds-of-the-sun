'use client';

import { useState, useRef, useEffect } from 'react';

export default function EmailPrompt({ onSubmit, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    onSubmit(email.trim().toLowerCase());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-2xl font-bold text-gallery-900 mb-2">
          Enter Your Email to Vote
        </h3>
        <p className="text-sm text-gallery-500 mb-6 leading-relaxed">
          Your email is used to track your votes and prevent duplicates.
          You can vote for up to 3 artworks.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-gallery-200 bg-gallery-50
                       text-gallery-900 placeholder-gallery-400 text-sm
                       focus:outline-none focus:ring-2 focus:ring-gallery-300 focus:border-transparent
                       transition-all duration-200"
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Continue
            </button>
          </div>
        </form>

        <p className="text-[11px] text-gallery-400 mt-4 text-center leading-relaxed">
          Your email will not be shared or used for marketing purposes.
        </p>
      </div>
    </div>
  );
}
