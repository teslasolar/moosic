/**
 * GitHub Issues as dynamic tag.db — reads config from repo issues
 * labeled "grid-config". Edit issues to update the site in real time.
 *
 * Issue body format (JSON in code block):
 * ```json
 * { "cell_id": "new-cell", "t": "🆕 NEW", "col": 0, "row": 0, "w": 1, "h": 1 }
 * ```
 */
const REPO = 'teslasolar/moosic';
const LABEL = 'grid-config';
const API = 'https://api.github.com/repos/' + REPO + '/issues';

async function loadGithubTags() {
  try {
    const r = await fetch(API + '?labels=' + LABEL + '&state=open&per_page=30', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
    });
    const issues = await r.json();
    const tags = [];

    for (const issue of issues) {
      const m = issue.body?.match(/```json\s*([\s\S]*?)```/);
      if (m) {
        try {
          const data = JSON.parse(m[1]);
          data._issue = issue.number;
          data._title = issue.title;
          tags.push(data);
        } catch {}
      }
    }
    return tags;
  } catch { return []; }
}

async function applyGithubTags(grid) {
  const tags = await loadGithubTags();
  for (const tag of tags) {
    if (tag.cell_id) {
      const existing = document.getElementById('cb_' + tag.cell_id);
      if (existing && tag.content) {
        existing.innerHTML = tag.content;
      } else if (tag.t && tag.col !== undefined) {
        const div = document.createElement('div');
        div.className = 'c';
        div.id = 'cell_' + tag.cell_id;
        div.style.gridColumn = `${tag.col + 1} / span ${tag.w || 1}`;
        div.style.gridRow = `${tag.row + 1} / span ${tag.h || 1}`;
        div.innerHTML = `<div class="ch">${tag.t}</div><div class="cb" id="cb_${tag.cell_id}">${tag.content || ''}</div>`;
        grid.appendChild(div);
      }
    }
  }
  return tags.length;
}
