        e.preventDefault();
        this.elements.volumeBar.value = Math.min(100, parseInt(this.elements.volumeBar.value) + 5);
        this.setVolume(this.elements.volumeBar.value);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.elements.volumeBar.value = Math.max(0, parseInt(this.elements.volumeBar.value) - 5);
        this.setVolume(this.elements.volumeBar.value);
        break;
    }
  }

  /**
   * Start visualizer animation
   */
  _startVisualizer() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);

      this.analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      this.ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw bars
      const barWidth = (this.canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * this.canvas.height * 0.8;

        // Gradient based on height
        const hue = (dataHeight / this.canvas.height) * 120 + 140;
        var dataHeight = barHeight;
        this.ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

        this.ctx.fillRect(
          x,
          this.canvas.height - barHeight,
          barWidth - 1,
          barHeight
        );

        x += barWidth;
      }

      // Analyze and update KONOMI stats
      if (this.konomi && Math.random() < 0.1) {
        const analysis = this.konomi.analyzeVisualizerData(dataArray);
        this._updateKonomiStats({ energy: Math.round(analysis.energy) });
      }
    };

    draw();
  }

  /**
   * Stop visualizer animation
   */
  _stopVisualizer() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update play button
   */
  _updatePlayButton() {
    this.elements.playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
  }

  /**
   * Update now playing display
   */
  _updateNowPlaying(track) {
    this.elements.trackTitle.textContent = track.name;
    this.elements.trackArtist.textContent = track.artist;

    // Set emoji based on type
    this.elements.trackArt.textContent = track.type === 'video' ? '🎬' : '🎵';
  }

  /**
   * Update status text
   */
  _updateStatus(text) {
    this.elements.statusText.textContent = text;
  }

  /**
   * Update KONOMI stats display
   */
  _updateKonomiStats(status) {
    if (status.evgpu) {
      this.elements.evgpuStatus.textContent = `${status.evgpu.cores} cores`;
    }
    if (status.blockArray) {
      this.elements.blockStatus.textContent = `${status.blockArray.dimensions.join('×')}`;
    }
    if (status.cubes) {
      this.elements.cubeStatus.textContent = `${status.cubes.length * 9} nodes`;
    }
    if (status.energy !== undefined) {
      this.elements.femtoStatus.textContent = `Energy: ${status.energy}%`;
    }
  }

  /**
   * Update FemtoLLM output display
   */
  _updateFemtoOutput(analysis) {
    if (!analysis) {
      this.elements.femtoOutput.innerHTML = '<p>🎯 FemtoLLM Analysis: Waiting for track...</p>';
      return;
    }

    const a = analysis.analysis || analysis;
    let html = '<p>🎯 <strong>FemtoLLM Analysis:</strong></p>';

    if (a.genre) html += `<p>Genre: ${a.genre}</p>`;
    if (a.mood) html += `<p>Mood: ${a.mood}</p>`;
    if (a.energy !== undefined) html += `<p>Energy: ${a.energy}%</p>`;
    if (a.bpmEstimate) html += `<p>BPM (est): ${a.bpmEstimate}</p>`;
    if (a.vibe) html += `<p>Vibe: ${a.vibe}</p>`;

    if (analysis.insights) {
      html += '<p>---</p>';
      for (const insight of analysis.insights) {
