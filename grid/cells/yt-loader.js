var YT_CHANNEL='UCTfSIAa_NtbysEFPrBgJwJA';
var YT_FEED='https://www.youtube.com/feeds/videos.xml?channel_id='+YT_CHANNEL;
var YT_PROXIES=['https://api.codetabs.com/v1/proxy?quest=','https://corsproxy.io/?url=','https://api.allorigins.win/raw?url='];
var YT_VIDEOS=null;

async function ytFetch(){
  if(YT_VIDEOS)return YT_VIDEOS;
  var xml=null;
  for(var i=0;i<YT_PROXIES.length;i++){
    try{var r=await fetch(YT_PROXIES[i]+encodeURIComponent(YT_FEED),{signal:AbortSignal.timeout(6000)});xml=await r.text();if(xml.indexOf('<entry>')>-1)break;xml=null}catch(e){}}
  if(!xml)try{var r2=await fetch(YT_FEED,{signal:AbortSignal.timeout(4000)});xml=await r2.text()}catch(e){}
  if(!xml)return[];
  var d=new DOMParser().parseFromString(xml,'text/xml');
  YT_VIDEOS=Array.from(d.querySelectorAll('entry')).map(function(e){
    return{id:e.querySelector('videoId')?.textContent||'',title:e.querySelector('title')?.textContent||'',pub:e.querySelector('published')?.textContent?.slice(0,10)||''}});
  return YT_VIDEOS;
}

function ytPlay(id,title){
  var p=document.getElementById('cb_yt-player');
  if(p)p.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0" allow="autoplay;encrypted-media" allowfullscreen style="width:100%;height:100%;border:none;border-radius:3px"></iframe>';
  var tn=document.getElementById('track-name');
  if(tn)tn.textContent=(title||id).slice(0,60);
}
