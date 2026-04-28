        html += `<p>${insight}</p>`;
      }
    }

    if (analysis.recommendation) {
      html += `<p>💡 ${analysis.recommendation}</p>`;
    }

    this.elements.femtoOutput.innerHTML = html;
  }

  /**
   * Render playlist
   */
  _renderPlaylist() {
    if (this.playlist.length === 0) {
      this.elements.playlist.innerHTML = `
        <div class="empty-playlist">
          <p>🎵 No tracks yet!</p>
          <p>Click "Add Media" or drop files here</p>
        </div>
      `;
      return;
    }

    let html = '';

    for (let i = 0; i < this.playlist.length; i++) {
      const track = this.playlist[i];
      const isActive = i === this.currentIndex;
      const icon = track.type === 'video' ? '🎬' : '🎵';
      const vibe = track.analysis?.analysis?.vibe || '';

      html += `
        <div class="track-item ${isActive ? 'active' : ''}" data-index="${i}">
          <span class="track-item-icon">${icon}</span>
          <div class="track-item-info">
            <div class="track-item-title">${track.name} ${vibe}</div>
            <div class="track-item-artist">${track.artist}</div>
          </div>
          <span class="track-item-duration">${track.duration ? this._formatTime(track.duration) : '--:--'}</span>
          <button class="track-item-remove" data-remove="${i}">✕</button>
        </div>
      `;
    }

    this.elements.playlist.innerHTML = html;

    // Add click handlers
    this.elements.playlist.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('track-item-remove')) {
          this.play(parseInt(item.dataset.index));
        }
      });
    });

    this.elements.playlist.querySelectorAll('.track-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeTrack(parseInt(btn.dataset.remove));
      });
    });
  }

  /**
   * Format time in MM:SS
   */
  _formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Save playlist to localStorage
   */
  _savePlaylist() {
    // Can't save File objects, just save metadata
    const data = this.playlist.map(t => ({
      name: t.name,
      artist: t.artist,
      type: t.type
    }));

    localStorage.setItem('moosic_playlist_meta', JSON.stringify(data));
  }

  /**
   * Load tracks from media/playlist.json
   */
  async _loadMediaLibrary() {
    try {
      const response = await fetch('media/playlist.json');
      if (!response.ok) {
        console.log('No playlist.json found, using drag-drop only');
        return;
      }

      const data = await response.json();
      console.log(`📚 Loading library: ${data.name}`);

      for (const trackData of data.tracks) {
        const track = {
          id: Date.now() + Math.random(),
          name: trackData.name,
          artist: trackData.artist || 'Unknown Artist',
          file: null,
          url: `media/${trackData.file}`,
          type: trackData.type || (trackData.file.endsWith('.mp4') ? 'video' : 'audio'),
          duration: 0,
          analysis: null,
          isLibrary: true // Mark as library track (don't revoke URL)
        };

        this.playlist.push(track);

        // Analyze with KONOMI
        this._analyzeTrack(track);
      }

      this._renderPlaylist();
      this._updateStatus(`Loaded ${data.tracks.length} tracks from library`);

    } catch (e) {
      console.log('Could not load media library:', e.message);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.moosicApp = new MoosicApp();
  window.moosicApp.init();
});
