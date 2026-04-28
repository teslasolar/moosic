# 🥙👑 KONOMI SHAWARMA KING AI-NATIVE SPEC 👑🥙
## Canadian YouTube Legends - Full AI Music/Video/Commercial Platform
## WebLLM-Powered | Browser-Native | No Backend

---

## 📦 LEGEND
```
🥙=Track  🧄=FemtoLLM  🔥=eVGPU  🍟=BlockArray  👑=Cube  📡=GitHub Pages
🤖=WebLLM  🎬=VideoGen  🎼=SongGen  📺=CommercialGen  🌯=JingleGen
```

---

## 🧬 SHAWARMA KING AI SYSTEM

```
SK_AI_STD={
  id:"KONOMI-SHAWARMA-KING-v1",
  scope:"AI-native Shawarma King anthem generation",
  brand:"Shawarma King 🥙👑",
  location:"Canada 🇨🇦",
  vibe:"legendary",
  features:[SongGen,VideoGen,CommercialGen,JingleGen,MemeMaker]
}
```

---

## 🤖 LAYER 1: WebLLM - The AI Chef

```javascript
class ShawarmaWebLLM extends KonomiWebLLM {
  // Specialized for Shawarma King content

  BRAND_CONTEXT=`You are creating content for Shawarma King,
    a legendary Canadian shawarma restaurant known for:
    - Amazing garlic sauce
    - Generous portions ("extra meat")
    - Late night eats
    - Loyal customer base
    - YouTube presence
    Vibe: Fun, hype, delicious, Canadian pride 🇨🇦🥙👑`

  async generate(prompt) {
    return super.generate(this.BRAND_CONTEXT + "\n\n" + prompt)
  }
}
```

---

## 🎼 LAYER 2: Shawarma Song Generator

### UDT:ShawarmaTrack
```javascript
ShawarmaTrack={
  type:"anthem"|"jingle"|"diss-track"|"love-song"|"hype",
  spiceLevel:1-5,        // 🌶️ rating
  garlicIntensity:1-10,  // 🧄 factor
  extras:[str],          // "extra meat","hot sauce","hummus"
  canadian:bool          // 🇨🇦 references
}
```

### 🎼 ShawarmaGen Engine
```javascript
class ShawarmaSongGen extends SongGen {

  SHAWARMA_GENRES={
    'shawarma-trap':    {bpm:140,mood:'hype',bass:'heavy'},
    'pita-pop':         {bpm:120,mood:'catchy',hooks:'melodic'},
    'garlic-grunge':    {bpm:130,mood:'raw',guitars:'distorted'},
    'hummus-house':     {bpm:128,mood:'groovy',synths:'warm'},
    'falafel-funk':     {bpm:110,mood:'smooth',bass:'funky'},
    'tahini-techno':    {bpm:135,mood:'hypnotic',arps:'rolling'},
    'kebab-core':       {bpm:160,mood:'intense',breakdowns:'heavy'},
    'wrap-wave':        {bpm:100,mood:'dreamy',pads:'lush'},
    'late-night-lofi':  {bpm:85,mood:'chill',vinyl:'crackle'}
  }

  LYRIC_THEMES={
    menu:[
      "chicken shawarma","beef shawarma","mixed plate",
      "garlic sauce","hot sauce","hummus","falafel",
      "pita bread","fries","tabbouleh","fattoush"
    ],
    vibes:[
      "late night cravings","best in the city","extra everything",
      "spinning on the spit","garlic dripping","meat piled high"
    ],
    locations:[
      "Canada","Toronto","Montreal","Vancouver","Ottawa",
      "late night spot","corner store king","neighborhood legend"
    ],
    slang:[
      "fam","wagwan","no cap","sheesh","bussin","fire",
      "on god","lowkey","highkey","certified"
    ]
  }

  async generateAnthemLyrics(opts={}) {
    const prompt=`Write a SHAWARMA KING ANTHEM 🥙👑

Style: ${opts.style||'shawarma-trap'}
Mood: HYPE, proud, legendary
Spice Level: ${opts.spiceLevel||3}/5 🌶️
Garlic: ${opts.garlicIntensity||8}/10 🧄

MUST INCLUDE:
- "Shawarma King" in chorus (repeat 3x)
- Reference to garlic sauce
- "Extra meat" somewhere
- Canadian pride 🇨🇦
- Late night vibes

STRUCTURE:
[Intro] - 4 bars, building energy
[Verse 1] - 8 bars, story of the King
[Pre-Chorus] - 4 bars, building to drop
[Chorus] - 8 bars, SHAWARMA KING hook
[Verse 2] - 8 bars, the menu/experience
[Chorus] - repeat
[Bridge] - 4 bars, garlic sauce moment
[Final Chorus] - 8 bars, biggest energy
[Outro] - 4 bars, legendary fade

Use ad-libs: "SHEESH!", "YO!", "GARLIC!", "EXTRA MEAT!", "👑"

Reference these themes:
Menu items: ${this.LYRIC_THEMES.menu.slice(0,5).join(', ')}
Vibes: ${this.LYRIC_THEMES.vibes.slice(0,3).join(', ')}
Canadian: ${this.LYRIC_THEMES.locations.slice(0,3).join(', ')}

Make it LEGENDARY. This is the official Shawarma King anthem. 🥙👑🇨🇦`

    return await this.llm.generate(prompt)
  }

  async generateJingle(duration=15) {
    const prompt=`Write a ${duration}-second JINGLE for Shawarma King.

Requirements:
- Catchy, memorable hook
- "Shawarma King" sung 2-3 times
- Rhymes
- Easy to sing along
- Upbeat and fun

Format:
🎵 [Sung lyrics here]
(notes: melody direction up/down, emphasis)

Example vibe:
🎵 Shawarma Ki-ing! (up)
🎵 Best in the ci-ty! (down)
🎵 Extra meat, extra sauce (steady)
🎵 Shawarma King! (big finish)`

    return await this.llm.generate(prompt)
  }
}
```

### Anthem Template
```javascript
SHAWARMA_ANTHEM_TEMPLATE=`
[Intro]
👑 Yeah, yeah, yeah
👑 Shawarma King, let's go!
👑 (SHEESH!)

[Verse 1]
Pull up to the spot, everybody know the name
Shawarma King, yeah we running this game
Meat on the spit, spinning all night long
Extra garlic sauce, you know we stay strong
Canadian legend, from the 6 to the coast
Every single city know we got the most
Stack it up high, yeah we never cut short
Shawarma King, this ain't no regular sport (SHEESH!)

[Pre-Chorus]
You want that extra meat? (EXTRA!)
You want that garlic heat? (GARLIC!)
You want that pita sweet? (YEAH!)
Shawarma King can't be beat!

[Chorus]
SHAWARMA KING! (what?)
SHAWARMA KING! (yeah!)
SHAWARMA KING! (👑)
Extra garlic, extra meat
Best shawarma on the street
Late night, can't be beat
SHAWARMA KING! (SHEESH!)

[Verse 2]
Chicken or beef, yeah we got both
Mixed plate legendary, that's on oath
Hummus on the side, falafel too crispy
Hot sauce dripping, yeah it's getting risky
Pita bread fresh, straight out the oven
Tabbouleh green, show the veggies some loving
From Toronto nights to the Montreal scene
Shawarma King, you know what I mean! (YO!)

[Chorus]
(repeat)

[Bridge]
🧄 That garlic sauce though... (whew!)
🧄 You know you want more... (more!)
🧄 Dripping down your wrap... (yeah!)
🧄 Shawarma King on the map! (👑)

[Final Chorus - BIGGEST ENERGY]
SHAWARMA KING! (SHAWARMA!)
SHAWARMA KING! (KING!)
SHAWARMA KING! (LEGENDARY!)
👑🥙🇨🇦 FOREVER! 🇨🇦🥙👑

[Outro]
Shawarma... King... (fading)
Extra meat... (fading)
Garlic sauce... (fading)
👑 (silence)
`
```

---

## 🎬 LAYER 3: Shawarma Video Generator

```javascript
class ShawarmaVideoGen extends VideoGen {

  SCENE_TEMPLATES={
    intro:{
      visual:"Close-up of shawarma spit, meat glistening, slow rotation",
      motion:"slow-zoom-in",
      duration:3,
      audio:"sizzle sfx + beat drop incoming"
    },
    meatShot:{
      visual:"Knife slicing meat off spit, falling in slow-mo",
      motion:"tracking-shot",
      duration:2,
      audio:"satisfying slice sound"
    },
    garlicPour:{
      visual:"Garlic sauce drizzling over wrap in slow motion",
      motion:"close-up-static",
      duration:2,
      audio:"wet drizzle sound"
    },
    wrapBuilding:{
      visual:"Hands building the perfect shawarma wrap, ingredients layering",
      motion:"overhead-shot",
      duration:4,
      audio:"kitchen ambience"
    },
    customerJoy:{
      visual:"Happy customer taking first bite, eyes widen",
      motion:"reaction-shot",
      duration:2,
      audio:"mmmmm sound"
    },
    lateNight:{
      visual:"Neon-lit storefront, 2AM, customers lined up",
      motion:"establishing-shot",
      duration:3,
      audio:"city ambience"
    },
    logoReveal:{
      visual:"Shawarma King logo with crown, golden glow",
      motion:"zoom-out-reveal",
      duration:2,
      audio:"epic brass hit"
    }
  }

  async generateMusicVideo(song) {
    const scenes=[
      this.SCENE_TEMPLATES.intro,
      // Match scenes to lyrics
      ...this._matchScenesToLyrics(song.lyrics),
      this.SCENE_TEMPLATES.logoReveal
    ]
    return super.generateMusicVideo(song,scenes)
  }

  async generateViralClip(type='meme') {
    const templates={
      meme:{
        format:'9:16',
        duration:15,
        scenes:['meatShot','garlicPour'],
        text:'When they say "extra garlic" 🧄👑',
        audio:'trending-sound'
      },
      reaction:{
        format:'9:16',
        duration:10,
        scenes:['customerJoy'],
        text:'First time at Shawarma King be like:',
        audio:'reaction-sound'
      },
      asmr:{
        format:'1:1',
        duration:30,
        scenes:['meatShot','garlicPour','wrapBuilding'],
        text:'ASMR Shawarma 🥙',
        audio:'asmr-sizzle'
      }
    }
    return this._renderTemplate(templates[type])
  }
}
```

---

## 📺 LAYER 4: Shawarma Commercial Generator

```javascript
class ShawarmaCommercialGen extends CommercialGen {

  COMMERCIAL_FORMATS={
    '15sec-hype':{
      structure:[
        {t:0,scene:'sizzle-shot',text:null},
        {t:2,scene:'meat-slice',text:'SHAWARMA KING'},
        {t:5,scene:'wrap-build',text:'Extra Meat. Extra Sauce.'},
        {t:9,scene:'bite-reaction',text:'Extra Everything.'},
        {t:12,scene:'logo',text:'Find us. Eat legendary. 👑'}
      ],
      audio:'jingle-short',
      vibe:'fast-cuts-hype'
    },
    '30sec-story':{
      structure:[
        {t:0,scene:'empty-street',text:null,vo:'2 AM. The city sleeps.'},
        {t:4,scene:'lit-storefront',text:'SHAWARMA KING',vo:'But legends never rest.'},
        {t:8,scene:'spit-spinning',text:null,vo:'Meat on the spit since 1985.'},
        {t:12,scene:'crowd-gathering',text:null,vo:'They know. They always know.'},
        {t:16,scene:'garlic-pour',text:'GARLIC SAUCE',vo:'The secret? Garlic. Lots of it.'},
        {t:20,scene:'happy-customers',text:null,vo:'Generations of legends.'},
        {t:24,scene:'wrap-handoff',text:'EXTRA MEAT',vo:'Extra meat. No extra charge.'},
        {t:27,scene:'logo-crown',text:'SHAWARMA KING 👑',vo:'Shawarma King. Eat like royalty.'}
      ],
      audio:'anthem-instrumental',
      vibe:'cinematic'
    },
    '60sec-anthem':{
      // Full song with visuals
      structure:'full-anthem-video',
      audio:'full-song',
      vibe:'music-video'
    }
  }

  async generate(format='30sec-story') {
    const template=this.COMMERCIAL_FORMATS[format]
    const jingle=await this.songGen.generateJingle(format.includes('15')?15:30)
    const video=await this.videoGen.generateFromTemplate(template)
    return {jingle,video,format}
  }
}
```

---

## 👑 LAYER 5: Shawarma Cube (9 Kitchen Stations)

```javascript
class ShawarmaCube extends Cube {
  // Kitchen-themed parallel processing

  STATIONS={
    GRILL:   'bass-generation',      // 🔥 The heat
    SPIT:    'rhythm-generation',    // 🥙 The spin
    WRAP:    'composition',          // 🌯 Putting it together
    SAUCE:   'effects-processing',   // 🧄 The flavor
    FRIES:   'percussion',           // 🍟 The crunch
    DRINK:   'flow-analysis',        // 🥤 The smoothness
    SALAD:   'harmony',              // 🥗 The freshness
    PITA:    'foundation',           // 🫓 The base
    KING:    'final-mix'             // 👑 The crown
  }

  async cookTheAnthm(request) {
    console.log('👑 Shawarma King AI Kitchen: FIRING UP 🔥')

    // Parallel prep (8 stations)
    const prep=await Promise.all([
      this.station('GRILL',{task:'bass',request}),
      this.station('SPIT',{task:'drums',request}),
      this.station('WRAP',{task:'structure',request}),
      this.station('SAUCE',{task:'effects',request}),
      this.station('FRIES',{task:'percussion',request}),
      this.station('DRINK',{task:'flow',request}),
      this.station('SALAD',{task:'harmony',request}),
      this.station('PITA',{task:'foundation',request})
    ])

    // King's final approval
    const final=await this.station('KING',{
      task:'mix',
      ingredients:prep,
      request
    })

    console.log('👑 Anthem is READY! Legendary. 🥙')
    return final
  }
}
```

---

## 📁 FILE STRUCTURE

```
shawarma-king-beats/
├── index.html                 # The Menu Board
├── css/
│   └── style.css              # Gold & Brown Theme 👑
├── js/
│   ├── app.js                 # ShawarmaApp
│   ├── konomi/
│   │   ├── evgpu.js           # The Grill 🔥
│   │   ├── femto.js           # Spice Analyzer 🧄
│   │   ├── blockarray.js      # Order Queue 🍟
│   │   ├── cube.js            # Kitchen Crew 👑
│   │   └── system.js          # Restaurant Manager
│   ├── generators/
│   │   ├── webllm.js          # AI Chef Brain 🤖
│   │   ├── shawarma-song.js   # Anthem Generator 🎼
│   │   ├── shawarma-video.js  # Video Kitchen 🎬
│   │   ├── shawarma-commercial.js  # Ad Maker 📺
│   │   └── templates.js       # Recipe Book
│   └── audio/
│       ├── synthesizer.js     # Beat Cooker
│       └── effects.js         # Sauce Effects
├── media/
│   ├── playlist.json
│   └── generated/
│       ├── anthem.mp3
│       ├── anthem-video.mp4
│       └── commercials/
├── assets/
│   ├── logo.png               # 👑 Crown logo
│   ├── sizzle.mp3             # SFX
│   └── fonts/
└── .nojekyll
```

---

## 🎨 THEME COLORS

```css
:root {
  /* Shawarma King Palette */
  --king-gold: #FFD700;
  --crown-gold: #FFC107;
  --shawarma-brown: #8B4513;
  --meat-tan: #D2691E;
  --pita-cream: #F5DEB3;
  --garlic-white: #FFFAF0;
  --hot-sauce: #FF4500;
  --lettuce-green: #90EE90;
  --tahini-beige: #DEB887;
  --night-dark: #1a1a2e;

  /* Semantic */
  --bg-primary: var(--night-dark);
  --accent: var(--king-gold);
  --text: var(--garlic-white);
}
```

---

## 🚀 QUICK START

```javascript
// Initialize Shawarma King AI
const sk=new ShawarmaKingAI()
await sk.init()

// Load the AI Chef
await sk.loadChef() // downloads WebLLM model

// Generate the Anthem
const anthem=await sk.generateAnthem({
  style:'shawarma-trap',
  spiceLevel:4,
  garlicIntensity:10,
  extras:['extra-meat','extra-sauce','hummus']
})
// → {lyrics, melody, audio}

// Generate Music Video
const video=await sk.generateMusicVideo(anthem)
// → video/webm blob

// Generate 30sec Commercial
const commercial=await sk.generateCommercial('30sec-story')
// → {script, jingle, video}

// Generate Viral Clip
const meme=await sk.generateViralClip('meme')
// → 15sec vertical video

// Play the Anthem
sk.player.play(anthem)
console.log('👑 SHAWARMA KING! 🥙')
```

---

## 📊 SPECS

```
🤖 WebLLM: Llama-3.1-8B, Shawarma-tuned prompts
🎼 ShawarmaGen: Anthems, jingles, trap beats
🎬 VideoGen: Music videos, commercials, viral clips
📺 CommercialGen: 15s/30s/60s ad formats
🧄 FemtoLLM: Spice level + garlic intensity analysis
🔥 eVGPU: Sizzle sounds, FFT visualization
👑 Cube: 9 kitchen stations parallel processing
📡 GitHub Pages: Free hosting for the King
```

---

## 🏁 DEPLOYMENT

```bash
# Create the Kingdom
gh repo create shawarma-king-beats --public --clone
cd shawarma-king-beats

# Copy MOOSIC base
cp -r ../moosic/* .

# Customize for the King
# - Update colors in css/style.css
# - Add Shawarma generators
# - Update branding

# Deploy the Kingdom
git add -A
git commit -m "👑 SHAWARMA KING BEATS - AI-Native 🥙"
git push origin main

# Enable Pages
# → https://username.github.io/shawarma-king-beats
```

---

## 👑 SAMPLE OUTPUTS

### Generated Jingle (15sec)
```
🎵 Sha-war-ma KING! (👑)
🎵 Extra meat, extra sauce!
🎵 Best in the city, never a loss!
🎵 Sha-war-ma KING!
🎵 Eat like royalty! 👑🥙
```

### Generated Commercial Script (30sec)
```
[0:00] VISUAL: Sizzling meat, close-up
       AUDIO: *sizzle* + beat drop
       TEXT: none

[0:03] VISUAL: Knife slicing meat
       AUDIO: *slice* "SHAWARMA KING"
       TEXT: "SHAWARMA KING"

[0:07] VISUAL: Garlic sauce pouring
       AUDIO: *drizzle*
       TEXT: "GARLIC. LOTS OF IT."

... [continues]

[0:27] VISUAL: Logo with crown, glowing
       AUDIO: Full jingle hook
       TEXT: "SHAWARMA KING 👑 Eat Like Royalty"
       CTA: "Find your nearest King"
```

---

## 🎯 GOAL

**Complete AI-powered content suite for Shawarma King:**

1. **Anthems** - Full songs celebrating the brand
2. **Jingles** - Catchy 15-30sec hooks
3. **Music Videos** - Synced visuals to tracks
4. **Commercials** - Scripted ads ready to air
5. **Viral Clips** - Social media ready content
6. **Memes** - Shareable moments

**All generated in-browser. No studio. No agency. Just AI + Shawarma = Legend. 🥙👑🇨🇦**

---

*"Extra meat. Extra sauce. Extra legendary."* 👑
