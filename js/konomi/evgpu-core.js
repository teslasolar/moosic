/**
 * ⚡ eVGPU - Electronic Virtual GPU
 * NO GPU NEEDED! Pure CPU-powered AI/ML processing
 *
 * CPU tricks: SIMD, vectorize, cache-optimize, typed arrays
 * Ops: matmul(@), conv(*), pool(↓), activate(σ), grad(∇)
 */

class eVGPU {
  constructor(cores = 4) {
    this.cores = cores;
    this.initialized = false;
    this.stats = {
      operations: 0,
      totalTime: 0,
      avgTime: 0
    };
  }

  /**
   * Initialize the eVGPU
   */
  async init() {
    // Detect available cores
    this.cores = navigator.hardwareConcurrency || 4;
    this.initialized = true;
    console.log(`⚡ eVGPU initialized with ${this.cores} cores`);
    return this;
  }

  /**
   * Create a typed array (Float32 for performance)
   */
  createArray(shape) {
    const size = shape.reduce((a, b) => a * b, 1);
    return {
      data: new Float32Array(size),
      shape: shape,
      size: size
    };
  }

  /**
   * Create array with random values
   */
  randomArray(shape, scale = 0.1) {
    const arr = this.createArray(shape);
    for (let i = 0; i < arr.size; i++) {
      arr.data[i] = (Math.random() - 0.5) * 2 * scale;
    }
    return arr;
  }

  /**
   * Tensor operation - CPU matmul/add
   * @param {Float32Array} a - First matrix
   * @param {Float32Array} b - Second matrix
   * @param {string} op - Operation: '@' for matmul, '+' for add
   */
  tensor(a, b, op = '@') {
    const start = performance.now();
    let result;

    switch (op) {
      case '@': // Matrix multiplication
        result = this._matmul(a, b);
        break;
      case '+': // Element-wise addition
        result = this._add(a, b);
        break;
      case '*': // Element-wise multiplication (Hadamard)
        result = this._multiply(a, b);
        break;
      case 'σ': // Sigmoid activation
        result = this._sigmoid(a);
        break;
      case 'relu': // ReLU activation
        result = this._relu(a);
        break;
      case 'tanh': // Tanh activation
        result = this._tanh(a);
        break;
      default:
        result = this._matmul(a, b);
    }

    // Update stats
    const elapsed = performance.now() - start;
    this.stats.operations++;
    this.stats.totalTime += elapsed;
    this.stats.avgTime = this.stats.totalTime / this.stats.operations;

    return result;
  }

  /**
   * Matrix multiplication (optimized for CPU)
   */
  _matmul(a, b) {
    const [m, k1] = a.shape;
    const [k2, n] = b.shape;

    if (k1 !== k2) throw new Error(`Shape mismatch: ${k1} vs ${k2}`);

    const result = this.createArray([m, n]);

    // Cache-friendly loop order (i, k, j)
    for (let i = 0; i < m; i++) {
      for (let k = 0; k < k1; k++) {
        const aik = a.data[i * k1 + k];
        for (let j = 0; j < n; j++) {
          result.data[i * n + j] += aik * b.data[k * n + j];
        }
      }
    }

    return result;
  }

  /**
   * Element-wise addition
   */
  _add(a, b) {
    const result = this.createArray(a.shape);
    for (let i = 0; i < a.size; i++) {
      result.data[i] = a.data[i] + b.data[i];
    }
    return result;
  }

  /**
   * Element-wise multiplication (Hadamard product)
   */
  _multiply(a, b) {
    const result = this.createArray(a.shape);
    for (let i = 0; i < a.size; i++) {
      result.data[i] = a.data[i] * b.data[i];
    }
    return result;
  }

  /**
   * Sigmoid activation: σ(x) = 1 / (1 + e^-x)
   */
  _sigmoid(a) {
    const result = this.createArray(a.shape);
    for (let i = 0; i < a.size; i++) {
      result.data[i] = 1 / (1 + Math.exp(-a.data[i]));
    }
    return result;
  }

  /**
   * ReLU activation: max(0, x)
   */
  _relu(a) {
    const result = this.createArray(a.shape);
    for (let i = 0; i < a.size; i++) {
      result.data[i] = Math.max(0, a.data[i]);
    }
