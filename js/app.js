/**
 * 🎵 KONOMI MOOSIC - Main Application
 *
 * Self-hosted music/video player
 * Powered by KONOMI System
 */

class MoosicApp {
  constructor() {
    // KONOMI System
    this.konomi = null;

    // Media elements
    this.audioPlayer = null;
    this.videoPlayer = null;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;

    // Playlist
    this.playlist = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.shuffle = false;
    this.repeat = 'none'; // 'none', 'one', 'all'

    // Visualizer
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;

    // DOM elements
    this.elements = {};
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('🎵 MOOSIC App initializing...');

    // Cache DOM elements
    this._cacheElements();

    // Initialize KONOMI System
    this.konomi = new KonomiSystem({
      blockArraySize: [10, 10, 10]
    });

    this.konomi.on('system:ready', (status) => {
      this._updateStatus('KONOMI: Online');
      this._updateKonomiStats(status);
    });

    await this.konomi.init();

    // Setup media players
    this._setupPlayers();

    // Setup event listeners
    this._setupEventListeners();

    // Setup drag and drop
    this._setupDragDrop();

    // Setup visualizer
    this._setupVisualizer();

    // Load any saved playlist
    this._loadSavedPlaylist();

    console.log('🎵 MOOSIC App ready!');
  }

  /**
   * Cache DOM elements
   */
  _cacheElements() {
    this.elements = {
      audioPlayer: document.getElementById('audioPlayer'),
      videoPlayer: document.getElementById('videoPlayer'),
      mediaDisplay: document.getElementById('mediaDisplay'),
      visualizer: document.getElementById('visualizer'),
      nowPlaying: document.getElementById('nowPlaying'),
      trackTitle: document.getElementById('trackTitle'),
      trackArtist: document.getElementById('trackArtist'),
      trackArt: document.getElementById('trackArt'),
      playBtn: document.getElementById('playBtn'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      shuffleBtn: document.getElementById('shuffleBtn'),
      repeatBtn: document.getElementById('repeatBtn'),
      progressBar: document.getElementById('progressBar'),
      volumeBar: document.getElementById('volumeBar'),
      currentTime: document.getElementById('currentTime'),
      duration: document.getElementById('duration'),
      playlist: document.getElementById('playlist'),
      addMediaBtn: document.getElementById('addMediaBtn'),
      fileInput: document.getElementById('fileInput'),
      dropZone: document.getElementById('dropZone'),
      statusText: document.getElementById('statusText'),
      femtoStatus: document.getElementById('femtoStatus'),
      evgpuStatus: document.getElementById('evgpuStatus'),
      blockStatus: document.getElementById('blockStatus'),
      cubeStatus: document.getElementById('cubeStatus'),
      femtoOutput: document.getElementById('femtoOutput')
    };

    this.audioPlayer = this.elements.audioPlayer;
    this.videoPlayer = this.elements.videoPlayer;
    this.canvas = this.elements.visualizer;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Setup media players
   */
  _setupPlayers() {
    // Audio player events
    this.audioPlayer.addEventListener('timeupdate', () => this._onTimeUpdate());
    this.audioPlayer.addEventListener('ended', () => this._onTrackEnded());
    this.audioPlayer.addEventListener('loadedmetadata', () => this._onMetadataLoaded());
    this.audioPlayer.addEventListener('error', (e) => this._onError(e));

    // Video player events
    this.videoPlayer.addEventListener('timeupdate', () => this._onTimeUpdate());
    this.videoPlayer.addEventListener('ended', () => this._onTrackEnded());
    this.videoPlayer.addEventListener('loadedmetadata', () => this._onMetadataLoaded());
    this.videoPlayer.addEventListener('error', (e) => this._onError(e));

    // Set initial volume
    this.audioPlayer.volume = 0.8;
    this.videoPlayer.volume = 0.8;
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Play/Pause
    this.elements.playBtn.addEventListener('click', () => this.togglePlay());

    // Previous/Next
    this.elements.prevBtn.addEventListener('click', () => this.prev());
    this.elements.nextBtn.addEventListener('click', () => this.next());

    // Shuffle
    this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());

    // Repeat
    this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());

    // Progress bar
    this.elements.progressBar.addEventListener('input', (e) => this.seek(e.target.value));

    // Volume
    this.elements.volumeBar.addEventListener('input', (e) => this.setVolume(e.target.value));

    // Add media button
    this.elements.addMediaBtn.addEventListener('click', () => {
      this.elements.fileInput.click();
    });

    // File input
    this.elements.fileInput.addEventListener('change', (e) => {
      this.addFiles(e.target.files);
      e.target.value = '';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this._handleKeyboard(e));
  }

  /**
   * Setup drag and drop
   */
  _setupDragDrop() {
    const dropZone = this.elements.dropZone;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
      document.body.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    document.body.addEventListener('dragenter', () => {
      dropZone.classList.add('active');
    });

    document.body.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null) {
        dropZone.classList.remove('active');
      }
    });

    document.body.addEventListener('drop', (e) => {
      dropZone.classList.remove('active');
      const files = e.dataTransfer.files;
      this.addFiles(files);
    });
  }

  /**
   * Setup visualizer
   */
  _setupVisualizer() {
    // Resize canvas to fit container
    const resize = () => {
      const rect = this.elements.mediaDisplay.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);
  }

  /**
   * Initialize audio context for visualization
   */
  _initAudioContext() {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    this.source = this.audioContext.createMediaElementSource(this.audioPlayer);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Add files to playlist
   */
  async addFiles(files) {
    for (const file of files) {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        const track = {
          id: Date.now() + Math.random(),
          name: this._parseFileName(file.name),
          artist: 'Local File',
          file: file,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('video/') ? 'video' : 'audio',
          duration: 0,
          analysis: null
        };

        this.playlist.push(track);

        // Analyze with KONOMI
        this._analyzeTrack(track);
      }
    }

    this._renderPlaylist();
    this._savePlaylist();

    // Auto-play first track if nothing playing
    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.play(0);
    }
  }

  /**
   * Parse filename to track name
   */
  _parseFileName(filename) {
    return filename
      .replace(/\.[^.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ')   // Replace dashes/underscores
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim();
  }

  /**
   * Analyze track with KONOMI
   */
  async _analyzeTrack(track) {
    try {
      const result = await this.konomi.processTrack({
        name: track.name,
        artist: track.artist
      });

      track.analysis = result;

      // Update UI if this is current track
      if (this.playlist[this.currentIndex]?.id === track.id) {
        this._updateFemtoOutput(result);
      }

      this._renderPlaylist();
    } catch (e) {
      console.error('Track analysis failed:', e);
    }
  }

  /**
   * Play track at index
   */
  async play(index) {
    if (index < 0 || index >= this.playlist.length) return;

    const track = this.playlist[index];
    this.currentIndex = index;

    // Stop current playback
    this.audioPlayer.pause();
    this.videoPlayer.pause();

    // Show/hide appropriate player
    if (track.type === 'video') {
      this.videoPlayer.src = track.url;
      this.videoPlayer.style.display = 'block';
      this.canvas.style.display = 'none';
      await this.videoPlayer.play();
    } else {
      this.audioPlayer.src = track.url;
      this.videoPlayer.style.display = 'none';
      this.canvas.style.display = 'block';

      // Initialize audio context on first play (needs user interaction)
      this._initAudioContext();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.audioPlayer.play();
      this._startVisualizer();
    }

    this.isPlaying = true;
    this._updatePlayButton();
    this._updateNowPlaying(track);
    this._updateFemtoOutput(track.analysis);
    this._renderPlaylist();

    this._updateStatus(`Playing: ${track.name}`);
  }

  /**
   * Toggle play/pause
   */
  togglePlay() {
    if (this.currentIndex === -1) {
      if (this.playlist.length > 0) {
        this.play(0);
      }
      return;
    }

    const track = this.playlist[this.currentIndex];
    const player = track.type === 'video' ? this.videoPlayer : this.audioPlayer;

    if (this.isPlaying) {
      player.pause();
      this._stopVisualizer();
    } else {
      player.play();
      if (track.type === 'audio') {
        this._startVisualizer();
      }
    }

    this.isPlaying = !this.isPlaying;
    this._updatePlayButton();
  }

  /**
   * Previous track
   */
  prev() {
    if (this.playlist.length === 0) return;

    let index = this.currentIndex - 1;
    if (index < 0) index = this.playlist.length - 1;

    this.play(index);
  }

  /**
   * Next track
   */
  next() {
    if (this.playlist.length === 0) return;

    let index;
    if (this.shuffle) {
      index = Math.floor(Math.random() * this.playlist.length);
    } else {
      index = (this.currentIndex + 1) % this.playlist.length;
    }

    this.play(index);
  }

  /**
   * Seek to position
   */
  seek(percent) {
    const track = this.playlist[this.currentIndex];
    if (!track) return;

    const player = track.type === 'video' ? this.videoPlayer : this.audioPlayer;
    player.currentTime = (percent / 100) * player.duration;
  }

  /**
   * Set volume
   */
  setVolume(percent) {
    const volume = percent / 100;
    this.audioPlayer.volume = volume;
    this.videoPlayer.volume = volume;
  }

  /**
   * Toggle shuffle
   */
  toggleShuffle() {
    this.shuffle = !this.shuffle;
    this.elements.shuffleBtn.classList.toggle('active', this.shuffle);
  }

  /**
   * Toggle repeat
   */
  toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentIdx = modes.indexOf(this.repeat);
    this.repeat = modes[(currentIdx + 1) % modes.length];

    const icons = { none: '🔁', all: '🔁', one: '🔂' };
    this.elements.repeatBtn.textContent = icons[this.repeat];
    this.elements.repeatBtn.classList.toggle('active', this.repeat !== 'none');
  }

  /**
   * Remove track from playlist
   */
  removeTrack(index) {
    if (index === this.currentIndex) {
      this.audioPlayer.pause();
      this.videoPlayer.pause();
      this.isPlaying = false;
      this._updatePlayButton();
    }

    // Revoke object URL (only for non-library tracks)
    if (!this.playlist[index].isLibrary) {
      URL.revokeObjectURL(this.playlist[index].url);
    }

    this.playlist.splice(index, 1);

    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex) {
      this.currentIndex = -1;
      this.elements.trackTitle.textContent = 'Select a track';
      this.elements.trackArtist.textContent = '--';
    }

    this._renderPlaylist();
    this._savePlaylist();
  }

  /**
   * Time update handler
   */
  _onTimeUpdate() {
    const track = this.playlist[this.currentIndex];
    if (!track) return;

    const player = track.type === 'video' ? this.videoPlayer : this.audioPlayer;
    const percent = (player.currentTime / player.duration) * 100 || 0;

    this.elements.progressBar.value = percent;
    this.elements.currentTime.textContent = this._formatTime(player.currentTime);
  }

  /**
   * Track ended handler
   */
  _onTrackEnded() {
    if (this.repeat === 'one') {
      this.play(this.currentIndex);
    } else if (this.repeat === 'all' || this.currentIndex < this.playlist.length - 1) {
      this.next();
    } else {
      this.isPlaying = false;
      this._updatePlayButton();
      this._stopVisualizer();
    }
  }

  /**
   * Metadata loaded handler
   */
  _onMetadataLoaded() {
    const track = this.playlist[this.currentIndex];
    if (!track) return;

    const player = track.type === 'video' ? this.videoPlayer : this.audioPlayer;
    track.duration = player.duration;

    this.elements.duration.textContent = this._formatTime(player.duration);
    this._renderPlaylist();
  }

  /**
   * Error handler
   */
  _onError(e) {
    console.error('Media error:', e);
    this._updateStatus('Error loading media');
  }

  /**
   * Keyboard shortcuts
   */
  _handleKeyboard(e) {
    if (e.target.tagName === 'INPUT') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.elements.volumeBar.value = Math.min(100, parseInt(this.elements.volumeBar.value) + 5);
        this.setVolume(this.elements.volumeBar.value);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.elements.volumeBar.value = Math.max(0, parseInt(this.elements.volumeBar.value) - 5);
        this.setVolume(this.elements.volumeBar.value);
        break;
    }
  }

  /**
   * Start visualizer animation
   */
  _startVisualizer() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);

      this.analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      this.ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw bars
      const barWidth = (this.canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * this.canvas.height * 0.8;

        // Gradient based on height
        const hue = (dataHeight / this.canvas.height) * 120 + 140;
        var dataHeight = barHeight;
        this.ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

        this.ctx.fillRect(
          x,
          this.canvas.height - barHeight,
          barWidth - 1,
          barHeight
        );

        x += barWidth;
      }

      // Analyze and update KONOMI stats
      if (this.konomi && Math.random() < 0.1) {
        const analysis = this.konomi.analyzeVisualizerData(dataArray);
        this._updateKonomiStats({ energy: Math.round(analysis.energy) });
      }
    };

    draw();
  }

  /**
   * Stop visualizer animation
   */
  _stopVisualizer() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update play button
   */
  _updatePlayButton() {
    this.elements.playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
  }

  /**
   * Update now playing display
   */
  _updateNowPlaying(track) {
    this.elements.trackTitle.textContent = track.name;
    this.elements.trackArtist.textContent = track.artist;

    // Set emoji based on type
    this.elements.trackArt.textContent = track.type === 'video' ? '🎬' : '🎵';
  }

  /**
   * Update status text
   */
  _updateStatus(text) {
    this.elements.statusText.textContent = text;
  }

  /**
   * Update KONOMI stats display
   */
  _updateKonomiStats(status) {
    if (status.evgpu) {
      this.elements.evgpuStatus.textContent = `${status.evgpu.cores} cores`;
    }
    if (status.blockArray) {
      this.elements.blockStatus.textContent = `${status.blockArray.dimensions.join('×')}`;
    }
    if (status.cubes) {
      this.elements.cubeStatus.textContent = `${status.cubes.length * 9} nodes`;
    }
    if (status.energy !== undefined) {
      this.elements.femtoStatus.textContent = `Energy: ${status.energy}%`;
    }
  }

  /**
   * Update FemtoLLM output display
   */
  _updateFemtoOutput(analysis) {
    if (!analysis) {
      this.elements.femtoOutput.innerHTML = '<p>🎯 FemtoLLM Analysis: Waiting for track...</p>';
      return;
    }

    const a = analysis.analysis || analysis;
    let html = '<p>🎯 <strong>FemtoLLM Analysis:</strong></p>';

    if (a.genre) html += `<p>Genre: ${a.genre}</p>`;
    if (a.mood) html += `<p>Mood: ${a.mood}</p>`;
    if (a.energy !== undefined) html += `<p>Energy: ${a.energy}%</p>`;
    if (a.bpmEstimate) html += `<p>BPM (est): ${a.bpmEstimate}</p>`;
    if (a.vibe) html += `<p>Vibe: ${a.vibe}</p>`;

    if (analysis.insights) {
      html += '<p>---</p>';
      for (const insight of analysis.insights) {
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
   * Load saved playlist (metadata only)
   */
  _loadSavedPlaylist() {
    // Load from playlist.json in media folder
    this._loadMediaLibrary();
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
