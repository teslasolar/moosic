var REPO='teslasolar/moosic',LABEL='grid-config';
var TAGS=[],SEL=null;
var _MINT=['_issue','_title','_updated','_comments','_user','_isSys','_hasScript','_hasPoll','_hasContent','_scriptLen'];

async function fetchTags(){
  var r=await fetch('https://api.github.com/repos/'+REPO+'/issues?labels='+LABEL+'&state=open&per_page=50',
    {headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(8000)});
  var issues=await r.json();
  TAGS=[];
  for(var iss of issues){
    var m=iss.body?.match(/```json\s*([\s\S]*?)```/);
    if(!m)continue;
    try{var tag=JSON.parse(m[1]);
      tag._issue=iss.number;tag._title=iss.title;tag._updated=iss.updated_at;
      tag._comments=iss.comments;tag._user=iss.user?.login||'';
      tag._isSys=tag.cell_id?.startsWith('_')||false;
      tag._hasScript=!!tag.script;tag._hasPoll=!!tag.poll;tag._hasContent=!!tag.content;
      tag._scriptLen=tag.script?.length||0;
      TAGS.push(tag)}catch(e){}}
  TAGS.sort(function(a,b){return(a._isSys===b._isSys)?a.cell_id.localeCompare(b.cell_id):(a._isSys?-1:1)});
  return TAGS;
}

function cleanTag(t){var o=Object.assign({},t);_MINT.forEach(function(k){delete o[k]});return o}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function stat(v,l,c){return '<div class="stat"><div class="v" style="color:'+c+'">'+v+'</div><div class="l">'+l+'</div></div>'}
function prop(k,v){return '<span class="k">'+k+'</span><span class="val">'+(v??'—')+'</span>'}
