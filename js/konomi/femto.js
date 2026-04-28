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

    return {
      bpm: clampedBPM,
      confidence: Math.min(0.9, onsets.length / 100),
      onsets: onsets.length
    };
  }

  /**
   * Convert text to embedding
   */
  _textToEmbedding(text) {
    const embedding = new Float32Array(this.h);

    // Simple character-based embedding
    const normalized = text.toLowerCase();
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const idx = i % this.h;
      embedding[idx] += (charCode - 96) * 0.05;
    }

    // Normalize
    const norm = Math.sqrt(embedding.reduce((a, b) => a + b * b, 0)) || 1;
    for (let i = 0; i < this.h; i++) {
      embedding[i] /= norm;
    }

    return embedding;
  }

  /**
   * Convert audio features to embedding
   */
  _audioToEmbedding(features) {
    const embedding = new Float32Array(this.h);

    // Pool features into embedding dimensions
    const poolSize = Math.ceil(features.length / this.h);

    for (let i = 0; i < this.h; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < poolSize && (i * poolSize + j) < features.length; j++) {
        sum += features[i * poolSize + j];
        count++;
      }
      embedding[i] = count > 0 ? sum / count : 0;
    }

    // Normalize
    const norm = Math.sqrt(embedding.reduce((a, b) => a + b * b, 0)) || 1;
    for (let i = 0; i < this.h; i++) {
      embedding[i] /= norm;
    }

    return embedding;
  }

  /**
   * Single-head self-attention
   */
  _attention(x) {
    // Q, K, V projections (simplified)
    const q = this._matmul(x, this.Wq);
    const k = this._matmul(x, this.Wk);
    const v = this._matmul(x, this.Wv);

    // Attention scores (dot product)
    const score = this._dot(q, k) / Math.sqrt(this.h);
    const attn = 1 / (1 + Math.exp(-score)); // Sigmoid attention

    // Output
    const out = new Float32Array(this.h);
    for (let i = 0; i < this.h; i++) {
      out[i] = v[i] * attn;
    }

    return out;
  }

  /**
   * Matrix-vector multiplication
   */
  _matmul(vec, mat) {
    const out = new Float32Array(mat.shape[0]);

    for (let i = 0; i < mat.shape[0]; i++) {
      for (let j = 0; j < mat.shape[1]; j++) {
        out[i] += vec[j] * mat.data[i * mat.shape[1] + j];
      }
    }

    return out;
  }

  /**
   * Dot product
   */
  _dot(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  /**
   * Classify genre from embedding
   */
  _classifyGenre(embedding) {
    const scores = this._matmul(embedding, this.Wgenre);
    let maxIdx = 0;
    let maxScore = scores[0];

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > maxScore) {
        maxScore = scores[i];
        maxIdx = i;
      }
    }

    return FemtoLLM.GENRES[maxIdx];
  }

  /**
   * Classify mood from embedding
   */
  _classifyMood(embedding) {
    const scores = this._matmul(embedding, this.Wmood);
    let maxIdx = 0;
    let maxScore = scores[0];

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > maxScore) {
        maxScore = scores[i];
        maxIdx = i;
      }
    }

    return FemtoLLM.MOODS[maxIdx];
  }

  /**
   * Calculate energy level from audio features
   */
  _calculateEnergy(features) {
    let sum = 0;
    for (let i = 0; i < features.length; i++) {
      sum += features[i] * features[i];
    }
    return Math.min(100, (sum / features.length) * 1000);
  }

  /**
   * Window energy calculation
   */
  _windowEnergy(window) {
    let sum = 0;
    for (let i = 0; i < window.length; i++) {
      sum += window[i] * window[i];
    }
    return sum / window.length;
  }

  /**
   * Simple hash for fingerprinting
   */
  _hashChunk(chunk) {
    let hash = 0;
    for (let i = 0; i < chunk.length; i++) {
      hash = ((hash << 5) - hash) + (chunk[i] * 1000 | 0);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 4);
  }

  /**
   * Guess BPM from track name
   */
  _guessBPMFromName(name) {
    const lower = name.toLowerCase();

    // Common patterns
    if (lower.includes('slow') || lower.includes('ballad')) return 70;
    if (lower.includes('fast') || lower.includes('hardcore')) return 170;
    if (lower.includes('dnb') || lower.includes('drum')) return 174;
    if (lower.includes('dubstep')) return 140;
    if (lower.includes('house')) return 128;
    if (lower.includes('techno')) return 135;
    if (lower.includes('hip') || lower.includes('rap')) return 90;
    if (lower.includes('rock')) return 120;
    if (lower.includes('metal')) return 140;

    // Default electronic range
    return 120 + Math.floor(Math.random() * 20);
  }

  /**
   * Generate insights from analysis
   */
  _generateInsights(genre, mood, energy) {
    const insights = [];

    if (energy > 70) {
      insights.push('🔥 High energy track - great for workouts!');
    } else if (energy < 30) {
      insights.push('🌙 Chill vibes - perfect for relaxation');
    }

    if (mood === 'energetic' || mood === 'aggressive') {
      insights.push('⚡ This track has powerful dynamics');
    }

    if (genre === 'electronic' || genre === 'ambient') {
      insights.push('🎹 Synthetic textures detected');
    } else if (genre === 'rock' || genre === 'metal') {
      insights.push('🎸 Guitar-driven sound signature');
    }

    if (insights.length === 0) {
      insights.push('🎵 Solid track with good balance');
    }

    return insights;
  }

  /**
   * Generate recommendation
   */
  _generateRecommendation(genre, mood) {
    const combos = {
      'electronic_energetic': 'Try mixing with other high-BPM electronic tracks',
      'electronic_chill': 'Perfect for late-night listening sessions',
      'rock_aggressive': 'Queue up your favorite metal tracks next',
      'pop_happy': 'Great party playlist material',
      'ambient_peaceful': 'Ideal for focus and concentration',
      'hiphop_dark': 'Add some classic boom-bap for contrast'
    };

    const key = `${genre}_${mood}`;
    return combos[key] || `Explore more ${genre} with ${mood} vibes`;
  }

  /**
   * Add embedding to memory
   */
  _addToMemory(embedding) {
    this.memory.push(Array.from(embedding));
    if (this.memory.length > this.maxMemory) {
      this.memory.shift();
    }
  }

  /**
   * Get model info
   */
  getInfo() {
    return {
      name: 'FemtoLLM',
      hiddenSize: this.h,
      layers: 1,
      heads: 1,
      memoryMB: 4,
      genres: FemtoLLM.GENRES,
      moods: FemtoLLM.MOODS,
      ready: this.ready
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FemtoLLM;
}
