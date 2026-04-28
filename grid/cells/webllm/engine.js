/**
 * WebLLM engine — loads model in browser, runs inference, saves to GitHub Issues
 * Config loaded from webllm/config.json or GitHub Issue tag "_webllm"
 */
var WEBLLM = {
  engine: null,
  config: null,
  loading: false,
  ready: false,
  clientId: localStorage.getItem('kcc-client') || ('c-' + crypto.getRandomValues(new Uint8Array(4)).reduce(function(s,b){return s+b.toString(16).padStart(2,'0')},''))
};
localStorage.setItem('kcc-client', WEBLLM.clientId);

async function loadWebLLMConfig() {
  // Try GitHub Issue tag first
  try {
    var r = await fetch('https://api.github.com/repos/teslasolar/moosic/issues?labels=grid-config&state=open&per_page=50',
      {headers:{Accept:'application/vnd.github+json'}, signal:AbortSignal.timeout(5000)});
    var issues = await r.json();
    for (var iss of issues) {
      var m = iss.body?.match(/```json\s*([\s\S]*?)```/);
      if (m) { try { var t = JSON.parse(m[1]); if (t.cell_id === '_webllm') { WEBLLM.config = t; return t; } } catch(e){} }
    }
  } catch(e) {}
  // Fall back to file
  try {
    var r2 = await fetch('cells/webllm/config.json');
    WEBLLM.config = await r2.json();
  } catch(e) {
    WEBLLM.config = { model: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', system_prompt: 'You are KONOMI.', max_tokens: 256, temperature: 0.7 };
  }
  return WEBLLM.config;
}

async function initWebLLM(statusEl) {
  if (WEBLLM.loading || WEBLLM.ready) return;
  WEBLLM.loading = true;
  if (statusEl) statusEl.textContent = 'Loading WebLLM...';

  await loadWebLLMConfig();
  var model = WEBLLM.config.model || 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

  try {
    var { CreateMLCEngine } = await import('https://esm.run/@anthropic-ai/mlc-llm');
    if (!CreateMLCEngine) {
      var mod = await import('https://esm.run/@mlc-ai/web-llm');
      var create = mod.CreateMLCEngine || mod.CreateWebWorkerMLCEngine;
      WEBLLM.engine = await create(model, {
        initProgressCallback: function(p) {
          if (statusEl) statusEl.textContent = p.text || ('Loading ' + Math.round((p.progress||0)*100) + '%');
        }
      });
    }
  } catch(e) {
    try {
      var mod2 = await import('https://esm.run/@mlc-ai/web-llm');
      WEBLLM.engine = await mod2.CreateMLCEngine(model, {
        initProgressCallback: function(p) {
          if (statusEl) statusEl.textContent = p.text || ('Loading ' + Math.round((p.progress||0)*100) + '%');
        }
      });
    } catch(e2) {
      if (statusEl) statusEl.textContent = 'WebLLM failed: ' + e2.message;
      WEBLLM.loading = false;
      return;
    }
  }

  WEBLLM.ready = true;
  WEBLLM.loading = false;
  if (statusEl) statusEl.textContent = 'Ready: ' + model.split('-').slice(0,3).join('-');
}

async function chatWebLLM(userMsg) {
  if (!WEBLLM.ready || !WEBLLM.engine) return { error: 'not loaded' };

  var messages = [
    { role: 'system', content: WEBLLM.config.system_prompt || 'You are KONOMI.' },
    { role: 'user', content: userMsg }
  ];

  var reply = await WEBLLM.engine.chat.completions.create({
    messages: messages,
    max_tokens: WEBLLM.config.max_tokens || 256,
    temperature: WEBLLM.config.temperature || 0.7
  });

  var text = reply.choices[0]?.message?.content || '';

  // Save to GitHub Issues
  if (WEBLLM.config.save_to_github !== false) {
    saveToGithub(userMsg, text);
  }

  return { reply: text, model: WEBLLM.config.model, client: WEBLLM.clientId };
}

async function saveToGithub(prompt, response) {
  var repo = WEBLLM.config.github_repo || 'teslasolar/moosic';
  var label = WEBLLM.config.github_label || 'webllm-chat';
  var body = {
    title: 'chat: ' + WEBLLM.clientId + ' · ' + prompt.slice(0, 40),
    labels: [label],
    body: '**Client:** `' + WEBLLM.clientId + '`\n**Model:** `' + WEBLLM.config.model + '`\n**Time:** ' + new Date().toISOString() +
      '\n\n**Prompt:**\n```\n' + prompt + '\n```\n\n**Response:**\n```\n' + response + '\n```'
  };

  try {
    // Use OnlyBrains API as proxy to create issue (avoids needing GH token on client)
    await fetch('https://onlybrains.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'webllm-' + WEBLLM.clientId, message: JSON.stringify({ prompt: prompt.slice(0,200), response: response.slice(0,200), model: WEBLLM.config.model }), role: 'ai' })
    });
  } catch(e) {}
}
