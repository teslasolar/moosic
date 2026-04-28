/**
 * YouTube embed player — iframe API wrapper
 */
let currentVideoId = null;
let playerEl = null;

export function initPlayer(containerId) {
  playerEl = document.getElementById(containerId);
  if (!playerEl) return;
  playerEl.innerHTML = '<div class="yt-placeholder">🎵 Search or select a video</div>';
}

export function playVideo(videoId, autoplay = true) {
  if (!playerEl) return;
  currentVideoId = videoId;
  playerEl.innerHTML = `<iframe
    src="https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1"
    frameborder="0" allow="autoplay; encrypted-media" allowfullscreen
    style="width:100%;height:100%;border-radius:8px"></iframe>`;
}

export function stopVideo() {
  if (!playerEl) return;
  playerEl.innerHTML = '<div class="yt-placeholder">🎵 Stopped</div>';
  currentVideoId = null;
}

export function getCurrentVideoId() { return currentVideoId; }
