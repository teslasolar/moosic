var REPO='teslasolar/moosic',LABEL='grid-config';
var TAGS=[],SEL=null;

async function fetchTags(){
  var r=await fetch('https://api.github.com/repos/'+REPO+'/issues?labels='+LABEL+'&state=open&per_page=50',
    {headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(8000)});
  var issues=await r.json();
  TAGS=[];
  for(var iss of issues){
    var m=iss.body?.match(/```json\s*([\s\S]*?)```/);
    if(!m)continue;
    try{
      var tag=JSON.parse(m[1]);
      tag._issue=iss.number;tag._title=iss.title;tag._updated=iss.updated_at;
      tag._comments=iss.comments;tag._user=iss.user?.login||'';
      tag._isSys=tag.cell_id?.startsWith('_')||false;
      tag._hasScript=!!tag.script;tag._hasPoll=!!tag.poll;tag._hasContent=!!tag.content;
      tag._scriptLen=tag.script?.length||0;
      TAGS.push(tag);
    }catch(e){}
  }
  TAGS.sort(function(a,b){return(a._isSys===b._isSys)?a.cell_id.localeCompare(b.cell_id):(a._isSys?-1:1)});
  return TAGS;
}

function renderSidebar(){
  var sb=document.getElementById('sidebar');
  sb.innerHTML=TAGS.map(function(t,i){
    var pills='';
    if(t._isSys)pills+='<span class="pill sys">SYS</span>';
    else pills+='<span class="pill cell">CELL</span>';
    if(t._hasScript)pills+='<span class="pill scr">JS:'+t._scriptLen+'</span>';
    if(t._hasPoll)pills+='<span class="pill poll">POLL:'+t.poll+'</span>';
    return '<div class="tag-row'+(SEL===i?' sel':'')+'" onclick="selectTag('+i+')">'
      +'<span style="color:'+(t._isSys?'var(--ok)':'var(--ig)')+';min-width:10ch;font-weight:600">'+t.cell_id+'</span>'
      +'<span style="flex:1"></span>'+pills
      +'<span style="color:var(--t2);font-size:6px">#'+t._issue+'</span></div>';
  }).join('');
}

function renderStats(){
  var sys=TAGS.filter(function(t){return t._isSys}).length;
  var cells=TAGS.length-sys;
  var scripts=TAGS.filter(function(t){return t._hasScript}).length;
  var polls=TAGS.filter(function(t){return t._hasPoll}).length;
  var totalJS=TAGS.reduce(function(s,t){return s+t._scriptLen},0);
  return '<div class="stats-row">'
    +stat(TAGS.length,'TOTAL TAGS','var(--ig)')
    +stat(sys,'SYSTEM _','var(--ok)')
    +stat(cells,'CELL','var(--ig)')
    +stat(scripts,'SCRIPTS','var(--wr)')
    +stat(polls,'POLLERS','#a080ff')
    +stat(totalJS,'JS BYTES','var(--gd)')
    +'</div>';
}
function stat(v,l,c){return '<div class="stat"><div class="v" style="color:'+c+'">'+v+'</div><div class="l">'+l+'</div></div>'}

function selectTag(i){
  SEL=i;renderSidebar();
  var t=TAGS[i];
  var tag=Object.assign({},t);
  delete tag._issue;delete tag._title;delete tag._updated;delete tag._comments;
  delete tag._user;delete tag._isSys;delete tag._hasScript;delete tag._hasPoll;
  delete tag._hasContent;delete tag._scriptLen;
  var main=document.getElementById('main');
  main.innerHTML=renderStats()+'<div class="detail"><h3>#'+t._issue+' · '+t.cell_id+'</h3>'
    +'<div class="props">'
    +prop('issue','#'+t._issue)+prop('title',t._title)+prop('cell_id',t.cell_id)
    +prop('updated',t._updated?.slice(0,19).replace('T',' '))
    +prop('type',t._isSys?'SYSTEM':'CELL')
    +prop('script',t._hasScript?t._scriptLen+' bytes':'none')
    +prop('poll',t._hasPoll?t.poll+'ms':'none')
    +prop('content',t._hasContent?'yes':'none')
    +prop('comments',t._comments)
    +prop('author',t._user)
    +(t.t?prop('header',t.t):'')
    +(t.col!==undefined?prop('position','col:'+t.col+' row:'+t.row+' w:'+(t.w||1)+' h:'+(t.h||1)):'')
    +'</div>'
    +'<h3 style="margin-top:8px">tag JSON</h3>'
    +'<pre id="tag-json">'+esc(JSON.stringify(tag,null,2))+'</pre>'
    +(t._hasScript?'<h3 style="margin-top:8px">script</h3><pre>'+esc(t.script)+'</pre>':'')
    +'<div style="margin-top:6px;display:flex;gap:4px">'
    +'<button class="btn" onclick="copyTag('+i+')">⎘ copy JSON</button>'
    +'<button class="btn" onclick="window.open(\'https://github.com/'+REPO+'/issues/'+t._issue+'\')">↗ github</button>'
    +'</div></div>';
}
function prop(k,v){return '<span class="k">'+k+'</span><span class="val">'+(v??'—')+'</span>'}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function copyTag(i){
  var t=Object.assign({},TAGS[i]);
  delete t._issue;delete t._title;delete t._updated;delete t._comments;
  delete t._user;delete t._isSys;delete t._hasScript;delete t._hasPoll;
  delete t._hasContent;delete t._scriptLen;
  navigator.clipboard.writeText(JSON.stringify(t,null,2));
}
function copyAll(){navigator.clipboard.writeText(JSON.stringify(TAGS.map(function(t){var o=Object.assign({},t);delete o._issue;delete o._title;delete o._updated;delete o._comments;delete o._user;delete o._isSys;delete o._hasScript;delete o._hasPoll;delete o._hasContent;delete o._scriptLen;return o}),null,2))}

async function refresh(){
  document.getElementById('status').textContent='fetching...';
  try{
    await fetchTags();
    renderSidebar();
    var main=document.getElementById('main');
    main.innerHTML=renderStats()+'<div class="detail"><h3>tag.db overview</h3>'
      +'<pre>'+esc(TAGS.map(function(t){return(t._isSys?'⚙':'◻')+' '+t.cell_id.padEnd(18)+' #'+String(t._issue).padStart(2)+(t._hasScript?' JS:'+String(t._scriptLen).padStart(4):'')+(t._hasPoll?' POLL:'+t.poll:'')}).join('\n'))+'</pre></div>';
    document.getElementById('status').textContent='✔ '+TAGS.length+' tags loaded';
    if(SEL!==null&&SEL<TAGS.length)selectTag(SEL);
  }catch(e){document.getElementById('status').innerHTML='<span class="err">✘ '+e.message+'</span>'}
}

setInterval(function(){var c=document.getElementById('clock');if(c)c.textContent=new Date().toLocaleTimeString()},1000);
refresh();
