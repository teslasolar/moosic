/**
 * YouTube URL parser — extracts video IDs from any YouTube URL format
 */
const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

export function parseVideoId(input) {
  if (!input) return null;
  for (const re of YT_PATTERNS) {
    const m = input.match(re);
    if (m) return m[1];
  }
  return null;
}

export function embedUrl(videoId, autoplay = false) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`;
}

export function thumbnailUrl(videoId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function watchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function channelUrl(handle) {
  return `https://www.youtube.com/${handle}`;
}

export function searchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
