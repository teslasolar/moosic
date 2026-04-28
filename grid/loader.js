/**
 * Grid loader — reads layout.json, creates cells, autoloads HTML from cells/
 */
async function loadGrid() {
  const r = await fetch('config/layout.json');
  const layout = await r.json();
  const grid = document.getElementById('grid');

  for (const cell of layout.cells) {
    const div = document.createElement('div');
    div.className = 'c';
    div.id = 'cell_' + cell.id;
    div.style.gridColumn = `${cell.col + 1} / span ${cell.w || 1}`;
    div.style.gridRow = `${cell.row + 1} / span ${cell.h || 1}`;
    div.innerHTML = `<div class="ch">${cell.t}</div><div class="cb" id="cb_${cell.id}"></div>`;
    grid.appendChild(div);

    // Autoload cell HTML from cells/ directory
    try {
      const cr = await fetch('cells/' + cell.id + '.html');
      if (cr.ok) {
        document.getElementById('cb_' + cell.id).innerHTML = await cr.text();
      }
    } catch {}
  }
}
