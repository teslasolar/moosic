/**
 * Grid loader v3 — reads layout from GitHub Issues first, falls back to file
 *
 * Priority: GitHub Issue tagged "_layout" > config/layout.json
 * GitHub Issue tagged "_screens" > screens/config.json
 */
const base = new URL('.', document.baseURI).href;
const GH_REPO = 'teslasolar/moosic';
const GH_LABEL = 'grid-config';
let currentScreen = null;
let screenConfig = null;
let ghIssues = null;

async function fetchGithubIssues() {
  if (ghIssues) return ghIssues;
  try {
    const r = await fetch('https://api.github.com/repos/' + GH_REPO + '/issues?labels=' + GH_LABEL + '&state=open&per_page=50', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
    });
    ghIssues = await r.json();
  } catch { ghIssues = []; }
  return ghIssues;
}

function parseIssueTag(issue) {
  const m = issue.body?.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

async function findTag(cellId) {
  const issues = await fetchGithubIssues();
  for (const issue of issues) {
    const tag = parseIssueTag(issue);
    if (tag && tag.cell_id === cellId) return tag;
  }
  return null;
}

async function loadScreenConfig() {
  // Check GitHub for _screens override
  const ghScreens = await findTag('_screens');
  if (ghScreens && ghScreens.screens) {
    screenConfig = ghScreens;
    return screenConfig;
  }
  const r = await fetch(base + 'screens/config.json');
  screenConfig = await r.json();
  return screenConfig;
}

function detectDevice() {
  var w = window.innerWidth;
  if (w <= 300) return 'watch';
  if (w <= 600) return 'mobile';
  if (w <= 1024) return 'tablet';
  return 'desktop';
}

async function loadGrid(screenId) {
  if (!screenConfig) await loadScreenConfig();
  const id = screenId || screenConfig.default;
  currentScreen = id;

  // Check for device-specific layout first, then generic _layout
  var device = detectDevice();
  var ghLayout = await findTag('_layout_' + device);
  if (!ghLayout || !ghLayout.cells) ghLayout = await findTag('_layout');
  let layout;
  if (ghLayout && ghLayout.cells) {
    layout = ghLayout;
  } else {
    const screen = screenConfig.screens?.[id];
    if (screen) {
      const r = await fetch(base + screen.layout);
      layout = await r.json();
    } else {
      layout = { cols: 2, rows: 1, cells: [] };
    }
  }

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = 'repeat(' + (layout.cols || 2) + ', 1fr)';
  grid.style.gridTemplateRows = 'repeat(' + (layout.rows || 1) + ', 1fr)';

  for (const cell of layout.cells) {
    const div = document.createElement('div');
    div.className = 'c';
    div.id = 'cell_' + cell.id;
    div.style.gridColumn = (cell.col + 1) + ' / span ' + (cell.w || 1);
    div.style.gridRow = (cell.row + 1) + ' / span ' + (cell.h || 1);
    div.innerHTML = '<div class="ch">' + cell.t + '</div><div class="cb" id="cb_' + cell.id + '"></div>';
    grid.appendChild(div);
    try {
      const cr = await fetch(base + 'cells/' + cell.id + '.html');
      if (cr.ok) document.getElementById('cb_' + cell.id).innerHTML = await cr.text();
    } catch {}
  }
}

function buildScreenNav() {
  if (!screenConfig?.screens) return '';
  return Object.entries(screenConfig.screens).map(function(e) {
    var id = e[0], s = e[1];
    return '<span onclick="switchScreen(\'' + id + '\')" style="cursor:pointer;padding:2px 6px;border-radius:3px;font-size:8px;' + (currentScreen === id ? 'color:var(--ign);background:rgba(245,124,32,0.1)' : 'color:var(--t2)') + '">' + s.label + '</span>';
  }).join('');
}

async function switchScreen(id) {
  await loadGrid(id);
  var nav = document.getElementById('screen-nav');
  if (nav) nav.innerHTML = buildScreenNav();
  if (typeof applyGithubTags === 'function') {
    await applyGithubTags(document.getElementById('grid'));
  }
}
