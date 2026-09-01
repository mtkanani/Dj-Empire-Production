const IMAGE_TYPE_PRIORITY = ['BANNER', 'POSTER', 'THUMBNAIL', 'GALLERY'];

/**
 * Pick a display image URL from event payloads (listing, details, bookings, tickets).
 */
export function getEventBannerUrl(event, fallback = null) {
  if (!event) return fallback;

  const images = Array.isArray(event.images) ? event.images : [];
  for (const type of IMAGE_TYPE_PRIORITY) {
    const match = images.find((img) => iMatchesType(img, type));
    if (match?.imageUrl) return match.imageUrl;
  }

  const firstWithUrl = images.find((img) => img?.imageUrl);
  return (
    firstWithUrl?.imageUrl ||
    event.bannerUrl ||
    event.bannerImage ||
    event.bannerImageUrl ||
    event.banner ||
    event.seo?.ogImage ||
    fallback
  );
}

function iMatchesType(img, type) {
  return img?.imageUrl && String(img.type || '').toUpperCase() === type;
}
