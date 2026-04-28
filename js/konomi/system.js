/**
 * 🧬 KONOMI System - Main Controller
 *
 * Integrates: eVGPU → FemtoLLM → BlockArray → Cube
 * For MOOSIC: Music processing pipeline
 */

class KonomiSystem {
  constructor(config = {}) {
    this.config = {
      blockArraySize: config.blockArraySize || [10, 10, 10],
      autoInit: config.autoInit !== false,
      ...config
    };

    // Core components
    this.evgpu = null;
    this.blockArray = null;
    this.cubes = new Map();

    // State
    this.initialized = false;
    this.startTime = null;

    // Events
    this.listeners = new Map();
  }

  /**
   * Initialize the system
   */
  async init() {
    this.startTime = performance.now();

    console.log('🧬 KONOMI System initializing...');

    // 1. Initialize eVGPU
    this.evgpu = new eVGPU();
    await this.evgpu.init();
    this._emit('evgpu:ready', this.evgpu.getStats());

    // 2. Create main BlockArray
    this.blockArray = new BlockArray(this.config.blockArraySize);
    this._emit('blockarray:ready', this.blockArray.getStats());

    // 3. Create default cube
    const mainCube = this.createCube('main');
    await mainCube.init(this.evgpu);
    this._emit('cube:ready', mainCube.getInfo());

    this.initialized = true;

    const elapsed = performance.now() - this.startTime;
    console.log(`🧬 KONOMI System ready in ${elapsed.toFixed(1)}ms`);

    this._emit('system:ready', this.getStatus());

    return this;
  }

  /**
   * Create a new BlockArray
   */
  createBlockArray(id, dimensions = [10, 10, 10]) {
    const arr = new BlockArray(dimensions);
    return arr;
  }

  /**
   * Create a new Cube
   */
  createCube(id) {
    const cube = new Cube(id);
    this.cubes.set(id, cube);
    return cube;
  }

  /**
   * Get cube by ID
   */
  getCube(id) {
    return this.cubes.get(id);
  }

  /**
   * Process music track through the system
   */
  async processTrack(trackData) {
    if (!this.initialized) {
      throw new Error('KONOMI System not initialized');
    }

    const start = performance.now();

    // Get main cube
    const cube = this.getCube('main');

    // Process through cube's music pipeline
    const result = await cube.processTrack(trackData);

    // Store in BlockArray at a coordinate based on hash
    const coord = this._trackToCoord(trackData.name || 'unknown');
    this.blockArray.set(coord.x, coord.y, coord.z, 1);

    const elapsed = performance.now() - start;

    return {
      ...result,
      processingTimeMs: elapsed,
      storedAt: coord,
      systemStats: this.getStatus()
    };
  }

  /**
   * Process audio data through eVGPU
   */
  async processAudio(audioData) {
    if (!this.initialized) {
      throw new Error('KONOMI System not initialized');
    }

    // Get FFT
    const fftResult = this.evgpu.fft(new Float32Array(audioData));
    const magnitude = this.evgpu.getMagnitude(fftResult);

    // Pool to manageable size
    const pooled = this.evgpu.avgPool(magnitude, 4);

    // Create FemtoLLM for analysis
    const femto = new FemtoLLM();
    await femto.init(this.evgpu);

    // Process
    const analysis = await femto.proc(pooled, 'audio');

    return {
      fftSize: fftResult.real.length,
      magnitudeSize: magnitude.length,
      pooledSize: pooled.length,
      analysis: analysis
    };
  }

  /**
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
