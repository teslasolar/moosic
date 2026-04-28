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
