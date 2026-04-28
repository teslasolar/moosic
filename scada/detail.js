function selectTag(i){
  SEL=i;renderSidebar();
  var t=TAGS[i],tag=cleanTag(t);
  document.getElementById('main').innerHTML=renderStats()+'<div class="detail"><h3>#'+t._issue+' · '+t.cell_id+'</h3>'
    +'<div class="props">'
    +prop('issue','#'+t._issue)+prop('title',t._title)+prop('cell_id',t.cell_id)
    +prop('updated',t._updated?.slice(0,19).replace('T',' '))
    +prop('type',t._isSys?'SYSTEM':'CELL')
    +prop('script',t._hasScript?t._scriptLen+' bytes':'none')
    +prop('poll',t._hasPoll?t.poll+'ms':'none')
    +prop('content',t._hasContent?'yes':'none')
    +prop('comments',t._comments)+prop('author',t._user)
    +(t.t?prop('header',t.t):'')
    +(t.col!==undefined?prop('position','col:'+t.col+' row:'+t.row+' w:'+(t.w||1)+' h:'+(t.h||1)):'')
    +'</div>'
    +'<h3 style="margin-top:8px">tag JSON</h3><pre>'+esc(JSON.stringify(tag,null,2))+'</pre>'
    +(t._hasScript?'<h3 style="margin-top:8px">script</h3><pre>'+esc(t.script)+'</pre>':'')
    +'<div style="margin-top:6px;display:flex;gap:4px">'
    +'<button class="btn" onclick="copyTag('+i+')">⎘ copy JSON</button>'
    +'<button class="btn" onclick="window.open(\'https://github.com/'+REPO+'/issues/'+t._issue+'\')">↗ github</button>'
    +'</div></div>';
}

function copyTag(i){navigator.clipboard.writeText(JSON.stringify(cleanTag(TAGS[i]),null,2))}
function copyAll(){navigator.clipboard.writeText(JSON.stringify(TAGS.map(cleanTag),null,2))}

async function refresh(){
  document.getElementById('status').textContent='fetching...';
  try{await fetchTags();renderSidebar();
    document.getElementById('main').innerHTML=renderStats()+'<div class="detail"><h3>tag.db overview</h3>'
      +'<pre>'+esc(TAGS.map(function(t){return(t._isSys?'⚙':'◻')+' '+t.cell_id.padEnd(18)+' #'+String(t._issue).padStart(2)+(t._hasScript?' JS:'+String(t._scriptLen).padStart(4):'')+(t._hasPoll?' POLL:'+t.poll:'')}).join('\n'))+'</pre></div>';
    document.getElementById('status').textContent='✔ '+TAGS.length+' tags loaded';
    if(SEL!==null&&SEL<TAGS.length)selectTag(SEL);
  }catch(e){document.getElementById('status').innerHTML='<span class="err">✘ '+e.message+'</span>'}
}

setInterval(function(){var c=document.getElementById('clock');if(c)c.textContent=new Date().toLocaleTimeString()},1000);
refresh();
