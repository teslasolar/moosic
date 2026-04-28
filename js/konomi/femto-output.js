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
