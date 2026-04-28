function renderSidebar(){
  document.getElementById('sidebar').innerHTML=TAGS.map(function(t,i){
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
