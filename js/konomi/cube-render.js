    const results = await Promise.all(promises);

    this._setState(Cube.STATES.COMPLETE);

    return results;
  }

  /**
   * Pass message between connected vertices
   */
  async passMessage(source, target, message) {
    if (!this.edges.get(source)?.includes(target)) {
      throw new Error(`No edge between ${source} and ${target}`);
    }

    // Process through source
    const sourceResult = await this.processVertex(source, message, 'text');

    // Transform message
    const transformedMessage = sourceResult.response || JSON.stringify(sourceResult);

    // Process through target
    const targetResult = await this.processVertex(target, transformedMessage, 'text');

    this.stats.messagesPassed++;

    return {
      source: { vertex: source, result: sourceResult },
      target: { vertex: target, result: targetResult },
      message: transformedMessage
    };
  }

  /**
   * Flood message to all vertices from a source
   */
  async floodMessage(source, message) {
    const visited = new Set([source]);
    const queue = [[source, message, 0]];
    const results = [];

    // BFS flood
    while (queue.length > 0) {
      const [current, msg, depth] = queue.shift();

      const result = await this.processVertex(current, msg, 'text');
      results.push({
        vertex: current,
        depth,
        result
      });

      // Add neighbors to queue
      const neighbors = this.edges.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([neighbor, result.response || msg, depth + 1]);
        }
      }
    }

    return results;
  }

  /**
   * Aggregate results at central node
   */
  async aggregate(vertexResults) {
    // Combine all vertex results into a summary
    const summary = vertexResults.map(r => {
      const res = r.result || r;
      return `${r.vertex || 'V'}: ${res.genre || res.mood || res.response || 'ok'}`;
    }).join(' | ');

    // Process through central
    return await this.processCentral(`AGGREGATE: ${summary}`, 'text');
  }

  /**
   * Music-specific: Process track through cube
   * Each vertex analyzes different aspect
   */
  async processTrack(trackData) {
    const aspects = {
      NEU: { mode: 'analyze', focus: 'genre' },
      NED: { mode: 'analyze', focus: 'mood' },
      NWU: { mode: 'analyze', focus: 'energy' },
      NWD: { mode: 'analyze', focus: 'tempo' },
      SEU: { mode: 'text', focus: 'title' },
      SED: { mode: 'text', focus: 'artist' },
      SWU: { mode: 'text', focus: 'vibes' },
      SWD: { mode: 'text', focus: 'recommendation' }
    };

    const results = {};

    this._setState(Cube.STATES.EXECUTE);

    // Process each aspect in parallel
    const promises = Object.entries(aspects).map(async ([vertex, config]) => {
      const input = config.mode === 'analyze'
        ? trackData
        : `${config.focus}: ${trackData.name || ''} by ${trackData.artist || ''}`;

      const result = await this.processVertex(vertex, input, config.mode);

      return { vertex, focus: config.focus, result };
    });

    const processed = await Promise.all(promises);

    for (const p of processed) {
      results[p.focus] = p.result;
    }

    // Aggregate at central
    const aggregated = await this.aggregate(processed);

    this._setState(Cube.STATES.COMPLETE);

    return {
      track: trackData.name,
      artist: trackData.artist,
      analysis: results,
      aggregated: aggregated,
      cubeId: this.id
    };
  }

  /**
   * Get vertex connections
   */
  getConnections(vertex) {
    return this.edges.get(vertex) || [];
  }

  /**
   * Get all vertex states
   */
  getStatus() {
    const vertexStatus = {};

    for (const v of Cube.VERTICES) {
      const cached = this.results.get(v);
      vertexStatus[v] = {
        ready: this.vertices[v].ready,
        lastResult: cached?.result,
        lastProcessed: cached?.timestamp
      };
    }

    return {
      id: this.id,
      state: this.state,
      vertices: vertexStatus,
      central: {
        ready: this.central.ready,
        lastResult: this.results.get('CENTRAL')?.result
      },
      stats: this.stats,
      stateHistory: this.stateHistory.slice(-10)
    };
  }

  /**
   * Reset cube state
   */
  reset() {
    this._setState(Cube.STATES.STOPPING);
    this.results.clear();
    this.messageQueue = [];
    this.stats = {
      processedVertices: 0,
      processedCentral: 0,
      messagesPassed: 0
    };
    this._setState(Cube.STATES.IDLE);
    return this;
  }

  /**
   * Get info about the cube
   */
  getInfo() {
    return {
      id: this.id,
      vertices: Cube.VERTICES,
      edges: Cube.EDGES.length,
      diagonals: Cube.DIAGONALS.length,
      customConnections: this.edges.size,
      state: this.state,
      nodesTotal: 9
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cube;
}
