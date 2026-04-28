// state-widget.js — collapsible mermaid state machine overlay for any page
var STATE_W = { current: 'init', el: null, mermaidReady: false, diagram: '' };

function stateWidgetInit(diagram, initialState) {
  STATE_W.diagram = diagram || 'stateDiagram-v2\n[*]-->init\ninit-->ready';
  STATE_W.current = initialState || 'init';
  var wrap = document.createElement('div');
  wrap.id = 'sw-wrap';
  wrap.style.cssText = 'position:fixed;top:36px;right:4px;z-index:99998;font-family:monospace;font-size:8px;max-width:320px';
  var tog = document.createElement('div');
  tog.id = 'sw-tog';
  tog.style.cssText = 'cursor:pointer;background:#0a0d15;border:1px solid #161d2a;border-radius:3px;padding:2px 6px;color:#38b5f9;font-size:7px;text-align:right;user-select:none';
  tog.textContent = '▸ state machine';
  tog.onclick = function() {
    var box = document.getElementById('sw-box');
    if (!box) return;
    var vis = box.style.display !== 'none';
    box.style.display = vis ? 'none' : '';
    tog.textContent = (vis ? '▸' : '▾') + ' state machine';
    if (!vis && !STATE_W.mermaidReady) loadMermaid();
  };
  var box = document.createElement('div');
  box.id = 'sw-box';
  box.style.cssText = 'display:none;background:#080810;border:1px solid #161d2a;border-radius:4px;padding:6px;margin-top:2px;overflow:auto;max-height:50vh';
  box.innerHTML = '<div id="sw-mermaid" style="color:#3a4860">loading mermaid...</div>';
  wrap.appendChild(tog);
  wrap.appendChild(box);
  document.body.appendChild(wrap);
  STATE_W.el = box;
}

function loadMermaid() {
  if (STATE_W.mermaidReady) { renderDiagram(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
  s.onload = function() {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: { fontSize: '10px' } });
    STATE_W.mermaidReady = true;
    renderDiagram();
  };
  document.head.appendChild(s);
}

async function renderDiagram() {
  if (!STATE_W.mermaidReady) return;
  var el = document.getElementById('sw-mermaid');
  if (!el) return;
  try {
    var { svg } = await mermaid.render('sw-svg', STATE_W.diagram);
    el.innerHTML = svg;
    highlightState(STATE_W.current);
  } catch (e) { el.textContent = 'render error: ' + e.message; }
}

function highlightState(s) {
  STATE_W.current = s;
  var el = document.getElementById('sw-mermaid');
  if (!el) return;
  // Reset all node fills
  el.querySelectorAll('.node rect, .node circle, .node polygon').forEach(function(n) {
    n.style.fill = ''; n.style.stroke = '';
  });
  // Highlight matching node
  el.querySelectorAll('.node').forEach(function(n) {
    var label = n.textContent?.trim().toLowerCase();
    if (label === s.toLowerCase() || label.indexOf(s.toLowerCase()) === 0) {
      var shape = n.querySelector('rect,circle,polygon');
      if (shape) { shape.style.fill = '#1a0010'; shape.style.stroke = '#ff2d75'; shape.style.strokeWidth = '2px'; }
    }
  });
  // Update toggle text
  var tog = document.getElementById('sw-tog');
  if (tog) tog.textContent = tog.textContent.replace(/\[.*\]/, '') + ' [' + s + ']';
}
