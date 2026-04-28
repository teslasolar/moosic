/**
 * YouTube search via Invidious API (no API key needed)
 * Falls back to channel page embed if Invidious is down
 */
const INVIDIOUS = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://vid.puffyan.us',
];

let activeInstance = INVIDIOUS[0];

export async function searchVideos(query, maxResults = 10) {
  for (const instance of INVIDIOUS) {
    try {
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&sort=relevance`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await r.json();
      activeInstance = instance;
      return data.slice(0, maxResults).map(v => ({
        id: v.videoId,
        title: v.title,
        author: v.author,
        duration: v.lengthSeconds,
        views: v.viewCount,
        thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
        published: v.publishedText,
      }));
    } catch { continue; }
  }
  return [];
}

export async function getChannelVideos(channelHandle, maxResults = 20) {
  const query = channelHandle.replace('@', '') + ' music';
  return searchVideos(query, maxResults);
}

export async function getVideoInfo(videoId) {
  try {
    const r = await fetch(`${activeInstance}/api/v1/videos/${videoId}`, { signal: AbortSignal.timeout(5000) });
    return r.json();
  } catch { return null; }
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
