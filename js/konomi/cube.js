/**
 * 🎲 Cube - 9-node processing system
 *
 * 8 vertices + 1 central node
 * Each vertex has its own FemtoLLM
 * Edges connect vertices for message passing
 *
 * Vertex naming: Cardinal directions + Up/Down
 * N=North, S=South, E=East, W=West, U=Up, D=Down
 */

class Cube {
  // 8 vertex positions
  static VERTICES = ['NEU', 'NED', 'NWU', 'NWD', 'SEU', 'SED', 'SWU', 'SWD'];

  // Edge definitions (12 edges of a cube)
  static EDGES = [
    // Top face edges
    ['NEU', 'NWU'], ['NEU', 'SEU'], ['NWU', 'SWU'], ['SEU', 'SWU'],
    // Bottom face edges
    ['NED', 'NWD'], ['NED', 'SED'], ['NWD', 'SWD'], ['SED', 'SWD'],
    // Vertical edges
    ['NEU', 'NED'], ['NWU', 'NWD'], ['SEU', 'SED'], ['SWU', 'SWD']
  ];

  // Diagonal connections (space diagonals)
  static DIAGONALS = [
    ['NEU', 'SWD'], ['NED', 'SWU'], ['NWU', 'SED'], ['NWD', 'SEU']
  ];

  // PackML states
  static STATES = {
    IDLE: 'idle',
    STARTING: 'starting',
    EXECUTE: 'execute',
    COMPLETING: 'completing',
    COMPLETE: 'complete',
    STOPPING: 'stopping',
    STOPPED: 'stopped',
    ABORTING: 'aborting',
    ABORTED: 'aborted'
  };

  constructor(id = 'cube_' + Date.now()) {
    this.id = id;

    // Create LLM at each vertex
    this.vertices = {};
    for (const v of Cube.VERTICES) {
      this.vertices[v] = new FemtoLLM();
    }

    // Central node (aggregator)
    this.central = new FemtoLLM();

    // Edge connections (can add custom connections)
    this.edges = new Map();
    for (const [a, b] of Cube.EDGES) {
      this._addEdge(a, b);
    }

    // State machine
    this.state = Cube.STATES.IDLE;
    this.stateHistory = [];

    // Message queue for inter-vertex communication
    this.messageQueue = [];

    // Processing results cache
    this.results = new Map();

    // Stats
    this.stats = {
      processedVertices: 0,
      processedCentral: 0,
      messagesPassed: 0
    };
  }

  /**
   * Add bidirectional edge
   */
  _addEdge(a, b) {
    if (!this.edges.has(a)) this.edges.set(a, []);
    if (!this.edges.has(b)) this.edges.set(b, []);

    if (!this.edges.get(a).includes(b)) {
      this.edges.get(a).push(b);
    }
    if (!this.edges.get(b).includes(a)) {
      this.edges.get(b).push(a);
    }
  }

  /**
   * Connect two vertices (add edge)
   */
  connect(source, target) {
    if (!Cube.VERTICES.includes(source) || !Cube.VERTICES.includes(target)) {
      throw new Error(`Invalid vertex: ${source} or ${target}`);
    }
    this._addEdge(source, target);
    return this;
  }

  /**
   * Connect diagonal (space diagonal of cube)
   */
  connectDiagonal(source, target) {
    this._addEdge(source, target);
    return this;
  }

  /**
   * Initialize all LLMs with eVGPU
   */
  async init(evgpu) {
    const promises = [];

    for (const v of Cube.VERTICES) {
      promises.push(this.vertices[v].init(evgpu));
    }
    promises.push(this.central.init(evgpu));

    await Promise.all(promises);
    this._setState(Cube.STATES.IDLE);

    console.log(`🎲 Cube ${this.id} initialized with 9 nodes`);
    return this;
  }

  /**
   * Set state with history tracking
   */
  _setState(newState) {
    this.stateHistory.push({
      from: this.state,
      to: newState,
      timestamp: Date.now()
    });
    this.state = newState;
  }

  /**
   * Process at specific vertex
   */
  async processVertex(vertex, input, mode = 'text') {
    if (!Cube.VERTICES.includes(vertex)) {
      throw new Error(`Invalid vertex: ${vertex}`);
    }

    this._setState(Cube.STATES.EXECUTE);

    const result = await this.vertices[vertex].proc(input, mode);
    this.stats.processedVertices++;

    this.results.set(vertex, {
      input,
      result,
      timestamp: Date.now()
    });

    this._setState(Cube.STATES.COMPLETE);
    return result;
  }

  /**
   * Process at central node (aggregator)
   */
  async processCentral(input, mode = 'text') {
    this._setState(Cube.STATES.EXECUTE);

    const result = await this.central.proc(input, mode);
    this.stats.processedCentral++;

    this.results.set('CENTRAL', {
      input,
      result,
      timestamp: Date.now()
    });

    this._setState(Cube.STATES.COMPLETE);
    return result;
  }

  /**
   * Process all vertices in parallel
   */
  async processAllVertices(input, mode = 'text') {
    this._setState(Cube.STATES.STARTING);

    const promises = Cube.VERTICES.map(async (v) => {
      return {
        vertex: v,
        result: await this.processVertex(v, input, mode)
      };
    });

    this._setState(Cube.STATES.EXECUTE);

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
