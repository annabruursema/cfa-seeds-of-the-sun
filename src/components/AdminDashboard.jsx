'use client';

import { useState, useEffect, useCallback } from 'react';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('votes');
  const [filterCat, setFilterCat] = useState('all');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (result.success) {
        setToken(result.token);
        setAuthed(true);
      } else {
        setAuthError(result.message || 'Incorrect password.');
      }
    } catch {
      setAuthError('Connection error.');
    }
  };

  const fetchResults = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/results', {
        headers: { 'x-admin-token': token },
      });
      const json = await res.json();
      setData(json);
    } catch {
      // Retry silently
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authed) fetchResults();
  }, [authed, fetchResults]);

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-gallery-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
          <h1 className="font-serif text-2xl font-bold text-gallery-900 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-gallery-500 mb-6">Seeds of the Sun — Vote Results</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border border-gallery-200 bg-gallery-50
                         text-gallery-900 text-sm focus:outline-none focus:ring-2 focus:ring-gallery-300
                         focus:border-transparent mb-4"
              autoFocus
            />
            {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Sort results
  let results = data?.results || [];
  if (filterCat !== 'all') {
    results = results.filter((r) => r.category === filterCat);
  }
  if (sortBy === 'votes') {
    results = [...results].sort((a, b) => b.voteCount - a.voteCount);
  } else if (sortBy === 'title') {
    results = [...results].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'artist') {
    results = [...results].sort((a, b) => a.artist.localeCompare(b.artist));
  }

  return (
    <div className="min-h-screen bg-gallery-50">
      {/* Header */}
      <header className="bg-gallery-950 text-gallery-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold">Seeds of the Sun</h1>
            <p className="text-gallery-400 text-xs tracking-wide">Admin Dashboard</p>
          </div>
          <button
            onClick={fetchResults}
            disabled={loading}
            className="btn-outline border-gallery-600 text-gallery-300 hover:text-white hover:border-gallery-400 text-xs"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gallery-100">
              <p className="text-xs text-gallery-400 uppercase tracking-wider mb-1">Total Votes</p>
              <p className="text-3xl font-serif font-bold text-gallery-900">{data.totalVotes}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gallery-100">
              <p className="text-xs text-gallery-400 uppercase tracking-wider mb-1">Unique Voters</p>
              <p className="text-3xl font-serif font-bold text-gallery-900">{data.totalVoters}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gallery-100">
              <p className="text-xs text-gallery-400 uppercase tracking-wider mb-1">Artworks</p>
              <p className="text-3xl font-serif font-bold text-gallery-900">{data.results.length}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-gallery-100 p-1 rounded-full">
            {['all', 'general', 'sopa'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all
                  ${filterCat === cat
                    ? 'bg-white text-gallery-900 shadow-sm'
                    : 'text-gallery-500 hover:text-gallery-700'}`}
              >
                {cat === 'all' ? 'All' : cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center text-xs text-gallery-500">
            <span>Sort by:</span>
            {['votes', 'title', 'artist'].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full transition-all ${
                  sortBy === s
                    ? 'bg-gallery-900 text-white'
                    : 'bg-gallery-100 hover:bg-gallery-200'
                }`}
              >
                {s === 'votes' ? 'Votes' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results table */}
        <div className="bg-white rounded-xl shadow-sm border border-gallery-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gallery-100 text-xs text-gallery-400 uppercase tracking-wider">
                <th className="text-left px-6 py-4 font-medium w-12">#</th>
                <th className="text-left px-6 py-4 font-medium">Artwork</th>
                <th className="text-left px-6 py-4 font-medium hidden md:table-cell">Artist</th>
                <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">Category</th>
                <th className="text-right px-6 py-4 font-medium">Votes</th>
              </tr>
            </thead>
            <tbody>
              {results.map((artwork, i) => {
                const maxVotes = Math.max(...results.map((r) => r.voteCount), 1);
                const pct = (artwork.voteCount / maxVotes) * 100;
                return (
                  <tr
                    key={artwork.id}
                    className="border-b border-gallery-50 hover:bg-gallery-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gallery-400 font-medium">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={artwork.image}
                          alt={artwork.title}
                          className="w-12 h-12 rounded-lg object-cover bg-gallery-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-serif font-semibold text-gallery-900 text-sm">
                            {artwork.title}
                          </p>
                          <p className="text-xs text-gallery-400 md:hidden">{artwork.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gallery-600 hidden md:table-cell">
                      {artwork.artist}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="px-2.5 py-1 rounded-full bg-gallery-100 text-gallery-600 text-[10px] font-medium uppercase tracking-wider">
                        {artwork.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-2 rounded-full bg-gallery-100 overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full bg-gallery-900 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gallery-900 text-sm tabular-nums min-w-[2rem] text-right">
                          {artwork.voteCount}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gallery-400 text-sm">
                    No artworks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <p className="text-xs text-gallery-400 mt-4 text-right">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        )}
      </main>
    </div>
  );
}
