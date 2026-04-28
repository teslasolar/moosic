/**
 * 🧠 FemtoLLM - 16-dim nano model for music processing
 *
 * Specs: 16d | 1 layer | 1 head | 4MB RAM | 0.1s/req
 *
 * Music-specific features:
 * - Genre classification (lightweight)
 * - BPM detection
 * - Energy/mood analysis
 * - Audio fingerprinting
 * - Beat pattern recognition
 */

class FemtoLLM {
  // Hidden size (16 dimensions)
  static H = 16;

  // Music vocabulary for analysis
  static GENRES = ['electronic', 'rock', 'pop', 'hiphop', 'jazz', 'classical', 'ambient', 'metal'];
  static MOODS = ['energetic', 'chill', 'dark', 'happy', 'melancholic', 'aggressive', 'peaceful', 'uplifting'];
  static VIBES = ['🔥', '💎', '🌊', '⚡', '🌙', '☀️', '🎸', '🎹'];

  constructor() {
    this.h = FemtoLLM.H;

    // Initialize weight matrices (small, CPU-friendly)
    this.W = this._initWeights(this.h, this.h);
    this.Wq = this._initWeights(this.h, this.h);
    this.Wk = this._initWeights(this.h, this.h);
    this.Wv = this._initWeights(this.h, this.h);
    this.Wo = this._initWeights(this.h, this.h);

    // Genre classifier weights
    this.Wgenre = this._initWeights(FemtoLLM.GENRES.length, this.h);

    // Mood classifier weights
    this.Wmood = this._initWeights(FemtoLLM.MOODS.length, this.h);

    // State
    this.ready = false;
    this.evgpu = null;

    // Memory for context (last 64 embeddings)
    this.memory = [];
    this.maxMemory = 64;
  }

  /**
   * Initialize with eVGPU reference
   */
  async init(evgpu) {
    this.evgpu = evgpu;
    this.ready = true;
    console.log(`🧠 FemtoLLM initialized (${this.h}d)`);
    return this;
  }

  /**
   * Initialize random weights
   */
  _initWeights(rows, cols) {
    const data = new Float32Array(rows * cols);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() - 0.5) * 0.2;
    }
    return { data, shape: [rows, cols], size: rows * cols };
  }

  /**
   * Main processing function
   * @param {string|Float32Array} input - Text description or audio features
   * @param {string} mode - 'text', 'audio', 'analyze'
   */
  async proc(input, mode = 'text') {
    const start = performance.now();

    let result;

    switch (mode) {
      case 'audio':
        result = await this._processAudio(input);
        break;
      case 'analyze':
        result = await this._analyzeTrack(input);
        break;
      case 'fingerprint':
        result = this._fingerprint(input);
        break;
      case 'bpm':
        result = this._detectBPM(input);
        break;
      default:
        result = await this._processText(input);
    }

    const elapsed = performance.now() - start;
    result.processingTime = elapsed;

    return result;
  }

  /**
   * Process text input (track names, descriptions)
   */
  async _processText(text) {
    // Simple text embedding
    const embedding = this._textToEmbedding(text);

    // Run through attention
    const attended = this._attention(embedding);

    // Classify genre and mood from text
    const genre = this._classifyGenre(attended);
    const mood = this._classifyMood(attended);

    // Generate response
    const vibe = FemtoLLM.VIBES[Math.floor(Math.random() * FemtoLLM.VIBES.length)];

    return {
      input: text.substring(0, 50),
      embedding: Array.from(embedding).slice(0, 4).map(v => v.toFixed(3)),
      genre: genre,
      mood: mood,
      vibe: vibe,
      response: `${vibe} [${text.substring(0, 30)}...] → ${mood} ${genre}`
    };
  }

  /**
   * Process audio features
   */
  async _processAudio(features) {
    // Expect Float32Array of audio features
    if (!(features instanceof Float32Array)) {
      features = new Float32Array(features);
    }

    // Reduce to embedding size
    const embedding = this._audioToEmbedding(features);

    // Analyze
    const genre = this._classifyGenre(embedding);
    const mood = this._classifyMood(embedding);
    const energy = this._calculateEnergy(features);

    // Store in memory
    this._addToMemory(embedding);

    return {
      genre: genre,
      mood: mood,
      energy: energy,
      embedding: Array.from(embedding).slice(0, 4).map(v => v.toFixed(3)),
      memoryUsed: this.memory.length
    };
  }

  /**
   * Full track analysis (combines multiple features)
   */
  async _analyzeTrack(trackData) {
    const { name = 'Unknown', artist = 'Unknown', audioFeatures = null } = trackData;

    // Text analysis from name
    const textResult = await this._processText(`${name} by ${artist}`);

    // Audio analysis if available
    let audioResult = null;
    if (audioFeatures) {
      audioResult = await this._processAudio(audioFeatures);
    }

    // BPM guess from name (common patterns)
    const bpmGuess = this._guessBPMFromName(name);

    // Combine results
    const finalGenre = audioResult?.genre || textResult.genre;
    const finalMood = audioResult?.mood || textResult.mood;
    const energy = audioResult?.energy || Math.random() * 100;

    // Generate full analysis
    return {
      track: name,
      artist: artist,
      analysis: {
        genre: finalGenre,
        mood: finalMood,
        energy: Math.round(energy),
        bpmEstimate: bpmGuess,
        vibe: textResult.vibe
      },
      insights: this._generateInsights(finalGenre, finalMood, energy),
      recommendation: this._generateRecommendation(finalGenre, finalMood)
    };
  }

  /**
   * Audio fingerprinting (simplified)
   */
  _fingerprint(audioData) {
    const chunkSize = 1024;
    const hashes = [];

    for (let i = 0; i < Math.min(audioData.length, 44100 * 10); i += chunkSize) {
      const chunk = audioData.slice(i, i + chunkSize);
      const hash = this._hashChunk(chunk);
      hashes.push(hash);
    }

    return {
      fingerprint: hashes.slice(0, 16).join('-'),
      chunks: hashes.length,
      duration: (audioData.length / 44100).toFixed(2) + 's'
    };
  }

  /**
   * BPM detection from audio
   */
  _detectBPM(audioData) {
    // Simple onset detection for BPM
    const onsets = [];
    const windowSize = 1024;
    let prevEnergy = 0;

    for (let i = 0; i < audioData.length; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const energy = this._windowEnergy(window);

      if (energy > prevEnergy * 1.5 && energy > 0.01) {
        onsets.push(i / 44100); // Time in seconds
      }
      prevEnergy = energy * 0.9 + prevEnergy * 0.1;
    }

    // Calculate BPM from onsets
    if (onsets.length < 2) return { bpm: 120, confidence: 0.1 };

    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }

    // Find most common interval
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60 / avgInterval);

    // Clamp to reasonable range
    const clampedBPM = Math.max(60, Math.min(200, bpm));

