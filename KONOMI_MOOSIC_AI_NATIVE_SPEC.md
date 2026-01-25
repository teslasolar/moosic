# 🎵 KONOMI MOOSIC AI-NATIVE SPEC 🎵
## Full-Stack Generative Music/Video/Commercial Platform
## WebLLM-Powered | Browser-Native | No Backend Required

---

## 📦 LEGEND
```
🧊=BlockArray  🎲=Cube  🧠=FemtoLLM  ⚡=eVGPU  🎵=Track  📡=GitHub Pages
🤖=WebLLM  🎬=VideoGen  🎼=SongGen  📺=CommercialGen  🎨=ImageGen
```

---

## 🧬 LAYER 0: META-STANDARD (KONOMI MOOSIC Extension)

```
MOOSIC_STD={
  id:"KONOMI-MOOSIC-v2",
  scope:"AI-native music/video generation + hosting",
  udt:[Track,Song,Video,Commercial,Prompt,Model],
  hierarchy:[WebLLM→Generator→Processor→Player],
  states:[Idle,Generating,Processing,Complete,Error],
  entities:[SongGen,VideoGen,CommercialGen,Player],
  relations:[Prompt→Generator→Output→Player],
  crosswalk:{KONOMI_BASE:direct,ISA-88:PackML_states}
}
```

---

## 🤖 LAYER 1: WebLLM Integration

### UDT:WebLLM_Config
```javascript
WebLLM={
  models:{
    text:"Llama-3.1-8B-Instruct-q4f16_1-MLC",      // lyrics/scripts
    code:"Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC", // music code
    vision:"Phi-3.5-vision-instruct-q4f16_1-MLC"  // image analysis
  },
  runtime:"@mlc-ai/web-llm",
  backend:"WebGPU|WebGL|WASM",
  cache:"IndexedDB",
  quantization:"q4f16_1"  // 4-bit for browser
}
```

### WebLLM Engine
```javascript
class KonomiWebLLM {
  engine=null
  models={}
  loaded=false

  async init(modelId) {
    const {CreateMLCEngine}=await import('@anthropic-ai/web-llm')
    this.engine=await CreateMLCEngine(modelId,{
      initProgressCallback:(p)=>console.log(`Loading: ${p.progress*100}%`)
    })
    this.loaded=true
  }

  async generate(prompt,opts={}) {
    return await this.engine.chat.completions.create({
      messages:[{role:"user",content:prompt}],
      temperature:opts.temp||0.7,
      max_tokens:opts.maxTokens||2048,
      stream:opts.stream||false
    })
  }

  async generateStream(prompt,onChunk) {
    const stream=await this.generate(prompt,{stream:true})
    for await(const chunk of stream) {
      onChunk(chunk.choices[0]?.delta?.content||"")
    }
  }
}
```

---

## 🎼 LAYER 2: Song Generation

### UDT:SongRequest
```javascript
SongRequest={
  style:str,         // "trap","pop","rock","EDM",...
  mood:str,          // "hype","chill","sad","angry",...
  topic:str,         // "shawarma","love","party",...
  duration:30-300,   // seconds
  bpm:60-200,
  key:str,           // "C major","A minor",...
  structure:str,     // "verse-chorus-verse-chorus-bridge-chorus"
  customLyrics:str|null,
  referenceTrack:url|null
}
```

### UDT:SongOutput
```javascript
SongOutput={
  id:UUID,
  lyrics:str,
  structure:[{section,start,end,lyrics}],
  chords:[{time,chord}],
  melody:{notes:[],rhythm:[]},
  audioUrl:str,      // generated audio blob URL
  midiUrl:str,       // MIDI file
  metadata:{bpm,key,duration,genre}
}
```

### 🎼 SongGen Engine
```javascript
class SongGen {
  llm:KonomiWebLLM
  femto:FemtoLLM
  audioCtx:AudioContext

  GENRES=['trap','pop','rock','EDM','hiphop','rnb','country','jazz','metal','ambient']
  STRUCTURES={
    pop:"intro-verse-chorus-verse-chorus-bridge-chorus-outro",
    trap:"intro-verse-hook-verse-hook-bridge-hook-outro",
    edm:"intro-buildup-drop-breakdown-buildup-drop-outro"
  }

  async generateLyrics(request) {
    const prompt=`Write ${request.style} song lyrics about "${request.topic}".
Mood: ${request.mood}
Structure: ${request.structure}
Include: catchy hook, verses, bridge
Format: [Section] followed by lyrics

Example:
[Verse 1]
Line 1
Line 2

[Chorus]
Hook line
...`
    return await this.llm.generate(prompt)
  }

  async generateMelody(lyrics,opts) {
    // Use Web Audio API + algorithmic composition
    const notes=this._analyzeLyricRhythm(lyrics)
    const melody=this._generateMelodicContour(notes,opts.key,opts.scale)
    return this._melodyToMidi(melody)
  }

  async generateAudio(melody,opts) {
    // Synthesize using Web Audio API
    const synth=new this.Synthesizer(this.audioCtx)
    return await synth.render(melody,opts)
  }

  async fullGeneration(request) {
    const lyrics=await this.generateLyrics(request)
    const melody=await this.generateMelody(lyrics,request)
    const audio=await this.generateAudio(melody,request)
    return {lyrics,melody,audio,metadata:request}
  }
}
```

### Lyrics Prompt Templates
```javascript
LYRIC_TEMPLATES={
  hype:`Write intense, energetic lyrics. Short punchy lines.
        Heavy bass emphasis. Ad-libs: "yeah!", "let's go!", "uh!"`,

  chill:`Write relaxed, flowing lyrics. Longer melodic phrases.
         Smooth transitions. Imagery: sunset, waves, night sky`,

  commercial:`Write catchy, memorable lyrics. Brand-friendly.
              Repeat product name 3x in chorus. Call to action.`,

  anthem:`Write unifying, powerful lyrics. Crowd singalong parts.
          Build to epic climax. Repetitive memorable hook.`
}
```

---

## 🎬 LAYER 3: Video Generation

### UDT:VideoRequest
```javascript
VideoRequest={
  type:"musicVideo"|"commercial"|"lyricVideo"|"visualizer",
  duration:int,           // seconds
  aspectRatio:"16:9"|"9:16"|"1:1",
  style:str,              // "anime","realistic","abstract","retro"
  scenes:[SceneRequest],
  audio:AudioSource,
  text:[TextOverlay],
  transitions:str         // "cut","fade","zoom","glitch"
}
```

### UDT:SceneRequest
```javascript
SceneRequest={
  prompt:str,             // image generation prompt
  duration:int,           // seconds
  motion:str,             // "pan-left","zoom-in","static","parallax"
  effects:[str],          // ["glow","particles","blur"]
  syncTo:"beat"|"lyrics"|"time"
}
```

### 🎬 VideoGen Engine
```javascript
class VideoGen {
  llm:KonomiWebLLM
  canvas:OffscreenCanvas
  encoder:VideoEncoder
  evgpu:eVGPU

  async generateScene(prompt,opts) {
    // Use WebLLM vision model for scene description
    // Then render with Canvas/WebGL
    const sceneDesc=await this.llm.generate(
      `Describe visual scene for: "${prompt}".
       Style: ${opts.style}. Include colors, composition, mood.`
    )
    return this._renderScene(sceneDesc,opts)
  }

  async generateLyricVideo(song,opts) {
    const frames=[]
    for(const section of song.structure) {
      const bg=await this._generateBackground(section,opts.style)
      const textFrames=this._animateText(section.lyrics,opts)
      frames.push(...this._compositeFrames(bg,textFrames))
    }
    return this._encodeVideo(frames,song.audio)
  }

  async generateMusicVideo(song,scenes) {
    const syncedScenes=this._syncToBeats(scenes,song.metadata.bpm)
    const rendered=await Promise.all(
      syncedScenes.map(s=>this.generateScene(s.prompt,s))
    )
    return this._assembleVideo(rendered,song.audio)
  }

  async generateVisualizer(audio) {
    // Real-time FFT visualization rendered to video
    const analyzer=this.evgpu.createAnalyzer(audio)
    return this._renderVisualizerVideo(analyzer)
  }

  _encodeVideo(frames,audio) {
    // Use WebCodecs API for encoding
    const encoder=new VideoEncoder({
      output:(chunk)=>this.chunks.push(chunk),
      error:(e)=>console.error(e)
    })
    encoder.configure({codec:'vp8',width:1920,height:1080,framerate:30})
    // ... encode frames
    return new Blob(this.chunks,{type:'video/webm'})
  }
}
```

### Video Style Presets
```javascript
VIDEO_STYLES={
  lyricVideo:{
    bg:"gradient|particles|abstract",
    textAnim:"fadeIn|typewriter|bounce|glitch",
    font:"bold-sans|script|pixel",
    colors:"mood-based"
  },
  musicVideo:{
    scenes:"ai-generated",
    transitions:"beat-synced",
    effects:"chromatic|film-grain|glow"
  },
  visualizer:{
    type:"bars|wave|circle|3d",
    colors:"frequency-mapped",
    reactive:"amplitude|frequency|both"
  },
  commercial:{
    format:"product-hero|testimonial|montage",
    cta:"end-card",
    branding:"logo-watermark"
  }
}
```

---

## 📺 LAYER 4: Commercial Generation

### UDT:CommercialRequest
```javascript
CommercialRequest={
  brand:str,              // "Shawarma King"
  product:str,            // "Garlic Sauce"
  duration:15|30|60,      // seconds
  style:str,              // "hype","funny","emotional","luxury"
  targetAudience:str,
  callToAction:str,
  includeJingle:bool,
  includeSong:bool,
  voiceover:bool,
  scenes:[CommercialScene]
}
```

### UDT:CommercialScene
```javascript
CommercialScene={
  type:"product-shot"|"lifestyle"|"testimonial"|"text"|"logo",
  duration:int,
  script:str,             // voiceover text
  visual:str,             // scene description
  audio:str               // bg music/sfx
}
```

### 📺 CommercialGen Engine
```javascript
class CommercialGen {
  songGen:SongGen
  videoGen:VideoGen
  llm:KonomiWebLLM

  async generateScript(request) {
    const prompt=`Write a ${request.duration}s commercial script for ${request.brand}.
Product: ${request.product}
Style: ${request.style}
Target: ${request.targetAudience}
CTA: ${request.callToAction}

Format:
[SCENE 1 - Xs]
Visual: description
Audio: music/sfx
VO: voiceover text

Include hook in first 3 seconds. End with CTA and logo.`
    return await this.llm.generate(prompt)
  }

  async generateJingle(request) {
    return await this.songGen.fullGeneration({
      style:"commercial-jingle",
      mood:"catchy",
      topic:request.brand,
      duration:request.duration,
      customLyrics:`${request.brand}! ${request.callToAction}`
    })
  }

  async generateFull(request) {
    const script=await this.generateScript(request)
    const jingle=request.includeJingle?await this.generateJingle(request):null
    const scenes=this._parseScriptToScenes(script)
    const video=await this.videoGen.generateMusicVideo(
      jingle||{audio:null},
      scenes.map(s=>({prompt:s.visual,...s}))
    )
    return {script,jingle,video}
  }
}

// Commercial Templates
COMMERCIAL_TEMPLATES={
  food:{
    hook:"Close-up sizzling shot",
    body:"Happy customers, product prep",
    cta:"Visit us today!",
    jingleStyle:"upbeat-catchy"
  },
  tech:{
    hook:"Problem statement",
    body:"Solution demo, features",
    cta:"Download now!",
    jingleStyle:"modern-electronic"
  },
  local:{
    hook:"Community connection",
    body:"Behind the scenes, team",
    cta:"Support local!",
    jingleStyle:"warm-acoustic"
  }
}
```

---

## 🧊 LAYER 5: KONOMI Core Integration

### BlockArray for Generation Queue
```javascript
class GenerationBlockArray extends BlockArray {
  dims=[10,10,10]  // 1000 generation slots

  queue(request,type) {
    const coord=this._hashToCoord(request.id)
    this.set(coord.x,coord.y,coord.z,{
      request,
      type,         // 'song'|'video'|'commercial'
      status:'queued',
      progress:0,
      result:null
    })
    return coord
  }

  async processAt(x,y,z) {
    const job=this.get(x,y,z)
    job.status='processing'

    switch(job.type) {
      case 'song': job.result=await songGen.fullGeneration(job.request); break
      case 'video': job.result=await videoGen.generateMusicVideo(job.request); break
      case 'commercial': job.result=await commercialGen.generateFull(job.request); break
    }

    job.status='complete'
    job.progress=100
    return job.result
  }
}
```

### Cube for Parallel Generation
```javascript
class GenerationCube extends Cube {
  // 8 vertices = 8 parallel generation workers
  // Central = aggregator/mixer

  V={
    NEU:'lyrics',      // Lyric generation
    NED:'melody',      // Melody generation
    NWU:'harmony',     // Chord/harmony
    NWD:'rhythm',      // Beat/drums
    SEU:'vocals',      // Vocal synthesis
    SED:'mix',         // Audio mixing
    SWU:'video',       // Video generation
    SWD:'effects'      // Post-processing
  }

  async generateSong(request) {
    // Parallel generation across vertices
    const [lyrics,melody,harmony,rhythm]=await Promise.all([
      this.processVertex('NEU',request),
      this.processVertex('NED',request),
      this.processVertex('NWU',request),
      this.processVertex('NWD',request)
    ])

    // Sequential synthesis
    const vocals=await this.processVertex('SEU',{lyrics,melody})
    const mix=await this.processVertex('SED',{vocals,harmony,rhythm})
    const final=await this.processVertex('SWD',mix)

    // Central aggregation
    return await this.central.aggregate({lyrics,melody,harmony,rhythm,vocals,mix,final})
  }
}
```

---

## 📁 FILE STRUCTURE

```
moosic-ai/
├── index.html                 # Main UI
├── css/
│   └── style.css              # Theming
├── js/
│   ├── app.js                 # Main app
│   ├── konomi/
│   │   ├── evgpu.js           # CPU processing
│   │   ├── femto.js           # 16d analyzer
│   │   ├── blockarray.js      # Job queue grid
│   │   ├── cube.js            # Parallel workers
│   │   └── system.js          # Controller
│   ├── generators/
│   │   ├── webllm.js          # WebLLM wrapper
│   │   ├── song-gen.js        # Song generation
│   │   ├── video-gen.js       # Video generation
│   │   ├── commercial-gen.js  # Commercial generation
│   │   └── templates.js       # Prompt templates
│   ├── audio/
│   │   ├── synthesizer.js     # Web Audio synth
│   │   ├── midi.js            # MIDI handling
│   │   └── effects.js         # Audio effects
│   └── video/
│       ├── renderer.js        # Canvas/WebGL
│       ├── encoder.js         # WebCodecs
│       └── visualizer.js      # FFT viz
├── models/                    # Cached WebLLM models
├── media/
│   ├── playlist.json
│   └── generated/             # Output folder
└── .nojekyll
```

---

## 🚀 QUICK START

```javascript
// Initialize AI-native MOOSIC
const moosic=new MoosicAI()
await moosic.init()

// Load WebLLM (first time downloads model)
await moosic.loadModel('Llama-3.1-8B-Instruct-q4f16_1-MLC')

// Generate a song
const song=await moosic.generateSong({
  style:'trap',
  mood:'hype',
  topic:'Shawarma King',
  duration:120,
  bpm:140
})
// → {lyrics, melody, audio, metadata}

// Generate music video
const video=await moosic.generateVideo({
  type:'lyricVideo',
  song:song,
  style:'neon-retro'
})
// → Blob (video/webm)

// Generate commercial
const commercial=await moosic.generateCommercial({
  brand:'Shawarma King',
  product:'Garlic Sauce',
  duration:30,
  style:'funny',
  includeJingle:true
})
// → {script, jingle, video}

// Play it
moosic.player.load(song.audio)
moosic.player.play()
```

---

## 🎨 UI: Generation Panel

```html
<div class="gen-panel">
  <div class="gen-tabs">
    <button data-tab="song">🎼 Song</button>
    <button data-tab="video">🎬 Video</button>
    <button data-tab="commercial">📺 Commercial</button>
  </div>

  <div class="gen-form" id="songForm">
    <select id="style">trap|pop|rock|EDM|...</select>
    <select id="mood">hype|chill|sad|angry|...</select>
    <input id="topic" placeholder="What's the song about?">
    <input id="bpm" type="range" min="60" max="200">
    <textarea id="customLyrics" placeholder="Optional: your lyrics"></textarea>
    <button onclick="generateSong()">🎵 Generate Song</button>
  </div>

  <div class="gen-progress" id="progress">
    <div class="progress-bar"></div>
    <div class="progress-status">Loading model...</div>
  </div>

  <div class="gen-output" id="output">
    <!-- Generated content appears here -->
  </div>
</div>
```

---

## 📊 SPECS

```
🤖 WebLLM: Llama-3.1-8B (4-bit), browser-native, WebGPU
🎼 SongGen: lyrics+melody+audio, 30s-5min tracks
🎬 VideoGen: lyric videos, visualizers, music videos
📺 CommercialGen: scripted ads with jingles
⚡ eVGPU: FFT, synthesis, encoding (CPU)
🧊 BlockArray: Generation job queue
🎲 Cube: 8 parallel generation workers
💾 Cache: IndexedDB for models, generated content
📡 Hosting: GitHub Pages (static, no backend!)
```

---

## 🏁 DEPLOYMENT

```bash
# Clone and setup
git clone <repo>
cd moosic-ai

# Add WebLLM
npm install @anthropic-ai/web-llm
# or use CDN in index.html

# Add your media
cp songs/*.mp3 media/
# Edit media/playlist.json

# Push to GitHub Pages
git add -A
git commit -m "🎵 AI-native MOOSIC"
git push

# Enable Pages: Settings → Pages → main branch
# → https://username.github.io/moosic-ai
```

---

## 🔧 REQUIREMENTS

```
Browser: Chrome 113+ (WebGPU) or Firefox 118+
GPU: Any (uses WebGPU for LLM inference)
RAM: 8GB+ recommended (model loading)
Storage: ~4GB for cached models
Network: First load downloads model (~2-4GB)
```

---

## 🎯 GOAL

**Full AI-native music production in the browser:**
- User requests song → AI writes lyrics + melody + audio
- User requests video → AI generates synced visuals
- User requests commercial → AI scripts + jingles + renders
- All runs locally in browser via WebLLM
- No backend, no API keys, no costs
- Host on GitHub Pages for free

**"Ask for a song, get a song. No YouTube. No Spotify. Pure AI vibes."** 🎵🤖

---

## 📐 KONOMI STANDARD CROSSWALK

```
KONOMI-MOOSIC↔KONOMI-BASE:
  eVGPU=eVGPU(+FFT,+synth)
  FemtoLLM=FemtoLLM(+music_analysis)
  BlockArray=BlockArray(+job_queue)
  Cube=Cube(+parallel_gen)

KONOMI-MOOSIC↔ISA-88:
  GenerationState=PackML.StateMachine
  IDLE=IDLE
  GENERATING=EXECUTE
  COMPLETE=COMPLETE
  ERROR=ABORTED

KONOMI-MOOSIC↔WebLLM:
  KonomiWebLLM.generate=MLCEngine.chat.completions
  SongGen.generateLyrics=text_generation
  VideoGen.generateScene=vision_model
```
