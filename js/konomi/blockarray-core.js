/**
 * 🧊 BlockArray - 1000³ 3D compute grid
 *
 * Sparse storage for efficient memory usage
 * LLM instances at coordinates
 * For music: 3D spatial audio mapping
 */

class BlockArray {
  constructor(dimensions = [10, 10, 10]) {
    this.dimensions = dimensions;
    this.size = dimensions.reduce((a, b) => a * b, 1);

    // Sparse storage (only store non-zero values)
    this.data = new Map();

    // LLM instances at coordinates
    this.llms = new Map();

    // Metadata
    this.created = Date.now();
    this.modified = Date.now();
    this.accessCount = 0;
  }

  /**
   * Get coordinate key for Map storage
   */
  _key(x, y, z) {
    return `${x},${y},${z}`;
  }

  /**
   * Validate coordinates
   */
  _validateCoords(x, y, z) {
    return (
      x >= 0 && x < this.dimensions[0] &&
      y >= 0 && y < this.dimensions[1] &&
      z >= 0 && z < this.dimensions[2]
    );
  }

  /**
   * Set value at coordinate
   */
  set(x, y, z, value) {
    if (!this._validateCoords(x, y, z)) {
      throw new Error(`Coordinates out of bounds: (${x}, ${y}, ${z})`);
    }

    const key = this._key(x, y, z);

    if (value === 0 || value === null || value === undefined) {
      // Remove from sparse storage if zero
      this.data.delete(key);
    } else {
      this.data.set(key, value);
    }

    this.modified = Date.now();
    return this;
  }

  /**
   * Get value at coordinate
   */
  get(x, y, z) {
    if (!this._validateCoords(x, y, z)) {
      throw new Error(`Coordinates out of bounds: (${x}, ${y}, ${z})`);
    }

    this.accessCount++;
    const key = this._key(x, y, z);
    return this.data.get(key) || 0;
  }

  /**
   * Set multiple values at once (batch operation)
   */
  setBatch(coords) {
    for (const [x, y, z, value] of coords) {
      this.set(x, y, z, value);
    }
    return this;
  }

  /**
   * Get LLM at coordinate (creates if doesn't exist)
   */
  llmAt(x, y, z, femtoClass = null) {
    if (!this._validateCoords(x, y, z)) {
      throw new Error(`Coordinates out of bounds: (${x}, ${y}, ${z})`);
    }

    const key = this._key(x, y, z);

    if (!this.llms.has(key)) {
      // Create new FemtoLLM instance
      const llm = femtoClass ? new femtoClass() : new FemtoLLM();
      this.llms.set(key, llm);
    }

    return this.llms.get(key);
  }

  /**
   * Process through LLM at coordinate
   */
  async processAt(x, y, z, input, mode = 'text') {
    const llm = this.llmAt(x, y, z);
    return await llm.proc(input, mode);
  }

  /**
   * Get face (2D slice of the array)
   * Face: 'xy', 'xz', or 'yz'
   */
  getFace(face, index) {
    const result = [];

    switch (face) {
      case 'xy':
        for (let x = 0; x < this.dimensions[0]; x++) {
          for (let y = 0; y < this.dimensions[1]; y++) {
            result.push({
              coord: [x, y, index],
              value: this.get(x, y, index)
            });
          }
        }
        break;
      case 'xz':
        for (let x = 0; x < this.dimensions[0]; x++) {
          for (let z = 0; z < this.dimensions[2]; z++) {
            result.push({
              coord: [x, index, z],
              value: this.get(x, index, z)
            });
          }
        }
        break;
      case 'yz':
        for (let y = 0; y < this.dimensions[1]; y++) {
          for (let z = 0; z < this.dimensions[2]; z++) {
            result.push({
              coord: [index, y, z],
              value: this.get(index, y, z)
            });
          }
