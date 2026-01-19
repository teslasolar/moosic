# KONOMI MOOSIC

Self-hosted music & video player powered by the KONOMI System. Host your own MP3/MP4 files on GitHub Pages and play them without YouTube's nonsense.

## Features

- **Music & Video Playback** - Supports MP3, MP4, and other browser-compatible formats
- **Audio Visualizer** - Real-time frequency visualization
- **Drag & Drop** - Just drop files onto the page
- **Playlist Management** - Add, remove, shuffle, repeat
- **KONOMI Processing** - AI-powered track analysis using FemtoLLM

## KONOMI System

The player is powered by the KONOMI distributed compute system:

| Component | Description |
|-----------|-------------|
| eVGPU | CPU-based tensor operations, FFT, convolutions |
| FemtoLLM | 16-dim nano model for music analysis |
| BlockArray | 3D sparse grid for data storage |
| Cube | 9-node processing cluster (8 vertices + central) |

### Specs

- **FemtoLLM**: 16d, 1 layer, 1 head, ~4MB RAM, 0.1s/req
- **eVGPU**: 100% CPU, 0 GPU required
- **BlockArray**: Sparse storage, scales to 1000^3
- **Total footprint**: < 2GB memory

## Usage

1. Open the GitHub Pages site
2. Click "Add Media" or drag/drop MP3/MP4 files
3. Click a track to play
4. View KONOMI analysis in the processing panel

### Keyboard Shortcuts

- `Space` - Play/Pause
- `Left/Right` - Previous/Next track
- `Up/Down` - Volume control

## Deploy to GitHub Pages

1. Push to your repo
2. Go to Settings > Pages
3. Set source to main branch
4. Your player will be at `https://username.github.io/moosic`

## File Structure

```
moosic/
├── index.html          # Main player interface
├── css/
│   └── style.css       # Styles
├── js/
│   ├── app.js          # Main application
│   └── konomi/
│       ├── evgpu.js    # Electronic Virtual GPU
│       ├── femto.js    # FemtoLLM music analyzer
│       ├── blockarray.js  # 3D compute grid
│       ├── cube.js     # 9-node processor
│       └── system.js   # System controller
├── media/              # Put your MP3/MP4 files here
├── _config.yml         # GitHub Pages config
└── .nojekyll           # Disable Jekyll processing
```

## Adding Media Files

For permanent hosting, add files to the `media/` folder:

```
media/
├── song1.mp3
├── song2.mp3
└── video.mp4
```

Then reference them in a playlist JSON or add them via the UI.

## Tech Stack

- Pure vanilla JavaScript (no frameworks)
- Web Audio API for visualization
- KONOMI System for AI analysis
- GitHub Pages for hosting

## Performance Targets

- FemtoLLM: 0.1s/req, 4MB RAM
- eVGPU: 100% CPU utilization
- BlockArray: Sparse storage for 1B cubes
- Cube: 9 concurrent LLMs
- Total: < 2GB footprint

## License

MIT - Do whatever you want with it.
