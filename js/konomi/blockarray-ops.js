        }
        break;
    }

    return result;
  }

  /**
   * Process entire face through LLMs
   * Good for parallel music analysis
   */
  async processFace(face, index, input, mode = 'text') {
    const faceData = this.getFace(face, index);
    const results = [];

    for (const { coord } of faceData) {
      const [x, y, z] = coord;
      const result = await this.processAt(x, y, z, input, mode);
      results.push({ coord, result });
    }

    return results;
  }

  /**
   * Interlock operation - process 1M cubes (face × face)
   */
  async interlock(faceA, indexA, faceB, indexB, operation) {
    const dataA = this.getFace(faceA, indexA);
    const dataB = this.getFace(faceB, indexB);

    const results = [];

    // Combine faces
    for (const a of dataA) {
      for (const b of dataB) {
        const combined = operation(a.value, b.value);
        results.push({
          coordA: a.coord,
          coordB: b.coord,
          result: combined
        });
      }
    }

    return {
      operation: 'interlock',
      faceA: { face: faceA, index: indexA, count: dataA.length },
      faceB: { face: faceB, index: indexB, count: dataB.length },
      totalOperations: results.length,
      sampleResults: results.slice(0, 10)
    };
  }

  /**
   * Get neighbors of a coordinate
   */
  getNeighbors(x, y, z, includeCorners = false) {
    const neighbors = [];
    const offsets = includeCorners
      ? [
          [-1, -1, -1], [-1, -1, 0], [-1, -1, 1],
          [-1, 0, -1], [-1, 0, 0], [-1, 0, 1],
          [-1, 1, -1], [-1, 1, 0], [-1, 1, 1],
          [0, -1, -1], [0, -1, 0], [0, -1, 1],
          [0, 0, -1], [0, 0, 1],
          [0, 1, -1], [0, 1, 0], [0, 1, 1],
          [1, -1, -1], [1, -1, 0], [1, -1, 1],
          [1, 0, -1], [1, 0, 0], [1, 0, 1],
          [1, 1, -1], [1, 1, 0], [1, 1, 1]
        ]
      : [
          [-1, 0, 0], [1, 0, 0],
          [0, -1, 0], [0, 1, 0],
          [0, 0, -1], [0, 0, 1]
        ];

    for (const [dx, dy, dz] of offsets) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;

      if (this._validateCoords(nx, ny, nz)) {
        neighbors.push({
          coord: [nx, ny, nz],
          value: this.get(nx, ny, nz)
        });
      }
    }

    return neighbors;
  }

  /**
   * Clear all data
   */
  clear() {
    this.data.clear();
    this.llms.clear();
    this.modified = Date.now();
    return this;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      dimensions: this.dimensions,
      totalCapacity: this.size,
      activeValues: this.data.size,
      activeLLMs: this.llms.size,
      sparsity: 1 - (this.data.size / this.size),
      memoryEstimateMB: ((this.data.size * 8 + this.llms.size * 4096) / 1024 / 1024).toFixed(2),
      accessCount: this.accessCount,
      created: new Date(this.created).toISOString(),
      modified: new Date(this.modified).toISOString()
    };
  }

  /**
   * Export to JSON
   */
  toJSON() {
    return {
      dimensions: this.dimensions,
      data: Array.from(this.data.entries()),
      created: this.created,
      modified: this.modified
    };
  }

  /**
   * Import from JSON
   */
  static fromJSON(json) {
    const arr = new BlockArray(json.dimensions);
    for (const [key, value] of json.data) {
      arr.data.set(key, value);
    }
    arr.created = json.created;
    arr.modified = json.modified;
    return arr;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlockArray;
}
