// NODE-0 127D shield — exact watch face replica + audio reactive
var BLM=['#993366','#00aadd','#ffaa00','#ff4444','#44aa44','#aa44ff','#cccccc'];
var MERS=['#88ddff','#aaff88','#ff88dd','#ffcc44','#dd66ff'];
var GOLD='#d4a94a',GA=Math.PI*(3-Math.sqrt(5)),P2=Math.PI*2;
var _an=null,_fr=null;

function fS(n){var o=[];for(var i=0;i<n;i++){var t=(2*i+1)/(2*n),c=1-2*t,s=Math.sqrt(Math.max(0,1-c*c));o.push({x:s*Math.cos(GA*i),y:s*Math.sin(GA*i),z:c})}return o}
function fE(nodes,dist){var e=[],d2=dist*dist;for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var a=nodes[i],b=nodes[j];if(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2)+Math.pow(a.z-b.z,2)<d2)e.push([i,j])}return e}
function r3(n,ay,ax){var x1=n.x*Math.cos(ay)+n.z*Math.sin(ay),z1=-n.x*Math.sin(ay)+n.z*Math.cos(ay);return{x:x1,y:n.y*Math.cos(ax)-z1*Math.sin(ax),z:n.y*Math.sin(ax)+z1*Math.cos(ax)}}
function pj(n,cx,cy,r){var f=2.8,s=r*f/(f+n.z+1.3);return{sx:cx+n.x*s,sy:cy-n.y*s,d:Math.max(0,(n.z+1.5)/3)}}

var OUTER=[
{n:127,r:1.45,color:'rgba(26,42,74,0.15)',sy:0.15,sx:0.06,cd:0.50},
{n:127,r:1.30,color:'rgba(34,51,85,0.18)',sy:0.20,sx:0.08,cd:0.52},
{n:127,r:1.18,color:'rgba(42,68,102,0.22)',sy:0.25,sx:0.10,cd:0.52},
{n:127,r:1.08,color:MERS[4],sy:0.30,sx:0.12,cd:0.53},
{n:127,r:0.95,color:MERS[3],sy:0.35,sx:0.14,cd:0.53}];
var INNER=[
{n:127,r:0.72,color:'#00ccff',sy:0.50,sx:0.20,cd:0.54},
{n:127,r:0.52,color:'#ff4444',sy:0.65,sx:0.28,cd:0.54},
{n:127,r:0.38,color:'#00aadd',sy:0.80,sx:0.35,cd:0.54},
{n:89,r:0.28,color:'#44aa44',sy:1.00,sx:0.45,cd:0.56},
{n:61,r:0.20,color:GOLD,sy:1.20,sx:0.55,cd:0.58},
{n:37,r:0.13,color:'#aa44ff',sy:1.50,sx:0.70,cd:0.62},
{n:19,r:0.07,color:'#ffffff',sy:2.00,sx:0.90,cd:0.70}];
var BLM_ORB=[
{orbit:0.55,tX:0.3,tZ:0,sp:0.30,ct:2,c:BLM[0],on:12},
{orbit:0.62,tX:0.44,tZ:0.19,sp:-0.18,ct:3,c:BLM[1],on:14},
{orbit:0.69,tX:0.58,tZ:0.38,sp:0.14,ct:5,c:BLM[2],on:16},
{orbit:0.76,tX:0.72,tZ:0.57,sp:-0.10,ct:7,c:BLM[3],on:18},
{orbit:0.83,tX:0.86,tZ:0.76,sp:0.08,ct:11,c:BLM[4],on:14},
{orbit:0.90,tX:1.0,tZ:0.95,sp:-0.06,ct:13,c:BLM[5],on:12},
{orbit:0.97,tX:1.14,tZ:1.14,sp:0.05,ct:17,c:BLM[6],on:10}];
var MER_ORB=[
{orbit:1.10,tX:0.2,tZ:-0.15,sp:0.15,ct:3,c:MERS[0],on:12},
{orbit:1.21,tX:0.42,tZ:-0.33,sp:-0.08,ct:3,c:MERS[1],on:12},
{orbit:1.32,tX:0.64,tZ:-0.51,sp:0.06,ct:2,c:MERS[2],on:12},
{orbit:1.43,tX:0.86,tZ:-0.69,sp:-0.04,ct:3,c:MERS[3],on:12},
{orbit:1.54,tX:1.08,tZ:-0.87,sp:0.035,ct:2,c:MERS[4],on:12}];

var ALL=OUTER.concat(INNER);
var pre=ALL.map(function(l){return{nodes:fS(l.n),ed:fE(fS(l.n),l.cd),r:l.r,color:l.color,sy:l.sy,sx:l.sx}});

function initShield(canvasId,micBtnId,tabBtnId){
var cv=document.getElementById(canvasId),x=cv.getContext('2d'),W,H;
function sz(){W=cv.width=cv.parentElement.clientWidth;H=cv.height=cv.parentElement.clientHeight}
sz();window.addEventListener('resize',sz);

function hook(stream){var ac=new AudioContext(),src=ac.createMediaStreamSource(stream);_an=ac.createAnalyser();_an.fftSize=128;_fr=new Uint8Array(_an.frequencyBinCount);src.connect(_an)}
function setMicLabel(on){var b=micBtnId&&document.getElementById(micBtnId);if(!b)return;b.textContent=on?'🔴 Mic':'⚪ Mic';b.style.borderColor=on?'#ff4466':'#0af';b.style.color=on?'#ff4466':'#0af'}
function setTabLabel(on){var b=tabBtnId&&document.getElementById(tabBtnId);if(!b)return;b.textContent=on?'🔴 Tab':'⚪ Tab';b.style.borderColor=on?'#ff4466':'#0af';b.style.color=on?'#ff4466':'#0af'}
async function grabMic(){if(_an)return;try{hook(await navigator.mediaDevices.getUserMedia({audio:true}));setMicLabel(true)}catch(e){}}
async function grabTab(){if(_an)return;try{var s=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true,preferCurrentTab:true,selfBrowserSurface:'include',systemAudio:'include'});s.getVideoTracks().forEach(function(t){t.stop()});hook(s);setTabLabel(true)}catch(e){}}
if(micBtnId){var mb=document.getElementById(micBtnId);if(mb)mb.onclick=grabMic}
if(tabBtnId){var tb=document.getElementById(tabBtnId);if(tb)tb.onclick=grabTab}

// Auto-prime mic on first user gesture, then keep retrying every 5s until
// permission is granted. Inside an iframe this works as long as the parent
// forwards mic permission via allow="microphone *". Tab/system audio still
// needs an explicit click because getDisplayMedia is gated to user activation.
(function autoPrime(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return;
  var timer=null,armed=false;
  function tick(){if(_an){if(timer){clearInterval(timer);timer=null}return}grabMic()}
  function arm(){if(armed)return;armed=true;tick();if(!_an&&!timer)timer=setInterval(tick,5000)}
  window.addEventListener('pointerdown',arm,{capture:true,once:true});
  window.addEventListener('keydown',arm,{capture:true,once:true});
  if(navigator.permissions&&navigator.permissions.query){navigator.permissions.query({name:'microphone'}).then(function(p){if(p.state==='granted')tick()}).catch(function(){})}
  // Parent SCADA page signals when it has acquired the shared mic — prime immediately
  window.addEventListener('message',function(ev){if(ev.data&&ev.data.type==='konomioke-mic-ready')arm()});
})();

function dOrb(l,cx,cy,r,s,av,band,idx){
var dir=idx%2?-1:1;
var bv=band||0;
var rotY=s*l.sy*(1+bv*3)+bv*dir*2;
var rotX=s*l.sx*(1+bv*2)+bv*dir*1.5;
var rotZ=bv*dir*Math.sin(s*0.5)*1.5;
var sc=1+bv*0.15+av*0.05;
var rot=l.nodes.map(function(n){
  var p={x:n.x*l.r*sc,y:n.y*l.r*sc,z:n.z*l.r*sc};
  p=r3(p,rotY,rotX);
  var x1=p.x*Math.cos(rotZ)-p.y*Math.sin(rotZ);
  var y1=p.x*Math.sin(rotZ)+p.y*Math.cos(rotZ);
  return{x:x1,y:y1,z:p.z}});
var prj=rot.map(function(n){return pj(n,cx,cy,r)});
for(var k=0;k<l.ed.length;k++){var a=l.ed[k][0],b=l.ed[k][1],pa=prj[a],pb=prj[b],m=(pa.d+pb.d)*0.5;x.strokeStyle=l.color;x.globalAlpha=Math.max(0,0.04+m*0.25+bv*0.2);x.lineWidth=Math.max(0.1,0.2+m*0.6+bv*0.8);x.beginPath();x.moveTo(pa.sx,pa.sy);x.lineTo(pb.sx,pb.sy);x.stroke()}
for(var k=0;k<prj.length;k++){var p=prj[k];x.fillStyle=l.color;x.globalAlpha=Math.max(0,0.12+p.d*0.65+bv*0.25);x.beginPath();x.arc(p.sx,p.sy,Math.max(0.1,0.4+p.d*1.8+bv*2),0,P2);x.fill()}}

function dMini(cx,cy,r,color,s,n){
var nodes=fS(n),rot=nodes.map(function(nd){return r3({x:nd.x*r,y:nd.y*r,z:nd.z*r},s*0.5,s*0.3)});
var prj=rot.map(function(nd){return pj(nd,cx,cy,1)});
for(var k=0;k<prj.length;k++){x.fillStyle=color;x.globalAlpha=Math.max(0,0.2+prj[k].d*0.6);x.beginPath();x.arc(prj[k].sx,prj[k].sy,Math.max(0.1,0.5+prj[k].d*1.2),0,P2);x.fill()}}

function dOrbital(sh,cx,cy,scale,s,av,band){
var bv=band||0;
var wX=sh.tX+0.12*Math.sin(s*0.2)+bv*0.5,wZ=sh.tZ+0.08*Math.cos(s*0.15)+bv*0.3;
var cX=Math.cos(wX),sX=Math.sin(wX),cZ=Math.cos(wZ),sZ=Math.sin(wZ);
for(var i=0;i<sh.ct;i++){var a=i/sh.ct*P2+s*sh.sp*(1+bv*4+av*2);
var orb=sh.orbit*(1+bv*0.1);
var ox=Math.cos(a)*orb,oy=Math.sin(a)*orb;
var oy2=oy*cX,oz2=oy*sX,ox3=ox*cZ-oy2*sZ,oy3=ox*sZ+oy2*cZ;
var f=2.8,sc=scale*f/(f+oz2+1.3),sx=cx+ox3*sc,sy=cy-oy3*sc,d=Math.max(0,(oz2+1.5)/3);
if(d>0.15)dMini(sx,sy,scale*(0.035+bv*0.02)*(0.5+d*0.6),sh.c,s+i*3+bv*5,sh.on)}}

// Auto-prime mic on first user gesture, then keep retrying every 5s until
// permission is granted. Same pattern as the konomioke engine — works inside
// an iframe as long as the parent forwards microphone permission via
// allow="microphone *". Tab/system audio still needs an explicit click
// because getDisplayMedia is gated to user activation.
function frame(ts){requestAnimationFrame(frame);
var s=ts/1000,av=0,bands=new Float32Array(12);
if(_an&&_fr){try{_an.getByteFrequencyData(_fr);
var n=_fr.length,bw=Math.floor(n/12);
for(var b=0;b<12;b++){var sum=0;for(var j=b*bw;j<(b+1)*bw&&j<n;j++)sum+=_fr[j]/255;bands[b]=sum/bw;av+=bands[b]}
av/=12}catch(e){}}
x.globalAlpha=1;x.clearRect(0,0,W,H);
var cx=W/2,cy=H/2,r=Math.min(cx,cy)*0.82;
x.globalAlpha=Math.max(0,0.06+av*0.12);x.fillStyle='#0af';x.beginPath();x.arc(cx,cy,r*(1.5+av*0.3),0,P2);x.fill();
for(var i=0;i<5;i++)dOrb(pre[i],cx,cy,r,s,av,bands[i],i);
for(var i=0;i<MER_ORB.length;i++)dOrbital(MER_ORB[i],cx,cy,r,s,av,bands[i+5]);
for(var i=0;i<BLM_ORB.length;i++)dOrbital(BLM_ORB[i],cx,cy,r,s,av,bands[Math.min(i,11)]);
for(var i=5;i<pre.length;i++)dOrb(pre[i],cx,cy,r,s,av,bands[Math.min(i+2,11)],i);
var p=0.85+0.15*Math.sin(s*2.6)+av*0.5;x.globalAlpha=Math.max(0,0.5*p);x.fillStyle=GOLD;x.beginPath();x.arc(cx,cy,Math.max(0.1,r*(0.015+av*0.02)*p),0,P2);x.fill();
x.globalAlpha=Math.max(0,0.9*p);x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,Math.max(0.1,r*0.006*p),0,P2);x.fill()}
requestAnimationFrame(frame)}
