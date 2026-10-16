/* 3D office: scene, character, controls and the reading panel. Text lives in content.js. */
(function () {
'use strict';

const CLASSIC = 'classic.html';
const toClassic = () => location.replace(CLASSIC + location.hash);

function hasWebGL(){
  try{ const c=document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2')||c.getContext('webgl'))); }
  catch(_){ return false; }
}
// No Three.js (CDN blocked or SRI mismatch), no content, or no WebGL: fall back to the classic page.
if(!window.THREE || !window.OFFICE_CONTENT || !hasWebGL()){ toClassic(); return; }

const { LINKS, SECTIONS } = window.OFFICE_CONTENT;

/* ---------------- Layout ---------------- */
const CABINS = [
  {id:'about',      x0:-13,x1:-3, z0:-8, z1:3,   door:{x:-3,z:-2.5, nx:1, nz:0}, wood:'#6b4e37'},
  {id:'projects',   x0:3,  x1:13, z0:-8, z1:3,   door:{x:3, z:-2.5, nx:-1,nz:0}, wood:'#5d4a3a'},
  {id:'experience', x0:-13,x1:-3, z0:-19,z1:-8,  door:{x:-3,z:-13.5,nx:1, nz:0}, wood:'#5d4a3a'},
  {id:'life',       x0:3,  x1:13, z0:-19,z1:-8,  door:{x:3, z:-13.5,nx:-1,nz:0}, wood:'#6b4e37'},
  {id:'contact',    x0:-13,x1:13, z0:-34,z1:-26, door:{x:0, z:-26,  nx:0, nz:1}, wood:'#5a4636'},
];
CABINS.forEach(c=>{
  c.n=SECTIONS[c.id].n; c.name=SECTIONS[c.id].name;
  const d=c.door;
  c.out ={x:d.x+d.nx*1.6, z:d.z+d.nz*1.6};
  c.in  ={x:d.x-d.nx*1.6, z:d.z-d.nz*1.6};
  c.stand={x:d.x-d.nx*3.4, z:d.z-d.nz*3.4};
  c.cx=(c.x0+c.x1)/2; c.cz=(c.z0+c.z1)/2;
});
const byId = id => CABINS.find(c=>c.id===id);
const LOBBY = {x:0, z:9};
const isPlace = id => id==='lobby' || !!byId(id);
const initialHash = location.hash.slice(1);

/* ---------------- UI ---------------- */
const $ = id => document.getElementById(id);
const panel=$('panel'), panelBody=$('panelBody'), panelTag=$('panelTag'), dock=$('dock'), hint=$('hint'), loader=$('loader'), classicLink=$('classicLink');
$('resumeLink').href = LINKS.resume;

if(matchMedia('(pointer: coarse)').matches) hint.innerHTML='Tap the floor to walk · pinch to zoom · or pick a cabin below';

dock.innerHTML = `<button type="button" data-go="lobby" aria-current="false"><span aria-hidden="true">00</span>Lobby</button>` +
  CABINS.map(c=>`<button type="button" data-go="${c.id}" aria-current="false"><span aria-hidden="true">${c.n}</span>${c.name}</button>`).join('');
const dockButtons=[...dock.querySelectorAll('button')];

const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduceMQ.matches;
reduceMQ.addEventListener ? reduceMQ.addEventListener('change',e=>reduce=e.matches) : reduceMQ.addListener(e=>reduce=e.matches);

let openId=null, returnFocus=null, panelH=0;
function measurePanel(){ panelH=panel.offsetHeight; }
if(window.ResizeObserver) new ResizeObserver(measurePanel).observe(panel);

function setHash(id){
  try{ history.replaceState(null,'', id ? '#'+id : location.pathname+location.search); }catch(_){}
  classicLink.href = CLASSIC + (id ? '#'+id : '');
}
function openPanel(id){
  const c=byId(id); if(!c) return;
  if(openId!==id){
    panelTag.textContent=`Cabin ${c.n} · ${c.name}`;
    panelBody.innerHTML=`<div class="sec">${SECTIONS[id].html}</div>`;
    panelBody.scrollTop=0;
    const h=panelBody.querySelector('h2'); h.id='panelTitle'; h.tabIndex=-1;
  }
  if(!panel.classList.contains('open') && !panel.contains(document.activeElement)) returnFocus=document.activeElement;
  openId=id;
  panel.inert=false; panel.removeAttribute('inert'); panel.setAttribute('aria-hidden','false');
  panel.classList.add('open');
  $('panelTitle').focus({preventScroll:true});
  measurePanel(); setCurrent(id); setHash(id);
}
// restore=true when the visitor dismissed the panel (Esc / ×); false when they walked out of the cabin.
function closePanel(restore){
  if(!panel.classList.contains('open')) return;
  const hadFocus=panel.contains(document.activeElement);
  openId=null;
  panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); panel.setAttribute('inert','');
  if(hadFocus){
    if(restore && returnFocus && returnFocus.isConnected && returnFocus!==document.body) returnFocus.focus({preventScroll:true});
    else document.activeElement.blur();
  }
  returnFocus=null; setHash(null);
}
function setCurrent(id){
  dockButtons.forEach(b=>b.setAttribute('aria-current', b.dataset.go===id ? 'true':'false'));
  const cur=dockButtons.find(b=>b.dataset.go===id);
  if(cur){ const l=cur.offsetLeft, r=l+cur.offsetWidth;
    if(l<dock.scrollLeft) dock.scrollLeft=l-5; else if(r>dock.scrollLeft+dock.clientWidth) dock.scrollLeft=r-dock.clientWidth+5; }
}
$('closeBtn').onclick=()=>closePanel(true);

// Arrow keys move between dock buttons, but only when the dock has keyboard focus;
// after a mouse click on the dock, arrows keep walking the character.
dock.addEventListener('keydown',e=>{
  const i=dockButtons.indexOf(document.activeElement); if(i<0) return;
  let kb=true; try{ kb=document.activeElement.matches(':focus-visible'); }catch(_){}
  if(!kb) return;
  const n=dockButtons.length;
  const j = e.key==='ArrowRight'?(i+1)%n : e.key==='ArrowLeft'?(i-1+n)%n : e.key==='Home'?0 : e.key==='End'?n-1 : null;
  if(j===null) return;
  e.preventDefault(); e.stopPropagation(); dockButtons[j].focus();
});

document.addEventListener('click',e=>{
  const b=e.target.closest('.copy'); if(!b) return;
  const done=()=>{ b.textContent='Copied'; setTimeout(()=>b.textContent='Copy email',1600); };
  const fallback=()=>{ const s=b.parentElement.querySelector('.email'); const r=document.createRange(); r.selectNodeContents(s); const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r); b.textContent='Selected, press Ctrl+C'; };
  try{ navigator.clipboard.writeText(b.dataset.copy).then(done, fallback); }catch(_){ fallback(); }
});

/* ---------------- Boot ---------------- */
let renderer;
try{
  // MSAA is mostly wasted on high-density screens; skip it there to save fill rate.
  renderer = new THREE.WebGLRenderer({canvas:$('stage'), antialias:devicePixelRatio<2, powerPreference:'high-performance'});
}catch(e){ toClassic(); return; }

// Door signs and the floor name are drawn to canvas textures, so their fonts must be loaded first.
const FONTS=['800 64px "Bricolage Grotesque"','700 64px "Bricolage Grotesque"','500 32px "IBM Plex Mono"','600 32px "IBM Plex Mono"'];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const fontsReady = document.fonts && document.fonts.load
  ? Promise.race([Promise.all(FONTS.map(f=>document.fonts.load(f))).catch(()=>{}), wait(3000)])
  : Promise.resolve();
fontsReady.then(()=>{ try{ build3D(); }catch(e){ console.error(e); toClassic(); } });

function build3D(){
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;   // the scene is static; re-render shadows only when the character moves

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d131e);
scene.fog = new THREE.Fog(0x0d131e, 34, 70);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

/* lights */
scene.add(new THREE.HemisphereLight(0xc4d6ff, 0x1a1c24, 0.62));
const sun = new THREE.DirectionalLight(0xfff1dd, 0.75);
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:60});
sun.shadow.bias=-0.0006;
scene.add(sun, sun.target);

/* textures */
function canvasTex(w,h,draw,repeat){
  const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  if(repeat){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(repeat[0],repeat[1]); }
  return t;
}
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

const tileTex = canvasTex(128,128,(g,w,h)=>{ g.fillStyle='#1b2433'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,255,255,0.05)'; g.lineWidth=2; g.strokeRect(0,0,w,h); }, [26,46]);
function woodTex(base,rw,rh){ return canvasTex(256,256,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h);
  for(let i=0;i<8;i++){ g.fillStyle=`rgba(0,0,0,${0.05+((i*37)%5)*0.025})`; g.fillRect(0,i*32,w,30); g.fillStyle='rgba(0,0,0,0.35)'; g.fillRect(0,i*32+30,w,2); g.fillRect(((i*91)%200)+20,i*32,2,32);} },[rw,rh]); }
const codeTex = canvasTex(256,160,(g,w,h)=>{ g.fillStyle='#0f1b2c'; g.fillRect(0,0,w,h);
  const cols=['#f2a541','#8fd0df','#b49cff','#7fd18b','#e9edf3']; let y=14;
  for(let i=0;i<12;i++){ let x=14+((i*3)%4)*14; const n=1+(i%3); for(let k=0;k<n;k++){ const len=20+((i*17+k*29)%60); g.fillStyle=cols[(i+k)%cols.length]; g.globalAlpha=.85; g.fillRect(x,y,len,5); x+=len+8; } y+=12; } });

/* materials */
const M = {
  floor: new THREE.MeshStandardMaterial({map:tileTex, roughness:.9}),
  runner: new THREE.MeshStandardMaterial({color:0x26324a, roughness:1}),
  wall: new THREE.MeshStandardMaterial({color:0x2a3546, roughness:.85}),
  frame: new THREE.MeshStandardMaterial({color:0x9aa4b5, roughness:.4, metalness:.6}),
  glass: new THREE.MeshStandardMaterial({color:0x8fd0df, transparent:true, opacity:.13, roughness:.1, metalness:.1, depthWrite:false, side:THREE.DoubleSide}),
  oak: new THREE.MeshStandardMaterial({color:0xcdb796, roughness:.7}),
  dark: new THREE.MeshStandardMaterial({color:0x1d232d, roughness:.6}),
  metal: new THREE.MeshStandardMaterial({color:0x6d7787, roughness:.4, metalness:.7}),
  chair: new THREE.MeshStandardMaterial({color:0x34495e, roughness:.8}),
  screen: new THREE.MeshBasicMaterial({map:codeTex}),
  pot: new THREE.MeshStandardMaterial({color:0xd9d2c6, roughness:.8}),
  leaf: new THREE.MeshStandardMaterial({color:0x3e7a56, roughness:.8, flatShading:true}),
  leaf2: new THREE.MeshStandardMaterial({color:0x2f6447, roughness:.8, flatShading:true}),
  white: new THREE.MeshStandardMaterial({color:0xf2f2ee, roughness:.6}),
  amber: new THREE.MeshStandardMaterial({color:0xf2a541, roughness:.5}),
  sofa: new THREE.MeshStandardMaterial({color:0x7a4f3a, roughness:.9}),
};
// shared plain-color materials (books, rugs) instead of one material per mesh
const matCache={};
const flat=(color,roughness)=>matCache[color+'|'+roughness]||(matCache[color+'|'+roughness]=new THREE.MeshStandardMaterial({color,roughness}));

/* helpers */
const colliders=[];
const H=2.6, T=0.16;
function mesh(geo,mat,x,y,z,parent,cast=true){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; (parent||scene).add(m); return m; }
function box(w,h,d,mat,x,y,z,parent,cast){ return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent,cast); }
function collideObj(o,pad=0){ o.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(o); colliders.push({x0:b.min.x-pad,x1:b.max.x+pad,z0:b.min.z-pad,z1:b.max.z+pad}); }

// axis-aligned wall with door gaps. along:'x' runs along x at z=fixed; 'z' runs along z at x=fixed
function wall(along,a0,a1,fixed,kind,gaps=[]){
  const lo=Math.min(a0,a1), hi=Math.max(a0,a1);
  let segs=[[lo,hi]];
  gaps.forEach(g=>{ const s=g.c-g.w/2, e=g.c+g.w/2; segs=segs.flatMap(([a,b])=> (e<=a||s>=b)?[[a,b]]:[[a,s],[e,b]].filter(([p,q])=>q-p>0.01));
    // lintel above the door
    if(kind!=='solid'){ const L=g.w; const lx=along==='x'?g.c:fixed, lz=along==='x'?fixed:g.c;
      box(along==='x'?L:T,0.4,along==='x'?T:L,M.frame,lx,H-0.2,lz); }
  });
  segs.forEach(([a,b])=>{
    const L=b-a, c=(a+b)/2;
    const P=(len,h,y,mat,cast)=> along==='x' ? box(len,h,T,mat,c,y,fixed,null,cast) : box(T,h,len,mat,fixed,y,c,null,cast);
    if(kind==='solid'){ P(L,H,H/2,M.wall,true); }
    else{
      const g = along==='x' ? box(L,H-0.24,0.04,M.glass,c,H/2,fixed,null,false) : box(0.04,H-0.24,L,M.glass,fixed,H/2,c,null,false);
      g.receiveShadow=false;
      P(L,0.12,0.06,M.frame,false); P(L,0.12,H-0.06,M.frame,false);
      const n=Math.max(1,Math.round(L/2.6));
      for(let i=0;i<=n;i++){ const p=a+L*i/n; along==='x'?box(0.07,H,0.07,M.frame,p,H/2,fixed):box(0.07,H,0.07,M.frame,fixed,H/2,p); }
    }
    colliders.push(along==='x'?{x0:a,x1:b,z0:fixed-T/2,z1:fixed+T/2}:{x0:fixed-T/2,x1:fixed+T/2,z0:a,z1:b});
  });
}

/* floor */
const floor = mesh(new THREE.PlaneGeometry(26,46), M.floor, 0,0,-11, null, false); floor.rotation.x=-Math.PI/2;
const runner = mesh(new THREE.PlaneGeometry(2.2,29), M.runner, 0,0.01,-11.5, null,false); runner.rotation.x=-Math.PI/2;
CABINS.forEach(c=>{
  const w=c.x1-c.x0, d=c.z1-c.z0;
  const f=mesh(new THREE.PlaneGeometry(w,d), new THREE.MeshStandardMaterial({map:woodTex(c.wood,w/2.5,d/2.5),roughness:.75}), c.cx,0.012,c.cz,null,false);
  f.rotation.x=-Math.PI/2;
  const lamp=new THREE.PointLight(0xffc27a, 0.9, 14, 1.6); lamp.position.set(c.cx,2.4,c.cz); scene.add(lamp);
});

/* lobby name on the floor */
const nameTex = canvasTex(2048,512,(g,w,h)=>{
  g.clearRect(0,0,w,h);
  g.fillStyle='#e9edf3'; g.font='800 230px "Bricolage Grotesque", sans-serif'; g.textAlign='center'; g.textBaseline='alphabetic';
  g.fillText('TANISHKA SONAR', w/2, 290);
  g.fillStyle='#f2a541'; g.font='500 64px "IBM Plex Mono", monospace';
  g.fillText('MS CS · RICE UNIVERSITY · ML & DATA SCIENCE', w/2, 420);
});
const nameDecal = mesh(new THREE.PlaneGeometry(12,3), new THREE.MeshStandardMaterial({map:nameTex, transparent:true, roughness:.9}), 0,0.02,5.6,null,false);
nameDecal.rotation.x=-Math.PI/2;

/* walls */
wall('x',-13,13,12,'solid'); wall('x',-13,13,-34,'solid');
wall('z',12,-34,-13,'solid'); wall('z',12,-34,13,'solid');
wall('x',-13,-3,3,'glass'); wall('x',3,13,3,'glass');
wall('z',3,-26,-3,'glass',[{c:-2.5,w:2.4},{c:-13.5,w:2.4}]);
wall('z',3,-26, 3,'glass',[{c:-2.5,w:2.4},{c:-13.5,w:2.4}]);
wall('x',-13,-3,-8,'glass'); wall('x',3,13,-8,'glass');
wall('x',-13,-3,-19,'glass'); wall('x',3,13,-19,'glass');
wall('x',-13,13,-26,'glass',[{c:0,w:2.4}]);

/* furniture */
function plant(x,z,s=1){ const g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  mesh(new THREE.CylinderGeometry(.28*s,.22*s,.5*s,14),M.pot,0,.25*s,0,g);
  mesh(new THREE.IcosahedronGeometry(.55*s,0),M.leaf,0,.95*s,0,g);
  mesh(new THREE.IcosahedronGeometry(.4*s,0),M.leaf2,.25*s,1.35*s,.1*s,g);
  mesh(new THREE.IcosahedronGeometry(.32*s,0),M.leaf,-.2*s,1.45*s,-.1*s,g);
  collideObj(g,-.15); return g; }
function desk(x,z,rot=0,screens=1){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  box(2.2,.07,1,M.oak,0,.76,0,g);
  [[-1,-.42],[1,-.42],[-1,.42],[1,.42]].forEach(([a,b])=>box(.06,.74,.06,M.metal,a,.37,b,g));
  for(let i=0;i<screens;i++){ const ox=screens===1?0:(i-.5)*.95;
    box(.9,.56,.05,M.dark,ox,1.18,-.3,g); box(.82,.48,.01,M.screen,ox,1.18,-.27,g,false);
    box(.06,.3,.06,M.metal,ox,.92,-.32,g); }
  box(.55,.02,.18,M.dark,0,.8,.1,g);
  const ch=new THREE.Group(); ch.position.set(.1,0,.85); g.add(ch);
  box(.55,.08,.55,M.chair,0,.5,0,ch); box(.55,.6,.07,M.chair,0,.85,.26,ch); box(.06,.46,.06,M.metal,0,.25,0,ch);
  collideObj(g,0); return g; }
function shelf(x,z,rot=0){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  box(2,2,.4,M.dark,0,1,0,g);
  const bc=[0xf2a541,0x8fd0df,0xb49cff,0xe9edf3,0x7fd18b,0xd9775b];
  for(let r=0;r<4;r++){ box(1.9,.04,.38,M.oak,0,.15+r*.47,.02,g); let px=-.85;
    for(let k=0;k<7;k++){ const w=.08+((r*7+k)%3)*.04, h=.28+((r+k)%3)*.05; box(w,h,.28,flat(bc[(r*3+k)%bc.length],.8),px+w/2,.17+r*.47+h/2,.04,g); px+=w+.04; if(px>.8)break; } }
  collideObj(g,0); return g; }
function rug(x,z,w,d,color){ const r=mesh(new THREE.PlaneGeometry(w,d),flat(color,1),x,.02,z,null,false); r.rotation.x=-Math.PI/2; }
function wallBoard(x,z,w,h,tex,rotY=0){ const p=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.7}),x,1.45,z,null,false); p.rotation.y=rotY; return p; }

// Lobby
const rec=new THREE.Group(); rec.position.set(8,0,8.5); scene.add(rec);
box(3.2,1.05,.8,M.oak,0,.525,0,rec); box(3.3,.06,.95,M.white,0,1.08,0,rec); box(.8,.5,.05,M.dark,.6,1.36,-.15,rec); box(.72,.42,.01,M.screen,.6,1.36,-.12,rec,false);
collideObj(rec,0);
plant(-12,11,1.3); plant(12,11,1.2); plant(-12,4,1); plant(4.2,4,0.8); plant(-4.2,4,0.8);
const sofaL=new THREE.Group(); sofaL.position.set(-8.5,0,8.5); scene.add(sofaL);
box(3,.45,1,M.sofa,0,.3,0,sofaL); box(3,.6,.25,M.sofa,0,.75,-.4,sofaL); box(.25,.55,1,M.sofa,-1.4,.5,0,sofaL); box(.25,.55,1,M.sofa,1.4,.5,0,sofaL);
collideObj(sofaL,0);
rug(-8.5,9.8,3.6,1.8,0x2e3b52);

// About: desk + bookshelf
{ const c=byId('about'); desk(c.cx-.5,c.z0+2.2,0,1); shelf(c.x0+.35,c.cz,Math.PI/2); plant(c.x0+1,c.z1-1); rug(c.cx,c.cz+.6,4,3,0x3a3150); }
// Projects: whiteboard + 2-screen desk
{ const c=byId('projects');
  const wb=canvasTex(512,256,(g,w,h)=>{ g.fillStyle='#f6f7f4'; g.fillRect(0,0,w,h); g.lineWidth=4; g.font='600 22px "IBM Plex Mono", monospace';
    const node=(x,y,t,col)=>{ g.strokeStyle=col; rr(g,x,y,110,46,8); g.stroke(); g.fillStyle=col; g.fillText(t,x+12,y+30); };
    node(20,40,'sensors','#1f6feb'); node(200,40,'redis','#d9534f'); node(380,40,'models','#2a9d5c');
    node(200,160,'grafana','#b26b00');
    g.strokeStyle='#333'; g.beginPath(); g.moveTo(130,63); g.lineTo(198,63); g.moveTo(310,63); g.lineTo(378,63); g.moveTo(255,86); g.lineTo(255,158); g.stroke();
    g.fillStyle='#555'; g.font='500 18px "IBM Plex Mono", monospace'; g.fillText('min xᵀQx  s.t. x ∈ {0,1}ⁿ',40,236); });
  box(3.4,1.9,.06,M.frame,c.cx,1.45,c.z0+.12,null,false); wallBoard(c.cx,c.z0+.16,3.2,1.7,wb);
  desk(c.cx,c.z0+2.8,0,2); plant(c.x1-1,c.z1-1); rug(c.cx,c.cz+.8,4,3,0x2c3f4f); }
// Experience: desk, cabinets, framed certificates
{ const c=byId('experience'); desk(c.cx,c.z0+2.2,0,1);
  for(let i=0;i<3;i++){ const f=box(.6,1.3,.6,M.metal,c.x0+.45,.65,c.cz-1+i*.7); collideObj(f,0); }
  [-1.6,0,1.6].forEach((dx,i)=>{ box(1,.7,.04,M.oak,c.cx+dx,1.7,c.z0+.12,null,false); box(.84,.54,.01,i===1?M.amber:M.white,c.cx+dx,1.7,c.z0+.15,null,false); });
  plant(c.x0+1,c.z1-1); rug(c.cx,c.cz+.6,4,3,0x3a3150); }
// Life: volleyball, easel with painting, gaming rig
{ const c=byId('life');
  mesh(new THREE.SphereGeometry(.25,24,16),new THREE.MeshStandardMaterial({map:canvasTex(256,128,(g,w,h)=>{ g.fillStyle='#f4f1e8'; g.fillRect(0,0,w,h); g.fillStyle='#1f6feb'; g.fillRect(0,40,w,18); g.fillStyle='#f2c230'; g.fillRect(0,78,w,18); }),roughness:.6}),c.cx-2.5,.25,c.cz+2);
  const easel=new THREE.Group(); easel.position.set(c.x1-1.8,0,c.cz+.5); easel.rotation.y=-.5; scene.add(easel);
  box(.06,1.9,.06,M.oak,-.45,.95,0,easel); box(.06,1.9,.06,M.oak,.45,.95,0,easel); box(.06,1.9,.06,M.oak,0,.9,-.4,easel); box(1.1,.05,.12,M.oak,0,.75,.05,easel);
  const art=canvasTex(256,320,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#2b3a67'); gr.addColorStop(.55,'#e07a5f'); gr.addColorStop(1,'#f2cc8f'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='#f4f1de'; g.beginPath(); g.arc(170,150,38,0,7); g.fill(); g.fillStyle='#3d405b'; g.beginPath(); g.moveTo(0,250); g.lineTo(90,190); g.lineTo(170,240); g.lineTo(256,180); g.lineTo(256,320); g.lineTo(0,320); g.fill(); });
  box(.9,1.12,.04,M.white,0,1.35,.09,easel); mesh(new THREE.PlaneGeometry(.84,1.06),new THREE.MeshStandardMaterial({map:art}),0,1.35,.115,easel,false);
  collideObj(easel,0);
  const gtex=canvasTex(256,144,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#2a1b5c'); gr.addColorStop(1,'#0e5a6b'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='#7fd18b'; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=16) g.lineTo(x,100-Math.sin(x/30)*18-(x%32?6:0)); g.lineTo(w,h); g.fill(); g.fillStyle='#f2a541'; g.fillRect(118,78,10,16); });
  const tv=new THREE.Group(); tv.position.set(c.cx-.5,0,c.z0+.6); scene.add(tv);
  box(2.6,.5,.6,M.dark,0,.25,0,tv); box(2.4,1.3,.08,M.dark,0,1.35,-.15,tv); mesh(new THREE.PlaneGeometry(2.3,1.2),new THREE.MeshBasicMaterial({map:gtex}),0,1.35,-.105,tv,false);
  collideObj(tv,0);
  const gc=new THREE.Group(); gc.position.set(c.cx-.5,0,c.z0+2.6); scene.add(gc);
  box(.7,.12,.7,M.amber,0,.5,0,gc); box(.7,.95,.12,M.amber,0,1.05,.33,gc); box(.08,.45,.08,M.metal,0,.25,0,gc); collideObj(gc,-.1);
  plant(c.x0+1,c.z1-1); rug(c.cx-.5,c.z0+2.5,3.2,2.4,0x26334a); }
// Contact lounge: sofa, coffee table, coffee bar, "Let's talk" sign
{ const s=new THREE.Group(); s.position.set(-5,0,-32.6); scene.add(s);
  box(4,.45,1.1,M.sofa,0,.3,0,s); box(4,.7,.28,M.sofa,0,.8,-.42,s); box(.28,.6,1.1,M.sofa,-1.86,.5,0,s); box(.28,.6,1.1,M.sofa,1.86,.5,0,s); collideObj(s,0);
  const t=new THREE.Group(); t.position.set(-5,0,-30.6); scene.add(t);
  box(2,.06,.9,M.oak,0,.45,0,t); box(1.8,.42,.06,M.metal,0,.21,0,t);
  mesh(new THREE.CylinderGeometry(.07,.06,.14,16),M.amber,.4,.55,.1,t); mesh(new THREE.CylinderGeometry(.07,.06,.14,16),M.white,-.3,.55,-.1,t); collideObj(t,0);
  const bar=new THREE.Group(); bar.position.set(6,0,-32.8); scene.add(bar);
  box(4,1,.8,M.dark,0,.5,0,bar); box(4.1,.06,.9,M.oak,0,1.03,0,bar); box(.5,.6,.45,M.metal,-1.2,1.36,-.1,bar);
  mesh(new THREE.CylinderGeometry(.07,.06,.14,16),M.white,.2,1.13,.1,bar); collideObj(bar,0);
  const sign=canvasTex(1024,256,(g,w,h)=>{ g.fillStyle='#141c2a'; g.fillRect(0,0,w,h); g.fillStyle='#f2a541'; g.font='800 110px "Bricolage Grotesque", sans-serif'; g.textAlign='center'; g.fillText("Let's talk.",w/2,150); g.fillStyle='#97a3b6'; g.font='500 34px "IBM Plex Mono", monospace'; g.fillText(LINKS.email,w/2,215); });
  wallBoard(0,-33.85,5,1.25,sign); plant(-12,-27,1.2); plant(12,-27,1.2); plant(1.5,-33,1); rug(-5,-31.2,5,3,0x3a3150); }
// dead-zone planters behind glass
plant(8,-22.5,1.4); plant(-8,-22.5,1.4); plant(10.5,-24.5,1); plant(-10.5,-21,1);

/* door signs */
CABINS.forEach(c=>{
  const t=canvasTex(512,150,(g,w,h)=>{ g.fillStyle='rgba(13,19,30,0.9)'; rr(g,4,4,w-8,h-8,26); g.fill(); g.lineWidth=4; g.strokeStyle='#f2a541'; g.stroke();
    g.textBaseline='middle'; g.fillStyle='#f2a541'; g.font='600 38px "IBM Plex Mono", monospace'; g.fillText(c.n,36,h/2+2);
    g.fillStyle='#e9edf3'; g.font='700 60px "Bricolage Grotesque", sans-serif'; g.fillText(c.name,112,h/2+4); });
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  sp.scale.set(3.4,1,1); sp.position.set(c.door.x+c.door.nx*0.3,3.5,c.door.z+c.door.nz*0.3); sp.renderOrder=10; scene.add(sp); c.sign=sp;
});

// Everything built so far is static: compute its matrices once instead of every frame.
scene.children.forEach(o=>{ if(o===sun||o===sun.target) return; o.traverse(n=>{ n.updateMatrix(); n.matrixAutoUpdate=false; }); });

/* character */
const me=new THREE.Group(); scene.add(me);
const skin=new THREE.MeshStandardMaterial({color:0xc08a66,roughness:.7});
const jacket=new THREE.MeshStandardMaterial({color:0x2c6e72,roughness:.7});
const pants=new THREE.MeshStandardMaterial({color:0x252a35,roughness:.8});
const hair=new THREE.MeshStandardMaterial({color:0x1a1310,roughness:.9});
const shoe=new THREE.MeshStandardMaterial({color:0xece8df,roughness:.6});
const body=new THREE.Group(); me.add(body);
function limb(px,py,w,h,d,mat,footMat){ const pv=new THREE.Group(); pv.position.set(px,py,0); body.add(pv);
  box(w,h,d,mat,0,-h/2,0,pv); if(footMat) box(w+.04,.1,d+.12,footMat,0,-h-.0,.05,pv); return pv; }
const legL=limb(-.13,.88,.2,.8,.22,pants,shoe), legR=limb(.13,.88,.2,.8,.22,pants,shoe);
box(.56,.7,.32,jacket,0,1.22,0,body); box(.2,.42,.33,new THREE.MeshStandardMaterial({color:0xe9edf3,roughness:.8}),0,1.33,.005,body);
box(.6,.1,.06,M.amber,0,1.0,.17,body,false);
const armL=limb(-.37,1.52,.15,.66,.17,jacket), armR=limb(.37,1.52,.15,.66,.17,jacket);
[armL,armR].forEach(a=>mesh(new THREE.SphereGeometry(.08,10,8),skin,0,-.7,0,a));
mesh(new THREE.CylinderGeometry(.08,.09,.12,10),skin,0,1.62,0,body);
mesh(new THREE.SphereGeometry(.21,24,18),skin,0,1.84,0,body);
mesh(new THREE.SphereGeometry(.225,24,18,0,Math.PI*2,0,Math.PI*.55),hair,0,1.86,-.02,body);
box(.36,.4,.12,hair,0,1.74,-.16,body);
[-.075,.075].forEach(x=>mesh(new THREE.SphereGeometry(.025,8,6),M.dark,x,1.86,.19,body,false));
const shadowDisc=mesh(new THREE.CircleGeometry(.45,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.25,depthWrite:false}),0,.015,0,me,false);
shadowDisc.rotation.x=-Math.PI/2;
me.position.set(LOBBY.x,0,LOBBY.z+0.5); me.rotation.y=Math.PI;

/* target ring */
const ring=mesh(new THREE.RingGeometry(.32,.42,32),new THREE.MeshBasicMaterial({color:0xf2a541,transparent:true,opacity:0,depthWrite:false}),0,.03,0,null,false);
ring.rotation.x=-Math.PI/2;

/* movement */
const R=.34, SPEED=4.6;
const blocked=(x,z)=>colliders.some(b=>x+R>b.x0&&x-R<b.x1&&z+R>b.z0&&z-R<b.z1);
function step(dx,dz){ let ok=false; const p=me.position;
  if(dx&&!blocked(p.x+dx,p.z)){p.x+=dx;ok=true;} if(dz&&!blocked(p.x,p.z+dz)){p.z+=dz;ok=true;} return ok; }
const inside=(c,x,z,inset=0)=>x>c.x0+inset&&x<c.x1-inset&&z>c.z0+inset&&z<c.z1-inset;
const cabinAt=(x,z,inset=0)=>CABINS.find(c=>inside(c,x,z,inset))||null;
const walkable=(x,z)=>!!cabinAt(x,z,.3)||(x>-2.7&&x<2.7&&z>-25.7&&z<3.3)||(z>3.3&&z<11.7&&x>-12.7&&x<12.7);

let path=[], stuck=0;
function routeTo(tx,tz){
  const p=me.position, from=cabinAt(p.x,p.z), to=cabinAt(tx,tz,.2), wps=[];
  if(from && from!==to){ wps.push(from.in, from.out); }
  if(to && to!==from){ wps.push(to.out, to.in); }
  wps.push({x:tx,z:tz}); path=wps.map(w=>({x:w.x,z:w.z})); stuck=0;
  ring.position.set(tx,.03,tz); ring.material.opacity=.9; ring.scale.setScalar(1);
}
function goTo(id){
  if(id==='lobby'){ routeTo(LOBBY.x,LOBBY.z); setCurrent('lobby'); closePanel(false); return; }
  const c=byId(id); if(!c) return;
  routeTo(c.stand.x,c.stand.z); setCurrent(id);
  if(cabinAt(me.position.x,me.position.z,.4)===c) openPanel(id);
}
dock.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b){ goTo(b.dataset.go); dismissHint(); } });
addEventListener('hashchange',()=>{ const id=location.hash.slice(1); if(isPlace(id)) goTo(id); });

const keys=new Set();
const KEYMAP={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
addEventListener('keydown',e=>{
  if(e.key==='Escape'){ closePanel(true); return; }
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  if(KEYMAP[e.code]){ keys.add(e.code); path=[]; e.preventDefault(); dismissHint(); }
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());

/* pointer: tap/click to walk, pinch or wheel to zoom */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), plane=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
const cv=renderer.domElement;
let zoom=1;
const setZoom=z=>{ zoom=Math.min(1.6,Math.max(.55,z)); };
const pointers=new Map();
let down=null, pinch=null;
const spread=()=>{ const [a,b]=[...pointers.values()]; return Math.hypot(a.x-b.x,a.y-b.y)||1; };
cv.addEventListener('pointerdown',e=>{
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){ pinch={d:spread(), z:zoom}; down=null; dismissHint(); }
  else if(pointers.size===1){ down={x:e.clientX,y:e.clientY,t:performance.now()}; }
});
cv.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch && pointers.size===2) setZoom(pinch.z*pinch.d/spread());
});
cv.addEventListener('pointercancel',e=>{ pointers.delete(e.pointerId); down=null; if(!pointers.size) pinch=null; });
cv.addEventListener('pointerup',e=>{
  pointers.delete(e.pointerId);
  if(pointers.size) return;
  const d=down, pinched=!!pinch; down=null; pinch=null;
  if(!d || pinched) return;
  const moved=Math.hypot(e.clientX-d.x,e.clientY-d.y), dt=performance.now()-d.t;
  if(moved>10||dt>600) return;
  const r=cv.getBoundingClientRect(); ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);
  // clicking a door sign walks to that cabin
  const sh=ray.intersectObjects(CABINS.map(c=>c.sign));
  if(sh.length){ goTo(CABINS.find(c=>c.sign===sh[0].object).id); dismissHint(); return; }
  if(!ray.ray.intersectPlane(plane,hit)) return;
  if(!walkable(hit.x,hit.z)||blocked(hit.x,hit.z)) return;
  routeTo(hit.x,hit.z); dismissHint();
});
cv.addEventListener('wheel',e=>{
  e.preventDefault();
  const dy=e.deltaY*(e.deltaMode===1?33:1);   // Firefox reports lines
  setZoom(zoom*Math.exp(Math.max(-60,Math.min(60,dy))*.0015));
},{passive:false});

let hintGone=false;
function dismissHint(){ if(hintGone) return; hintGone=true; hint.classList.add('gone'); }

/* resize, pixel ratio, shadows */
let vw=1,vh=1, dprCap=2, shadowsOn=null, shadowDirty=true;
function applyShadows(){
  const on=vw>720;   // shadows off on small screens
  if(on===shadowsOn) return;
  shadowsOn=on; renderer.shadowMap.enabled=on; sun.castShadow=on; shadowDirty=true;
  scene.traverse(o=>{ if(o.material) o.material.needsUpdate=true; });
}
function resize(){
  vw=innerWidth; vh=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio,dprCap));
  renderer.setSize(vw,vh,false); camera.aspect=vw/vh; camera.updateProjectionMatrix();
  applyShadows(); measurePanel();
}
addEventListener('resize',resize); resize();

/* loop */
const clock=new THREE.Clock();
let phase=0, moving=0, lastCabin=null, yaw=Math.PI, offX=0, offY=0, slow=0, first=true;
const camPos=new THREE.Vector3();
function frame(){
  const raw=clock.getDelta(), dt=Math.min(raw,.05), p=me.position;

  // If frames stay slow for a while, render at a lower resolution (never goes back up).
  if(raw<.25){ slow = raw>1/45 ? slow+raw : Math.max(0,slow-raw*.5); }
  if(slow>1.5 && dprCap>1 && Math.min(devicePixelRatio,dprCap)>1){ dprCap=Math.max(1,Math.min(devicePixelRatio,dprCap)-.5); slow=0; resize(); }

  let mx=0,mz=0;
  keys.forEach(k=>{ mx+=KEYMAP[k][0]; mz+=KEYMAP[k][1]; });
  if(!mx&&!mz&&path.length){
    const w=path[0], dx=w.x-p.x, dz=w.z-p.z, d=Math.hypot(dx,dz);
    if(d<.12){ path.shift(); }
    else { mx=dx/d; mz=dz/d; if(d<SPEED*dt){ mx*=d/(SPEED*dt); mz*=d/(SPEED*dt); } }
  }
  const len=Math.hypot(mx,mz);
  let walking=false;
  if(len>0.001){
    const n=Math.min(1,len); const ux=mx/len*n, uz=mz/len*n;
    const ok=step(ux*SPEED*dt, uz*SPEED*dt);
    if(ok){ walking=true; stuck=0; } else if(path.length){ stuck+=dt; if(stuck>.4){ path=[]; } }
    const target=Math.atan2(ux,uz); let diff=target-yaw; diff=Math.atan2(Math.sin(diff),Math.cos(diff)); yaw+=diff*Math.min(1,dt*12);
  }
  me.rotation.y=yaw;
  moving+=((walking?1:0)-moving)*Math.min(1,dt*10);
  if(walking) phase+=dt*SPEED*2.3;
  const sw=Math.sin(phase)*.65*moving;
  legL.rotation.x=sw; legR.rotation.x=-sw; armL.rotation.x=-sw*.8; armR.rotation.x=sw*.8;
  body.position.y=Math.abs(Math.sin(phase))*.06*moving + (1-moving)*Math.sin(clock.elapsedTime*2)*.008;

  if(ring.material.opacity>0){ ring.material.opacity=Math.max(0,ring.material.opacity-dt*.9); ring.scale.setScalar(1+(.9-ring.material.opacity)*.6); }

  // cabins: open on entry, close on exit
  const c=cabinAt(p.x,p.z,.4);
  if(c!==lastCabin){ lastCabin=c; if(c){ openPanel(c.id); dismissHint(); } else { closePanel(false); if(!path.length) setCurrent(null); } }

  // camera follow; pull back on portrait screens so the narrow view still shows the room
  const dist=zoom*Math.min(1.6,Math.max(1,.75/camera.aspect));
  camPos.set(p.x, 12.5*dist, p.z+11.5*dist);
  if(first||reduce){ camera.position.copy(camPos); first=false; } else camera.position.lerp(camPos, Math.min(1,dt*4));
  camera.lookAt(camera.position.x, .8, camera.position.z-11.5*dist-1.2);

  // shift the view so the character isn't hidden behind the panel
  const open=panel.classList.contains('open'), narrow=vw<=720;
  const tx= open&&!narrow ? Math.min(240,(Math.min(460,vw-32)+16)/2) : 0;
  const ty= open&&narrow ? Math.min(vh*.29, panelH/2) : 0;
  if(reduce){ offX=tx; offY=ty; } else { offX+=(tx-offX)*Math.min(1,dt*6); offY+=(ty-offY)*Math.min(1,dt*6); }
  if(Math.abs(offX)>.5||Math.abs(offY)>.5) camera.setViewOffset(vw,vh,offX,offY,vw,vh); else camera.clearViewOffset();

  sun.position.set(p.x+8,20,p.z+10); sun.target.position.set(p.x,0,p.z);
  if(shadowsOn && (shadowDirty || moving>.01)){ renderer.shadowMap.needsUpdate=true; shadowDirty=false; }
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
frame();

// First frame is on screen: drop the loader, then follow a deep link like /#projects.
loader.classList.add('done');
setTimeout(()=>loader.remove(), reduce ? 0 : 600);
if(isPlace(initialHash) && initialHash!=='lobby') setTimeout(()=>goTo(initialHash), reduce ? 0 : 400);
}
})();
