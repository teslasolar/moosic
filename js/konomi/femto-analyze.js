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
