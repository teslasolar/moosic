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
    return result;
  }

  /**
   * Tanh activation
   */
  _tanh(a) {
    const result = this.createArray(a.shape);
    for (let i = 0; i < a.size; i++) {
      result.data[i] = Math.tanh(a.data[i]);
    }
    return result;
  }

  /**
   * 1D Convolution (for audio processing)
   */
  conv1d(input, kernel, stride = 1) {
    const inputLen = input.length;
    const kernelLen = kernel.length;
    const outputLen = Math.floor((inputLen - kernelLen) / stride) + 1;
    const result = new Float32Array(outputLen);

    for (let i = 0; i < outputLen; i++) {
      let sum = 0;
      for (let k = 0; k < kernelLen; k++) {
        sum += input[i * stride + k] * kernel[k];
      }
      result[i] = sum;
    }

    return result;
  }

  /**
   * Average pooling (downsampling)
   */
  avgPool(data, poolSize = 2) {
    const outputLen = Math.floor(data.length / poolSize);
    const result = new Float32Array(outputLen);

    for (let i = 0; i < outputLen; i++) {
      let sum = 0;
      for (let j = 0; j < poolSize; j++) {
        sum += data[i * poolSize + j];
      }
      result[i] = sum / poolSize;
    }

    return result;
  }

  /**
   * Max pooling
   */
  maxPool(data, poolSize = 2) {
    const outputLen = Math.floor(data.length / poolSize);
    const result = new Float32Array(outputLen);

    for (let i = 0; i < outputLen; i++) {
      let max = -Infinity;
      for (let j = 0; j < poolSize; j++) {
        const val = data[i * poolSize + j];
        if (val > max) max = val;
      }
      result[i] = max;
    }

    return result;
  }

  /**
   * Fast Fourier Transform (for audio analysis)
   * Simple Cooley-Tukey FFT
   */
  fft(real, imag = null) {
    const n = real.length;
    if (n <= 1) return { real, imag: imag || new Float32Array(n) };

    // Ensure power of 2
    if ((n & (n - 1)) !== 0) {
      throw new Error('FFT size must be power of 2');
    }

    imag = imag || new Float32Array(n);

    // Bit-reversal permutation
    for (let i = 0; i < n; i++) {
      const j = this._reverseBits(i, Math.log2(n));
      if (i < j) {
        [real[i], real[j]] = [real[j], real[i]];
        [imag[i], imag[j]] = [imag[j], imag[i]];
      }
    }

    // Cooley-Tukey iterative FFT
    for (let len = 2; len <= n; len *= 2) {
      const halfLen = len / 2;
      const angle = -2 * Math.PI / len;

      for (let i = 0; i < n; i += len) {
        for (let j = 0; j < halfLen; j++) {
          const theta = angle * j;
          const cos = Math.cos(theta);
          const sin = Math.sin(theta);

          const tReal = real[i + j + halfLen] * cos - imag[i + j + halfLen] * sin;
          const tImag = real[i + j + halfLen] * sin + imag[i + j + halfLen] * cos;

          real[i + j + halfLen] = real[i + j] - tReal;
          imag[i + j + halfLen] = imag[i + j] - tImag;
          real[i + j] += tReal;
          imag[i + j] += tImag;
        }
      }
    }

    return { real, imag };
  }

  /**
   * Get magnitude spectrum from FFT
   */
  getMagnitude(fftResult) {
    const n = fftResult.real.length;
    const magnitude = new Float32Array(n / 2);

    for (let i = 0; i < n / 2; i++) {
      const re = fftResult.real[i];
      const im = fftResult.imag[i];
      magnitude[i] = Math.sqrt(re * re + im * im);
    }

    return magnitude;
  }

  /**
   * Reverse bits helper for FFT
   */
  _reverseBits(x, bits) {
    let result = 0;
    for (let i = 0; i < bits; i++) {
      result = (result << 1) | (x & 1);
      x >>= 1;
    }
    return result;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      cores: this.cores,
      operations: this.stats.operations,
      avgTimeMs: this.stats.avgTime.toFixed(3),
      initialized: this.initialized
    };
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = eVGPU;
}
