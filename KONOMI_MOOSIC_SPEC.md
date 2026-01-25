# 🎵 KONOMI MOOSIC BUILD SPEC 🎵

## 📦 LEGEND
```
🧊=BlockArray  🎲=Cube  🧠=FemtoLLM  ⚡=eVGPU  🎵=Track  📡=GitHub Pages
```

## 🏗️ MOOSIC ARCHITECTURE

### ⚡ eVGPU [Audio Processing]
```javascript
class eVGPU {
  cores=navigator.hardwareConcurrency||4
  fft(data)      // frequency analysis
  conv1d(i,k)    // audio convolution
  avgPool(d,s)   // downsample
  getMagnitude() // spectrum→bars
}
// Ops: FFT, conv1d, pool, visualizer data
```

### 🧠 FemtoLLM [Music Analyzer]
```javascript
class FemtoLLM {
  h=16 // 16-dim embeddings
  GENRES=['electronic','rock','pop','hiphop','jazz','classical','ambient','metal']
  MOODS=['energetic','chill','dark','happy','melancholic','aggressive','peaceful','uplifting']

  proc(input,mode)     // mode: 'text'|'audio'|'analyze'
  _classifyGenre(emb)  // embedding→genre
  _classifyMood(emb)   // embedding→mood
  _detectBPM(audio)    // onset detection
}
```

### 🧊 BlockArray [Track Storage]
```javascript
class BlockArray {
  dims=[10,10,10]  // 3D grid
  data=Map()       // sparse: coord→value
  llms=Map()       // coord→FemtoLLM

  set(x,y,z,v)     // store track ref
  llmAt(x,y,z)     // get analyzer at coord
  processAt(x,y,z,track) // analyze track
}
// Hash track name → 3D coordinate for storage
```

### 🎲 Cube [9-Node Analyzer]
```javascript
class Cube {
  V=['NEU','NED','NWU','NWD','SEU','SED','SWU','SWD']
  verts={v:FemtoLLM()}  // 8 vertices
  central=FemtoLLM()    // aggregator

  processTrack(t) {
    // Each vertex analyzes different aspect:
    // NEU→genre, NED→mood, NWU→energy, NWD→tempo
    // SEU→title, SED→artist, SWU→vibes, SWD→recommend
    return aggregate(results)
  }
}
```

## 📁 FILE STRUCTURE
```
moosic/
├── index.html           # Player UI
├── css/style.css        # Dark theme
├── js/
│   ├── app.js           # MoosicApp player
│   └── konomi/
│       ├── evgpu.js     # CPU audio processing
│       ├── femto.js     # 16d music analyzer
│       ├── blockarray.js # 3D track grid
│       ├── cube.js      # 9-node system
│       └── system.js    # Controller
├── media/
│   ├── playlist.json    # Track manifest
│   └── *.mp3/*.mp4      # Your files
└── .nojekyll            # Raw file serving
```

## 🎵 PLAYLIST.JSON
```json
{
  "name": "My Library",
  "tracks": [
    {"name":"Song","artist":"Me","file":"song.mp3","type":"audio"},
    {"name":"Video","artist":"Me","file":"vid.mp4","type":"video"}
  ]
}
```

## 🚀 QUICK START
```javascript
// Auto-runs on page load
const app = new MoosicApp()
await app.init()  // boots KONOMI system

// KONOMI analyzes each track:
konomi.processTrack({name, artist})
→ {genre, mood, energy, bpm, vibe, insights}

// Visualizer uses eVGPU:
evgpu.fft(audioData) → frequency bars
```

## 🎯 FEATURES
- Drag-drop MP3/MP4 upload
- Auto-load from playlist.json
- Real-time FFT visualizer
- FemtoLLM track analysis
- Keyboard: Space=play, ←→=skip, ↑↓=vol

## 📊 SPECS
```
🧠 FemtoLLM: 16d, genre/mood/BPM detection
⚡ eVGPU: FFT visualizer, 0 GPU
🧊 BlockArray: Track→3D coord mapping
🎲 Cube: 9 parallel analyzers per track
📡 GitHub Pages: Free static hosting
```

## 🏁 DEPLOY
```bash
# Add tracks
cp song.mp3 media/
# Edit media/playlist.json
# Push & enable GitHub Pages
git push origin main
# → https://user.github.io/moosic
```

---
**STACK**: Vanilla JS + Web Audio API + KONOMI + GitHub Pages
**GOAL**: Self-hosted music, no YouTube, AI-powered analysis 🎵
