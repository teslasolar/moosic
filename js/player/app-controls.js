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
