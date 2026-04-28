/**
 * YouTube UI — search bar, results grid, player embed
 */
import { searchVideos, getChannelVideos, formatDuration } from './search.js';
import { playVideo, initPlayer } from './player.js';
import { parseVideoId } from './parser.js';

export async function initYouTube(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div class="yt-section">
      <div class="yt-search-row">
        <input id="yt-search" type="text" placeholder="Search YouTube or paste URL..." value="ThomasTheSolarCryptoEngine music">
        <button id="yt-go" class="action-btn">🔍</button>
      </div>
      <div id="yt-player" class="yt-player"></div>
      <div id="yt-results" class="yt-results"></div>
    </div>`;

  initPlayer('yt-player');

  document.getElementById('yt-go').onclick = () => doSearch();
  document.getElementById('yt-search').onkeydown = e => { if (e.key === 'Enter') doSearch(); };

  // Auto-load channel videos
  await loadChannel();
}

async function loadChannel() {
  const results = await getChannelVideos('@ThomasTheSolarCryptoEngine', 12);
  renderResults(results);
}

async function doSearch() {
  const input = document.getElementById('yt-search');
  const q = input.value.trim();
  if (!q) return;

  // Check if it's a direct URL
  const vid = parseVideoId(q);
  if (vid) { playVideo(vid); return; }

  const results = await searchVideos(q, 12);
  renderResults(results);
}

function renderResults(videos) {
  const el = document.getElementById('yt-results');
  if (!el) return;
  el.innerHTML = videos.length ? videos.map(v => `
    <div class="yt-card" onclick="window._ytPlay('${v.id}')">
      <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
      <div class="yt-card-info">
        <div class="yt-card-title">${v.title}</div>
        <div class="yt-card-meta">${v.author} · ${formatDuration(v.duration)}</div>
      </div>
    </div>`).join('')
    : '<div class="yt-empty">No results</div>';
}

window._ytPlay = (id) => playVideo(id);
