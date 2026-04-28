/**
 * Grid loader v2 — multi-screen, standard-aware, GitHub Issue tags
 */
const base = new URL('.', document.baseURI).href;
let currentScreen = null;
let screenConfig = null;

async function loadScreenConfig() {
  const r = await fetch(base + 'screens/config.json');
  screenConfig = await r.json();
  return screenConfig;
}

async function loadGrid(screenId) {
  if (!screenConfig) await loadScreenConfig();
  const screen = screenConfig.screens[screenId || screenConfig.default];
  if (!screen) return;
  currentScreen = screenId || screenConfig.default;

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${screen.cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${screen.rows}, 1fr)`;

  const r = await fetch(base + screen.layout);
  const layout = await r.json();

  for (const cell of layout.cells) {
    const div = document.createElement('div');
    div.className = 'c';
    div.id = 'cell_' + cell.id;
    div.style.gridColumn = `${cell.col + 1} / span ${cell.w || 1}`;
    div.style.gridRow = `${cell.row + 1} / span ${cell.h || 1}`;
    div.innerHTML = `<div class="ch">${cell.t}</div><div class="cb" id="cb_${cell.id}"></div>`;
    grid.appendChild(div);
    try {
      const cr = await fetch(base + 'cells/' + cell.id + '.html');
      if (cr.ok) document.getElementById('cb_' + cell.id).innerHTML = await cr.text();
    } catch {}
  }
}

function buildScreenNav() {
  if (!screenConfig) return '';
  return Object.entries(screenConfig.screens).map(([id, s]) =>
    '<span onclick="switchScreen(\'' + id + '\')" style="cursor:pointer;padding:2px 6px;border-radius:3px;font-size:8px;' + (currentScreen === id ? 'color:var(--ign);background:rgba(245,124,32,0.1)' : 'color:var(--t2)') + '">' + s.label + '</span>'
  ).join('');
}

async function switchScreen(id) {
  await loadGrid(id);
  const nav = document.getElementById('screen-nav');
  if (nav) nav.innerHTML = buildScreenNav();
  if (typeof applyGithubTags === 'function') {
    await applyGithubTags(document.getElementById('grid'));
  }
}
