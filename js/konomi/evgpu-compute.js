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
