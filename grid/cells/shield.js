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
{n:127,r:1.45,color:'rgba(26,42,74,0.15)',sy:0.04,sx:0.015,cd:0.50},
{n:127,r:1.30,color:'rgba(34,51,85,0.18)',sy:0.06,sx:0.02,cd:0.52},
{n:127,r:1.18,color:'rgba(42,68,102,0.22)',sy:0.08,sx:0.03,cd:0.52},
{n:127,r:1.08,color:MERS[4],sy:0.10,sx:0.035,cd:0.53},
{n:127,r:0.95,color:MERS[3],sy:0.12,sx:0.04,cd:0.53}];
var INNER=[
{n:127,r:0.72,color:'#00ccff',sy:0.18,sx:0.06,cd:0.54},
{n:127,r:0.52,color:'#ff4444',sy:0.25,sx:0.09,cd:0.54},
{n:127,r:0.38,color:'#00aadd',sy:0.35,sx:0.13,cd:0.54},
{n:89,r:0.28,color:'#44aa44',sy:0.45,sx:0.17,cd:0.56},
{n:61,r:0.20,color:GOLD,sy:0.55,sx:0.20,cd:0.58},
{n:37,r:0.13,color:'#aa44ff',sy:0.70,sx:0.25,cd:0.62},
{n:19,r:0.07,color:'#ffffff',sy:0.90,sx:0.32,cd:0.70}];
var BLM_ORB=[
{orbit:0.55,tX:0.3,tZ:0,sp:0.10,ct:2,c:BLM[0],on:12},
{orbit:0.62,tX:0.44,tZ:0.19,sp:-0.05,ct:3,c:BLM[1],on:14},
{orbit:0.69,tX:0.58,tZ:0.38,sp:0.04,ct:5,c:BLM[2],on:16},
{orbit:0.76,tX:0.72,tZ:0.57,sp:-0.03,ct:7,c:BLM[3],on:18},
{orbit:0.83,tX:0.86,tZ:0.76,sp:0.02,ct:11,c:BLM[4],on:14},
{orbit:0.90,tX:1.0,tZ:0.95,sp:-0.018,ct:13,c:BLM[5],on:12},
{orbit:0.97,tX:1.14,tZ:1.14,sp:0.015,ct:17,c:BLM[6],on:10}];
var MER_ORB=[
{orbit:1.10,tX:0.2,tZ:-0.15,sp:0.05,ct:3,c:MERS[0],on:12},
{orbit:1.21,tX:0.42,tZ:-0.33,sp:-0.025,ct:3,c:MERS[1],on:12},
{orbit:1.32,tX:0.64,tZ:-0.51,sp:0.017,ct:2,c:MERS[2],on:12},
{orbit:1.43,tX:0.86,tZ:-0.69,sp:-0.013,ct:3,c:MERS[3],on:12},
{orbit:1.54,tX:1.08,tZ:-0.87,sp:0.010,ct:2,c:MERS[4],on:12}];

var ALL=OUTER.concat(INNER);
var pre=ALL.map(function(l){return{nodes:fS(l.n),ed:fE(fS(l.n),l.cd),r:l.r,color:l.color,sy:l.sy,sx:l.sx}});

function initShield(canvasId,micBtnId,tabBtnId){
var cv=document.getElementById(canvasId),x=cv.getContext('2d'),W,H;
function sz(){W=cv.width=cv.parentElement.clientWidth;H=cv.height=cv.parentElement.clientHeight}
sz();window.addEventListener('resize',sz);

function hook(stream){var ac=new AudioContext(),src=ac.createMediaStreamSource(stream);_an=ac.createAnalyser();_an.fftSize=128;_fr=new Uint8Array(_an.frequencyBinCount);src.connect(_an)}
if(micBtnId)document.getElementById(micBtnId).onclick=async function(){try{hook(await navigator.mediaDevices.getUserMedia({audio:true}));this.textContent='🔴 Mic';this.style.borderColor='#ff4466'}catch(e){}};
if(tabBtnId)document.getElementById(tabBtnId).onclick=async function(){try{var s=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true,preferCurrentTab:true,selfBrowserSurface:'include',systemAudio:'include'});s.getVideoTracks().forEach(function(t){t.stop()});hook(s);this.textContent='🔴 Tab';this.style.borderColor='#ff4466'}catch(e){}};

function dOrb(l,cx,cy,r,s,av){
var rot=l.nodes.map(function(n){return r3({x:n.x*l.r*(1+av*0.05),y:n.y*l.r*(1+av*0.05),z:n.z*l.r},s*l.sy+av*0.2,s*l.sx)});
var prj=rot.map(function(n){return pj(n,cx,cy,r)});
for(var k=0;k<l.ed.length;k++){var a=l.ed[k][0],b=l.ed[k][1],pa=prj[a],pb=prj[b],m=(pa.d+pb.d)*0.5;x.strokeStyle=l.color;x.globalAlpha=Math.max(0,0.04+m*0.25+av*0.1);x.lineWidth=Math.max(0.1,0.2+m*0.6);x.beginPath();x.moveTo(pa.sx,pa.sy);x.lineTo(pb.sx,pb.sy);x.stroke()}
for(var k=0;k<prj.length;k++){var p=prj[k];x.fillStyle=l.color;x.globalAlpha=Math.max(0,0.12+p.d*0.65+av*0.15);x.beginPath();x.arc(p.sx,p.sy,Math.max(0.1,0.4+p.d*1.8+av*1.2),0,P2);x.fill()}}

function dMini(cx,cy,r,color,s,n){
var nodes=fS(n),rot=nodes.map(function(nd){return r3({x:nd.x*r,y:nd.y*r,z:nd.z*r},s*0.5,s*0.3)});
var prj=rot.map(function(nd){return pj(nd,cx,cy,1)});
for(var k=0;k<prj.length;k++){x.fillStyle=color;x.globalAlpha=Math.max(0,0.2+prj[k].d*0.6);x.beginPath();x.arc(prj[k].sx,prj[k].sy,Math.max(0.1,0.5+prj[k].d*1.2),0,P2);x.fill()}}

function dOrbital(sh,cx,cy,scale,s,av){
var wX=sh.tX+0.12*Math.sin(s*0.2),wZ=sh.tZ+0.08*Math.cos(s*0.15);
var cX=Math.cos(wX),sX=Math.sin(wX),cZ=Math.cos(wZ),sZ=Math.sin(wZ);
for(var i=0;i<sh.ct;i++){var a=i/sh.ct*P2+s*sh.sp*(1+av*0.5);
var ox=Math.cos(a)*sh.orbit,oy=Math.sin(a)*sh.orbit;
var oy2=oy*cX,oz2=oy*sX,ox3=ox*cZ-oy2*sZ,oy3=ox*sZ+oy2*cZ;
var f=2.8,sc=scale*f/(f+oz2+1.3),sx=cx+ox3*sc,sy=cy-oy3*sc,d=Math.max(0,(oz2+1.5)/3);
if(d>0.15)dMini(sx,sy,scale*0.035*(0.5+d*0.6),sh.c,s+i*3,sh.on)}}

function frame(ts){requestAnimationFrame(frame);
var s=ts/1000,av=0;
if(_an&&_fr){try{_an.getByteFrequencyData(_fr);for(var j=0;j<_fr.length;j++)av+=_fr[j]/255;av/=_fr.length}catch(e){}}
x.globalAlpha=1;x.clearRect(0,0,W,H);
var cx=W/2,cy=H/2,r=Math.min(cx,cy)*0.82;
x.globalAlpha=Math.max(0,0.06+av*0.08);x.fillStyle='#0af';x.beginPath();x.arc(cx,cy,r*1.5,0,P2);x.fill();
for(var i=0;i<5;i++)dOrb(pre[i],cx,cy,r,s,av);
for(var i=0;i<MER_ORB.length;i++)dOrbital(MER_ORB[i],cx,cy,r,s,av);
for(var i=0;i<BLM_ORB.length;i++)dOrbital(BLM_ORB[i],cx,cy,r,s,av);
for(var i=5;i<pre.length;i++)dOrb(pre[i],cx,cy,r,s,av);
var p=0.85+0.15*Math.sin(s*2.6)+av*0.3;x.globalAlpha=Math.max(0,0.5*p);x.fillStyle=GOLD;x.beginPath();x.arc(cx,cy,Math.max(0.1,r*0.015*p),0,P2);x.fill();
x.globalAlpha=Math.max(0,0.9*p);x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,Math.max(0.1,r*0.006*p),0,P2);x.fill()}
requestAnimationFrame(frame)}
