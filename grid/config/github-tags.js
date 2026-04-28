/**
 * GitHub Issues as dynamic tag.db — live-updating grid cells
 *
 * Tag fields:
 *   cell_id  — target cell ID (create new or update existing)
 *   t        — cell header title
 *   col/row/w/h — grid position (for new cells)
 *   content  — static HTML content
 *   script   — JS to execute (has `el` = cell body element)
 *   poll     — interval in ms to re-run script (default: once)
 */
const REPO = 'teslasolar/moosic';
const LABEL = 'grid-config';
const GH_API = 'https://api.github.com/repos/' + REPO + '/issues';

async function loadGithubTags() {
  try {
    const r = await fetch(GH_API + '?labels=' + LABEL + '&state=open&per_page=30', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
    });
    const issues = await r.json();
    const tags = [];
    for (const issue of issues) {
      const m = issue.body?.match(/```json\s*([\s\S]*?)```/);
      if (m) {
        try { tags.push({ ...JSON.parse(m[1]), _issue: issue.number }); } catch {}
      }
    }
    return tags;
  } catch { return []; }
}

async function applyGithubTags(grid) {
  const tags = await loadGithubTags();
  for (const tag of tags) {
    if (!tag.cell_id) continue;

    let el = document.getElementById('cb_' + tag.cell_id);

    // Create cell if it doesn't exist
    if (!el && tag.t && tag.col !== undefined) {
      const div = document.createElement('div');
      div.className = 'c';
      div.id = 'cell_' + tag.cell_id;
      div.style.gridColumn = `${tag.col + 1} / span ${tag.w || 1}`;
      div.style.gridRow = `${tag.row + 1} / span ${tag.h || 1}`;
      div.innerHTML = `<div class="ch">${tag.t}</div><div class="cb" id="cb_${tag.cell_id}"></div>`;
      grid.appendChild(div);
      el = document.getElementById('cb_' + tag.cell_id);
    }

    // System tags (_theme, _responsive, etc.) run scripts globally without a cell
    if (!el && tag.cell_id.startsWith('_') && tag.script) {
      const run = () => { try { new Function(tag.script)(); } catch (e) { console.warn('tag ' + tag.cell_id + ':', e.message); } };
      run();
      if (tag.poll) setInterval(run, tag.poll);
      continue;
    }

    if (!el) continue;

    // Static content
    if (tag.content) el.innerHTML = tag.content;

    // Executable script — runs with `el` bound to cell body
    if (tag.script) {
      const run = () => { try { new Function('el', tag.script)(el); } catch (e) { el.innerHTML = '<span style="color:#ff4466;font-size:7px">' + e.message + '</span>'; } };
      run();
      if (tag.poll) setInterval(run, tag.poll);
      else setTimeout(run, 100);
    }
  }
  return tags.length;
}
