'use client';

export default function ArtworkCard({ artwork, isVoted, canVote, loading, onView, onVote }) {
  return (
    <div className="card-artwork group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gallery-100" onClick={onView}>
        <img
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium uppercase tracking-wider text-gallery-600">
          {artwork.category}
        </span>

        {/* Voted indicator */}
        {isVoted && (
          <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-gallery-900 mb-1 leading-snug">
          {artwork.title}
        </h3>
        <p className="text-sm text-gallery-500 mb-0.5">{artwork.artist}</p>
        <p className="text-xs text-gallery-400">{artwork.medium}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gallery-100">
          <button
            onClick={onView}
            className="text-xs text-gallery-500 hover:text-gallery-800 font-medium transition-colors"
          >
            View Details
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onVote(); }}
            disabled={loading || (!isVoted && !canVote)}
            className={isVoted ? 'btn-voted text-xs px-4 py-1.5' : 'btn-primary text-xs px-4 py-1.5'}
          >
            {loading ? (
              <span className="animate-pulse-gentle">...</span>
            ) : isVoted ? (
              <span className="group-hover:hidden">Voted ✓</span>
            ) : (
              'Vote'
            )}
            {isVoted && (
              <span className="hidden group-hover:inline">Remove</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
