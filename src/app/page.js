import { getArtworks, getCategories } from '../lib/artworks';
import VotingGallery from '../components/VotingGallery';

export const metadata = {
  title: 'Seeds of the Sun | Online Choice Award | Milan Art Gallery',
  description: 'Vote for your favorite artwork in the Seeds of the Sun Call for Art exhibition.',
};

export default function HomePage() {
  const artworks = getArtworks();
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gallery-50">
      {/* Header */}
      <header className="relative bg-gallery-950 text-gallery-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gallery-950 via-gallery-900 to-gallery-800 opacity-90" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
          <p className="text-gallery-400 text-xs tracking-[0.3em] uppercase mb-4 font-sans">
            Milan Art Gallery
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Seeds of the Sun
          </h1>
          <div className="w-16 h-px bg-gallery-500 mx-auto mb-6" />
          <p className="font-serif text-xl md:text-2xl text-gallery-300 italic mb-2">
            Online Choice Award
          </p>
          <p className="text-gallery-400 text-sm max-w-lg mx-auto mt-6 leading-relaxed">
            Browse the selected artworks below and vote for up to three of your favorites.
            Your voice helps determine the Online Choice Award winner.
          </p>
        </div>
      </header>

      {/* Gallery */}
      <main>
        <VotingGallery artworks={artworks} categories={categories} />
      </main>

      {/* Footer */}
      <footer className="bg-gallery-950 text-gallery-500 py-10 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Milan Art Gallery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
