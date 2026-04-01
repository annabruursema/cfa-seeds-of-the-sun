import artworksData from '../../data/artworks.json';

/**
 * Get all artworks, optionally filtered by category.
 */
export function getArtworks(category = null) {
  let items = artworksData;
  if (category && category !== 'all') {
    items = items.filter((a) => a.category === category);
  }
  return items;
}

/**
 * Get a single artwork by its ID.
 */
export function getArtworkById(id) {
  return artworksData.find((a) => a.id === id) || null;
}

/**
 * Get all unique categories.
 */
export function getCategories() {
  const cats = new Set(artworksData.map((a) => a.category));
  return ['all', ...Array.from(cats)];
}
