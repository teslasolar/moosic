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
