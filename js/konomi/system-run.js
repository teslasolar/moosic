   * Analyze visualizer data
   */
  analyzeVisualizerData(frequencyData) {
    // Split into bands
    const bands = {
      sub: 0,      // 20-60 Hz
      bass: 0,     // 60-250 Hz
      lowMid: 0,   // 250-500 Hz
      mid: 0,      // 500-2000 Hz
      highMid: 0,  // 2000-4000 Hz
      high: 0      // 4000-20000 Hz
    };

    const len = frequencyData.length;
    const bandSize = Math.floor(len / 6);

    for (let i = 0; i < len; i++) {
      const val = frequencyData[i] / 255;
      if (i < bandSize) bands.sub += val;
      else if (i < bandSize * 2) bands.bass += val;
      else if (i < bandSize * 3) bands.lowMid += val;
      else if (i < bandSize * 4) bands.mid += val;
      else if (i < bandSize * 5) bands.highMid += val;
      else bands.high += val;
    }

    // Normalize
    for (const key in bands) {
      bands[key] = (bands[key] / bandSize) * 100;
    }

    // Overall energy
    const energy = Object.values(bands).reduce((a, b) => a + b, 0) / 6;

    return {
      bands,
      energy,
      dominant: Object.entries(bands).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    };
  }

  /**
   * Hash track name to coordinate
   */
  _trackToCoord(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }

    const [dx, dy, dz] = this.blockArray.dimensions;

    return {
      x: Math.abs(hash) % dx,
      y: Math.abs(hash >> 8) % dy,
      z: Math.abs(hash >> 16) % dz
    };
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    }
    return this;
  }

  _emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        callback(data);
      }
    }
  }

  /**
   * Get full system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      uptime: this.startTime ? (performance.now() - this.startTime) : 0,
      evgpu: this.evgpu?.getStats() || null,
      blockArray: this.blockArray?.getStats() || null,
      cubes: Array.from(this.cubes.entries()).map(([id, cube]) => ({
        id,
        info: cube.getInfo(),
        state: cube.state
      })),
      memory: this._getMemoryUsage()
    };
  }

  /**
   * Estimate memory usage
   */
  _getMemoryUsage() {
    let total = 0;

    // eVGPU: minimal
    total += 1024;

    // BlockArray
    if (this.blockArray) {
      total += this.blockArray.data.size * 8;
      total += this.blockArray.llms.size * 4096;
    }

    // Cubes (9 FemtoLLMs each, ~4KB per FemtoLLM)
    total += this.cubes.size * 9 * 4096;

    return {
      estimatedBytes: total,
      estimatedMB: (total / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Shutdown system
   */
  shutdown() {
    this.initialized = false;
    this.cubes.clear();
    this.blockArray?.clear();
    this._emit('system:shutdown', {});
    console.log('🧬 KONOMI System shutdown');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KonomiSystem;
}
