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
