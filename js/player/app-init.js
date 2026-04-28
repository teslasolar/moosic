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
    await this._loadMediaLibrary();

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

