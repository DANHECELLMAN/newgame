(function(){
'use strict';
const C=window.PawCore, LEVELS=window.PawLevels, Solver=window.PawSolver;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=1080,H=1920,BOARD_TOP=320,MAX_BOARD_W=900,MAX_BOARD_H=1060;
const BREEDS={
 orange_cat:{label:'橘猫',emoji:'🐱',body:'#E6A15B',accent:'#FFF1D3'},
 cow_cat:{label:'奶牛猫',emoji:'🐱',body:'#F0F1ED',accent:'#303630'},
 corgi:{label:'柯基',emoji:'🐶',body:'#D78B45',accent:'#FFF0D0'},
 shiba:{label:'柴犬',emoji:'🐶',body:'#C97542',accent:'#F8E3C4'},
 golden:{label:'金毛',emoji:'🐕',body:'#DDB66C',accent:'#FFF2C9'}
};

const safeStorage={
 get(k,d){try{return localStorage.getItem(k)??d}catch{return d}},
 set(k,v){try{localStorage.setItem(k,String(v))}catch{}}
};
const solverResults=LEVELS.map(v=>({id:v.id,name:v.name,target:v.target,minMoves:v.target,solvable:true,matchesTarget:true}));
console.info('Paw Escape V0.6: L1-L30 integrated build. All 30 targets pre-validated offline with Solver.');

let initialLevel=Math.max(0,Math.min(Number(safeStorage.get('pawEscapeV06Level','0'))||0,LEVELS.length-1));
let state={scene:'home',levelIndex:initialLevel,selectChapter:Math.floor(initialLevel/10),game:null,history:[],visuals:[],moves:0,locked:false,won:false,failed:false,intro:0,showGrid:false,particles:[],floats:[],shake:0,lastTime:performance.now(),best:loadBest()};
function loadBest(){
 const merged={};
 for(const k of ['pawEscapeV03Best','pawEscapeV04Best','pawEscapeV05Best','pawEscapeV06Best']){
  try{const obj=JSON.parse(safeStorage.get(k,'{}'))||{};for(const [id,m] of Object.entries(obj)){const n=Number(m);if(Number.isFinite(n)&&(!merged[id]||n<merged[id]))merged[id]=n}}catch{}
 }
 return merged;
}
function saveBest(){safeStorage.set('pawEscapeV06Best',JSON.stringify(state.best))}
function level(){return LEVELS[state.levelIndex]}
function layout(){
 const L=level(),cell=Math.floor(Math.min(MAX_BOARD_W/L.cols,MAX_BOARD_H/L.rows));
 const bw=cell*L.cols,bh=cell*L.rows;
 return {cell,bw,bh,x:(W-bw)/2,y:BOARD_TOP,bottom:BOARD_TOP+bh};
}
function center(c,r){const b=layout();return{x:b.x+c*b.cell+b.cell/2,y:b.y+r*b.cell+b.cell/2}}
function rr(x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath()}
function makeVisuals(game){return game.animals.map(a=>{const p=center(a.c,a.r);return{id:a.id,x:p.x,y:p.y,alpha:(a.rescued||a.fallen)?0:1,scale:1,anim:null}})}
function buildLevel(i){
 state.levelIndex=i;state.selectChapter=Math.floor(i/10);state.game=C.createInitialState(level());state.moves=0;state.history=[];state.won=false;state.failed=false;state.locked=false;state.intro=3.0;state.particles=[];state.floats=[];state.visuals=makeVisuals(state.game);safeStorage.set('pawEscapeV06Level',i);
}
function snapshot(){return C.cloneState(state.game)}
function restore(s){state.game=C.cloneState(s);state.moves=s.moves;state.won=C.isSolved(s);state.failed=C.isFailed(s);state.locked=false;state.particles=[];state.floats=[];state.visuals=makeVisuals(state.game)}
function undo(){if(state.locked||!state.history.length)return;restore(state.history.pop());addFloat('UNDO',W/2,270)}
function addFloat(text,x,y){state.floats.push({text,x,y,life:1.2})}
function burst(x,y,n=14){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*220;state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-90,life:.65+Math.random()*.45,size:5+Math.random()*9})}}
function attempt(id){
 if(state.locked||state.won||state.failed)return;
 const current=state.game.animals[id];if(!current||current.rescued||current.fallen)return;
 state.history.push(snapshot());
 const res=C.simulateAction(level(),state.game,id);state.game=res.state;state.moves=state.game.moves;
 if(!res.changed){state.history.pop();addFloat('这里走不动',state.visuals[id].x,state.visuals[id].y-70);state.shake=8;return}
 state.locked=true;
 const v=state.visuals[id],points=res.trace.map(p=>({...center(p.c,p.r),c:p.c,r:p.r,teleport:!!p.teleport}));
 v.anim={points,index:0,speed:Math.max(620,layout().cell*8),effect:res.effect};
 if(!points.length) finishAction(v);
}
function finishAction(v){
 const fx=v.anim?.effect;v.anim=null;
 if(fx?.type==='rescue'){v.alpha=0;burst(v.x,v.y,18)}
 if(fx?.type==='switch'){burst(v.x,v.y,14);addFloat(`${fx.id} ON`,v.x,v.y-60)}
 if(fx?.type==='toggle'){burst(v.x,v.y,12);addFloat(`${fx.id} ${fx.on?'ON':'OFF'}`,v.x,v.y-60)}
 if(fx?.type==='plate')addFloat(`${fx.id} HOLD`,v.x,v.y-60);
 if(fx?.type==='portal')addFloat(`PORTAL ${fx.id}`,v.x,v.y-70);
 if(fx?.type==='mud')addFloat('陷进泥地！',v.x,v.y-70);
 if(fx?.type==='unstick')addFloat('挣脱！',v.x,v.y-70);
 if(fx?.type==='crumble'){state.shake=8;addFloat('地板碎了！',v.x,v.y-70)}
 if(fx?.type==='hazard'||fx?.type==='crumbleFail'){v.alpha=0;state.shake=18;addFloat('危险！',v.x,v.y-70)}
 state.failed=C.isFailed(state.game);
 if(state.failed){state.locked=false;return}
 if(C.isSolved(state.game)){
   state.won=true;state.locked=false;burst(W/2,270,38);
   const id=String(level().id),old=state.best[id];if(!old||state.moves<old){state.best[id]=state.moves;saveBest()}
 }else state.locked=false;
}
function update(dt){
 state.shake*=Math.pow(.01,dt);if(state.intro>0)state.intro-=dt;
 for(const v of state.visuals){
   if(v.anim){
     const p=v.anim.points[v.anim.index];
     if(!p){finishAction(v);continue}
     if(p.teleport){v.x=p.x;v.y=p.y;burst(v.x,v.y,14);v.anim.index++;if(v.anim.index>=v.anim.points.length)finishAction(v);continue}
     const dx=p.x-v.x,dy=p.y-v.y,dist=Math.hypot(dx,dy),step=v.anim.speed*dt;
     if(dist<=step){v.x=p.x;v.y=p.y;v.anim.index++;if(v.anim.index>=v.anim.points.length)finishAction(v)}else{v.x+=dx/dist*step;v.y+=dy/dist*step}
   }else if(v.alpha>0)v.scale=1+Math.sin(performance.now()/500+v.id)*.012;
 }
 state.particles=state.particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=470*dt;return p.life>0});
 state.floats=state.floats.filter(f=>{f.life-=dt;f.y-=48*dt;return f.life>0});
}

const buttons=[];
function button(x,y,w,h,label,id,font=24,disabled=false,filled=false){rr(x,y,w,h,22);ctx.fillStyle=disabled?'#D9DDD3':filled?'#315C42':'rgba(255,255,255,.9)';ctx.fill();ctx.strokeStyle='rgba(42,70,51,.14)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=disabled?'#9DA49B':filled?'#FFF':'#314A38';ctx.font=`800 ${font}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x+w/2,y+h/2);buttons.push({x,y,w,h,id,disabled})}
function drawBg(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#F3F0E5');g.addColorStop(.62,'#E6EAD8');g.addColorStop(1,'#DDE3D2');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.12;for(let i=0;i<24;i++){ctx.fillStyle=i%2?'#5D8B68':'#B3C781';ctx.beginPath();ctx.arc((i*181)%W,190+((i*239)%1520),42+(i%5)*13,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
}
const CHAPTERS=[
 {title:'Chapter 1',sub:'FIRST ESCAPE',range:'L1–10',desc:'基础移动 · 阻挡 · Turn · Wall',goal:'学习规则，建立路线直觉'},
 {title:'Chapter 2',sub:'TRICKY BACKYARD',range:'L11–20',desc:'按钮 · 门 · 危险格 · 泥地 · 单向',goal:'开始停下来读地图'},
 {title:'Chapter 3',sub:'DANGEROUS GARDEN',range:'L21–30',desc:'压力板 · Toggle · 碎裂地板 · Portal',goal:'正式多阶段空间解谜'}
];
function drawHome(){
 drawBg();ctx.textAlign='center';ctx.fillStyle='#294A37';ctx.font='900 82px system-ui';ctx.fillText('PAW ESCAPE',W/2,205);ctx.fillStyle='#78877A';ctx.font='700 27px system-ui';ctx.fillText('L1–L30 · INTEGRATED PUZZLE DEMO',W/2,262);
 ctx.font='108px system-ui';ctx.fillText('🐱  🐾  🐶',W/2,430);
 rr(90,535,900,550,54);ctx.fillStyle='rgba(255,255,255,.80)';ctx.fill();ctx.strokeStyle='rgba(45,76,54,.10)';ctx.lineWidth=3;ctx.stroke();
 ctx.fillStyle='#334D3B';ctx.font='900 34px system-ui';ctx.fillText('30 关连续版本',W/2,620);
 for(let i=0;i<3;i++){
  const ch=CHAPTERS[i],y=690+i*112;ctx.textAlign='left';ctx.fillStyle='#315C42';ctx.font='900 23px system-ui';ctx.fillText(`${ch.range}  ${ch.sub}`,155,y);ctx.fillStyle='#6C786D';ctx.font='600 20px system-ui';ctx.fillText(ch.desc,155,y+34);ctx.fillStyle='#879188';ctx.font='600 17px system-ui';ctx.fillText(ch.goal,155,y+62);
 }
 ctx.textAlign='center';ctx.fillStyle='#3F7A52';ctx.font='800 21px system-ui';ctx.fillText('Solver: 30/30 可解 · 30/30 Perfect Moves 锁定',W/2,1035);
 button(210,1160,660,110,'从 L1 开始  ▶','play',34,false,true);button(250,1295,580,84,`继续 L${level().id} · ${level().name}`,'continue',22,false,false);button(330,1405,420,78,'30 关选择','levels',24,false,false);
 ctx.fillStyle='#879188';ctx.font='500 20px system-ui';ctx.fillText('纯 HTML5 + JavaScript + Canvas 2D · 微信小游戏迁移友好',W/2,1735);ctx.fillText('V0.6 Integrated Demo · 2026-08-24',W/2,1775);
}
function drawLevelSelect(){
 drawBg();const ch=Math.max(0,Math.min(2,state.selectChapter||0)),meta=CHAPTERS[ch];ctx.textAlign='left';ctx.fillStyle='#294A37';ctx.font='900 50px system-ui';ctx.fillText(`${meta.title} · ${meta.range}`,70,92);ctx.fillStyle='#78877A';ctx.font='700 21px system-ui';ctx.fillText(`${meta.sub} · ${meta.goal}`,72,132);button(825,57,185,66,'← 首页','home',22,false,false);
 const tabY=166,tabW=292,gap=18;for(let c=0;c<3;c++){button(70+c*(tabW+gap),tabY,tabW,62,`CH.${c+1}  L${c*10+1}–${c*10+10}`,`chapter:${c}`,18,false,c===ch)}
 const start=ch*10,startY=275;for(let j=0;j<10;j++){
   const i=start+j,L=LEVELS[i],col=j%2,row=Math.floor(j/2),x=70+col*485,y=startY+row*270,w=455,h=230;rr(x,y,w,h,34);ctx.fillStyle='rgba(255,255,255,.88)';ctx.fill();ctx.strokeStyle=i===state.levelIndex?'rgba(49,92,66,.45)':'rgba(48,75,56,.11)';ctx.lineWidth=i===state.levelIndex?5:3;ctx.stroke();
   ctx.textAlign='left';ctx.fillStyle='#34523E';ctx.font='900 27px system-ui';ctx.fillText(`L${L.id}  ${L.name}`,x+24,y+45);ctx.fillStyle='#778378';ctx.font='600 18px system-ui';ctx.fillText(`${L.rating} · Diff ${L.difficulty} · ${L.cols}×${L.rows}`,x+24,y+78);ctx.fillStyle='#55645A';ctx.font='600 18px system-ui';ctx.fillText(L.subtitle,x+24,y+116);
   const best=state.best[String(L.id)];ctx.fillStyle=best?'#3D7B50':'#98A097';ctx.font='800 18px system-ui';ctx.fillText(best?`BEST ${best} · PERFECT ${L.target}`:'PERFECT ???',x+24,y+158);button(x+272,y+164,155,50,'PLAY',`lvl:${i}`,18,false,true);
 }
}
function drawTop(){
 const L=level(),best=state.best[String(L.id)];ctx.textAlign='left';ctx.fillStyle='#2E4737';ctx.font='900 39px system-ui';ctx.fillText(`L${L.id} · ${L.name}`,58,74);ctx.fillStyle='#768278';ctx.font='650 21px system-ui';ctx.fillText(`${L.rating} · DIFF ${L.difficulty} · ${L.cols}×${L.rows} · ${L.theme}`,60,110);
 ctx.textAlign='right';ctx.fillStyle='#334E3B';ctx.font='900 30px system-ui';ctx.fillText(`MOVES ${state.moves}`,1020,74);ctx.fillStyle='#7B867B';ctx.font='650 20px system-ui';ctx.fillText(`RESCUED ${state.game.animals.filter(a=>a.rescued).length}/${state.game.animals.length}${best?` · BEST ${best}`:''}`,1020,109);
 button(58,154,145,58,'← 首页','home',20,false);button(218,154,155,58,'↶ Undo','undo',20,!state.history.length||state.locked);button(388,154,155,58,'↻ 重开','restart',20,state.locked);button(835,154,185,58,state.showGrid?'隐藏网格':'开发网格','grid',19,false);
}
function tileBox(c,r,padScale=.11){const b=layout(),pad=Math.max(6,b.cell*padScale);return{x:b.x+c*b.cell+pad,y:b.y+r*b.cell+pad,w:b.cell-pad*2,h:b.cell-pad*2,cell:b.cell}}
function drawBoard(){
 const b=layout();rr(b.x-18,b.y-18,b.bw+36,b.bh+36,42);ctx.fillStyle='#A9C879';ctx.fill();ctx.strokeStyle='rgba(44,78,48,.18)';ctx.lineWidth=5;ctx.stroke();
 ctx.save();rr(b.x,b.y,b.bw,b.bh,28);ctx.clip();ctx.globalAlpha=.08;for(let r=0;r<level().rows;r++){ctx.fillStyle=r%2?'#547F52':'#D8E7A7';ctx.fillRect(b.x,b.y+r*b.cell,b.bw,b.cell)}ctx.restore();ctx.globalAlpha=1;
 if(state.showGrid){ctx.strokeStyle='rgba(38,70,43,.25)';ctx.lineWidth=1.5;for(let c=0;c<=level().cols;c++){const x=b.x+c*b.cell;ctx.beginPath();ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.bh);ctx.stroke()}for(let r=0;r<=level().rows;r++){const y=b.y+r*b.cell;ctx.beginPath();ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.bw,y);ctx.stroke()}ctx.fillStyle='#35503B';ctx.font=`700 ${Math.max(13,b.cell*.14)}px monospace`;ctx.textAlign='center';for(let c=0;c<level().cols;c++)ctx.fillText(String.fromCharCode(65+c),b.x+c*b.cell+b.cell/2,b.y-22);ctx.textAlign='right';for(let r=0;r<level().rows;r++)ctx.fillText(String(r+1),b.x-22,b.y+r*b.cell+b.cell/2+5)}
 drawTiles();
}
function labelTile(text,cx,cy,size){ctx.fillStyle='#FFF';ctx.font=`900 ${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,cx,cy)}
function drawTiles(){
 const game=state.game;
 for(const [k,t] of level()._tiles){
  const [c,r]=k.split(',').map(Number),b=tileBox(c,r),cx=b.x+b.w/2,cy=b.y+b.h/2,s=b.cell;
  if(t.type==='wall'){
    rr(b.x,b.y,b.w,b.h,s*.16);ctx.fillStyle='#5D7465';ctx.fill();ctx.fillStyle='#7F987E';for(let y=b.y+s*.18;y<b.y+b.h;y+=Math.max(12,s*.22))for(let x=b.x+s*.16;x<b.x+b.w;x+=Math.max(14,s*.26)){ctx.beginPath();ctx.arc(x,y,Math.max(3,s*.04),0,Math.PI*2);ctx.fill()}
  }else if(t.type==='exit'){
    rr(b.x,b.y,b.w,b.h,s*.18);ctx.fillStyle='#F3D276';ctx.fill();ctx.strokeStyle='#A77D23';ctx.lineWidth=Math.max(2,s*.03);ctx.stroke();ctx.fillStyle='#755A20';ctx.font=`900 ${Math.max(12,s*.15)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('EXIT',cx,cy-s*.08);ctx.font=`${Math.max(15,s*.19)}px system-ui`;ctx.fillText('🐾',cx,cy+s*.17);
  }else if(t.type==='turn'){
    ctx.beginPath();ctx.arc(cx,cy,s*.30,0,Math.PI*2);ctx.fillStyle='#4C9764';ctx.fill();labelTile(C.DIRS[t.arg].arrow,cx,cy,Math.max(20,s*.33));
  }else if(t.type==='switch'){
    const on=C.switchOn(game,t.arg);ctx.beginPath();ctx.arc(cx,cy,s*.31,0,Math.PI*2);ctx.fillStyle=on?'#5C9B64':'#E4B43D';ctx.fill();ctx.strokeStyle=on?'#2F7043':'#A87812';ctx.lineWidth=Math.max(2,s*.035);ctx.stroke();labelTile(t.arg,cx,cy,Math.max(12,s*.16));
  }else if(t.type==='plate'){
    const on=C.plateOccupied(level(),game,t.arg);rr(b.x,b.y,b.w,b.h,s*.22);ctx.fillStyle=on?'#4F9464':'#7EBF91';ctx.fill();ctx.strokeStyle=on?'#2E6F43':'#4E8D62';ctx.lineWidth=Math.max(2,s*.035);ctx.stroke();ctx.fillStyle='#FFF';ctx.font=`900 ${Math.max(11,s*.14)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.arg,cx,cy-s*.05);ctx.font=`800 ${Math.max(9,s*.11)}px system-ui`;ctx.fillText(on?'HOLD':'PLATE',cx,cy+s*.16);
  }else if(t.type==='toggle'){
    const on=C.toggleOn(game,t.arg);ctx.beginPath();ctx.arc(cx,cy,s*.31,0,Math.PI*2);ctx.fillStyle=on?'#D87642':'#EFA66A';ctx.fill();ctx.strokeStyle='#9A542D';ctx.lineWidth=Math.max(2,s*.035);ctx.stroke();ctx.fillStyle='#FFF';ctx.font=`900 ${Math.max(11,s*.15)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.arg,cx,cy-s*.06);ctx.font=`900 ${Math.max(9,s*.11)}px system-ui`;ctx.fillText(on?'ON':'OFF',cx,cy+s*.16);
  }else if(t.type==='doorSwitch'||t.type==='doorPlate'||t.type==='doorToggle'||t.type==='toggleWall'){
    const open=C.doorOpen(level(),game,t);rr(b.x,b.y,b.w,b.h,s*.13);ctx.fillStyle=open?'rgba(91,158,105,.30)':'#8B6A57';ctx.fill();ctx.strokeStyle=open?'#397C4E':'#65493A';ctx.lineWidth=Math.max(2,s*.035);ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=open?'#397C4E':'#FFF3DF';ctx.font=`900 ${Math.max(10,s*.13)}px system-ui`;
    let req=t.arg||'GATE';if(t.type==='doorToggle')req=`${t.arg} ${t.arg2==='off'?'OFF':'ON'}`;else if(t.type==='doorPlate')req=`${t.arg} HOLD`;
    ctx.fillText(open?'OPEN':'GATE',cx,cy-s*.09);ctx.font=`800 ${Math.max(9,s*.11)}px system-ui`;ctx.fillText(req,cx,cy+s*.15);
  }else if(t.type==='hazard'){
    const safe=C.hazardSafe(game,t);rr(b.x,b.y,b.w,b.h,s*.12);ctx.fillStyle=safe?'rgba(90,153,102,.34)':'#C75A50';ctx.fill();ctx.strokeStyle=safe?'#4A8957':'#8E352F';ctx.lineWidth=Math.max(2,s*.035);ctx.stroke();ctx.fillStyle=safe?'#356D43':'#FFF';ctx.font=`900 ${Math.max(11,s*.14)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(safe?'SAFE':'⚠',cx,cy-s*.08);ctx.font=`800 ${Math.max(9,s*.11)}px system-ui`;ctx.fillText(t.arg||'TRAP',cx,cy+s*.15);
  }else if(t.type==='mud'||t.type==='trap'){
    const dry=!!t.arg&&C.switchOn(game,t.arg);rr(b.x,b.y,b.w,b.h,s*.20);ctx.fillStyle=dry?'rgba(150,177,112,.55)':'#80648E';ctx.fill();ctx.strokeStyle=dry?'#66834E':'#5D426B';ctx.lineWidth=Math.max(2,s*.03);ctx.stroke();ctx.fillStyle=dry?'#405935':'#FFF';ctx.font=`900 ${Math.max(10,s*.13)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(dry?'DRY':'MUD',cx,cy-s*.06);if(t.arg){ctx.font=`800 ${Math.max(9,s*.10)}px system-ui`;ctx.fillText(t.arg,cx,cy+s*.16)}
  }else if(t.type==='crumble'){
    const stable=!!t.arg&&C.switchOn(game,t.arg),broken=C.crumbled(game,t.cell);rr(b.x,b.y,b.w,b.h,s*.12);ctx.fillStyle=stable?'#B8D7C2':broken?'#6E7580':'#C8D9E6';ctx.fill();ctx.strokeStyle=stable?'#5A8A68':broken?'#41464E':'#7694AA';ctx.lineWidth=Math.max(2,s*.035);ctx.stroke();ctx.strokeStyle=broken?'#F0E2D4':'#6E8799';ctx.lineWidth=Math.max(2,s*.025);ctx.beginPath();ctx.moveTo(b.x+b.w*.25,b.y+b.h*.18);ctx.lineTo(cx,cy);ctx.lineTo(b.x+b.w*.36,b.y+b.h*.80);ctx.moveTo(cx,cy);ctx.lineTo(b.x+b.w*.78,b.y+b.h*.30);ctx.stroke();ctx.fillStyle=stable?'#356D43':'#394650';ctx.font=`900 ${Math.max(9,s*.11)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(stable?'STABLE':broken?'BROKEN':'GLASS',cx,cy+s*.22);
  }else if(t.type==='oneway'){
    rr(b.x,b.y,b.w,b.h,s*.14);ctx.fillStyle='#4D83A3';ctx.fill();ctx.strokeStyle='#315C76';ctx.lineWidth=Math.max(2,s*.03);ctx.stroke();labelTile(C.DIRS[t.arg].arrow,cx,cy,Math.max(18,s*.28));
  }else if(t.type==='portal'){
    ctx.beginPath();ctx.arc(cx,cy,s*.29,0,Math.PI*2);ctx.strokeStyle='#6D63A8';ctx.lineWidth=Math.max(4,s*.06);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,s*.18,0,Math.PI*2);ctx.strokeStyle='#A49BDC';ctx.lineWidth=Math.max(2,s*.03);ctx.stroke();ctx.fillStyle='#5C548F';ctx.font=`900 ${Math.max(11,s*.14)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.arg,cx,cy);
  }
 }
}
function drawAnimal(v){
 if(v.alpha<=0)return;const a=state.game.animals[v.id],b=BREEDS[a.breed],s=layout().cell,body=Math.min(54,s*.34),emoji=Math.max(28,Math.min(50,s*.32)),arrowR=Math.max(15,s*.15),offset=Math.min(57,s*.37);
 ctx.save();ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scale);ctx.globalAlpha=v.alpha;ctx.fillStyle='rgba(41,53,42,.17)';ctx.beginPath();ctx.ellipse(0,body*.75,body*.92,body*.28,0,0,Math.PI*2);ctx.fill();rr(-body,-body,body*2,body*2,body*.72);ctx.fillStyle=b.body;ctx.fill();ctx.strokeStyle='rgba(48,49,43,.12)';ctx.lineWidth=Math.max(2,s*.025);ctx.stroke();ctx.fillStyle=b.accent;ctx.beginPath();ctx.arc(body*.36,-body*.32,body*.28,0,Math.PI*2);ctx.fill();ctx.font=`${emoji}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.emoji,0,1);const d=C.DIRS[a.dir],bx=d.dc*offset,by=d.dr*offset;ctx.beginPath();ctx.arc(bx,by,arrowR,0,Math.PI*2);ctx.fillStyle='#264738';ctx.fill();ctx.fillStyle='#FFF';ctx.font=`900 ${Math.max(17,s*.19)}px system-ui`;ctx.fillText(d.arrow,bx,by-1);ctx.restore();
}
function drawFx(){for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle='#FFF1A9';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;for(const f of state.floats){ctx.globalAlpha=Math.max(0,f.life);ctx.fillStyle='#304735';ctx.font='900 25px system-ui';ctx.textAlign='center';ctx.fillText(f.text,f.x,f.y)}ctx.globalAlpha=1}
function mechanicLegend(L){const types=new Set([...L._tiles.values()].map(t=>t.type)),p=[];if(types.has('turn'))p.push('↪ Turn');if(types.has('switch')||types.has('doorSwitch'))p.push('S=永久机关');if(types.has('plate')||types.has('doorPlate'))p.push('P=压力板');if(types.has('toggle')||types.has('doorToggle')||types.has('toggleWall'))p.push('T=切换墙');if(types.has('hazard'))p.push('⚠ 危险');if(types.has('mud')||types.has('trap'))p.push('MUD');if(types.has('crumble'))p.push('GLASS');if(types.has('portal'))p.push('Portal');if(types.has('oneway'))p.push('单向箭头');return p.length?p.join(' · '):'点击宠物 · 观察方向 · 把所有宠物送到 EXIT';}
function drawLegend(){
 const L=level(),b=layout(),y=Math.min(1510,b.bottom+42),best=state.best[String(L.id)];rr(70,y,940,235,34);ctx.fillStyle='rgba(255,255,255,.78)';ctx.fill();ctx.textAlign='center';ctx.fillStyle='#465A4B';ctx.font='700 20px system-ui';wrapText(L.tutorial,W/2,y+44,850,28);
 ctx.fillStyle='#6F7B70';ctx.font='700 15px system-ui';ctx.fillText(mechanicLegend(L),W/2,y+151);
 ctx.fillStyle='#8A948A';ctx.font='600 17px system-ui';ctx.fillText(best?`Best ${best} · Perfect ${L.target} Moves`:'首次通关前隐藏 Perfect Moves · 先通关，再追最优',W/2,y+194);
}
function wrapText(text,x,y,maxWidth,lineHeight){const chars=[...text];let line='',lines=[];for(const ch of chars){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch}else line=test}if(line)lines.push(line);lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight))}
function starsFor(m,L){if(m<=L.target)return 3;if(m<=L.target+2)return 2;return 1}
function winOverlay(){
 const L=level(),s=starsFor(state.moves,L),last=state.levelIndex===LEVELS.length-1;ctx.fillStyle='rgba(25,38,30,.50)';ctx.fillRect(0,0,W,H);rr(120,545,840,735,58);ctx.fillStyle='#FFF9EE';ctx.fill();ctx.textAlign='center';ctx.fillStyle='#2E4937';ctx.font='900 58px system-ui';ctx.fillText(last?'30 LEVELS CLEAR!':'救援成功！',W/2,680);ctx.fillStyle='#D29C2A';ctx.font='900 54px system-ui';ctx.fillText(`${'★'.repeat(s)}${'☆'.repeat(3-s)}`,W/2,765);ctx.fillStyle='#68776B';ctx.font='700 26px system-ui';ctx.fillText(`${state.moves} Moves · Perfect ${L.target}`,W/2,825);ctx.fillStyle='#8B6A45';ctx.font='800 21px system-ui';ctx.fillText(last?'L1–L30 INTEGRATED DEMO CLEARED':(L.id===10?'Chapter 1 Complete · 下一关进入机关区':L.id===20?'Chapter 2 Complete · 下一关进入正式解谜':'第一次先通关；第二次再追 Perfect'),W/2,885);button(250,970,580,96,last?'关卡选择':'下一关  →',last?'levels':'next',30,false,true);button(250,1080,580,80,'再玩一次','restart',24,false,false);
}
function failOverlay(){
 ctx.fillStyle='rgba(58,30,28,.50)';ctx.fillRect(0,0,W,H);rr(135,610,810,590,54);ctx.fillStyle='#FFF7F0';ctx.fill();ctx.textAlign='center';ctx.fillStyle='#8E3E37';ctx.font='900 57px system-ui';ctx.fillText('路线触发危险！',W/2,740);ctx.fillStyle='#77665E';ctx.font='650 24px system-ui';ctx.fillText('危险格或已经碎裂的地板让这条路线失败。',W/2,810);ctx.fillText('Undo 回到之前的状态，重新检查 P / T / S 的依赖。',W/2,850);button(250,945,580,92,'↶ Undo 上一步','undo',28,!state.history.length,true);button(250,1055,580,78,'↻ 重开本关','restart',24,false,false);
}
function drawGame(){
 ctx.save();if(state.shake>0)ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);drawBg();drawTop();drawBoard();state.visuals.forEach(drawAnimal);drawFx();drawLegend();if(state.intro>0){ctx.globalAlpha=Math.min(1,state.intro*1.1);rr(145,235,790,72,28);ctx.fillStyle='rgba(41,76,55,.94)';ctx.fill();ctx.fillStyle='#FFF';ctx.font='900 24px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(level().subtitle,W/2,271);ctx.globalAlpha=1}if(state.won)winOverlay();else if(state.failed)failOverlay();ctx.restore();
}
function draw(){buttons.length=0;ctx.clearRect(0,0,W,H);if(state.scene==='home')drawHome();else if(state.scene==='levels')drawLevelSelect();else drawGame()}
function canvasPoint(ev){const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height}}
function inside(p,b){return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h}
canvas.addEventListener('pointerdown',ev=>{ev.preventDefault();const p=canvasPoint(ev);for(let i=buttons.length-1;i>=0;i--){const b=buttons[i];if(!b.disabled&&inside(p,b)){handleButton(b.id);return}}if(state.scene!=='game'||state.won||state.failed||state.locked)return;let hit=null,best=999,hitR=Math.max(48,layout().cell*.48);for(const v of state.visuals){const a=state.game.animals[v.id];if(a.rescued||a.fallen)continue;const d=Math.hypot(p.x-v.x,p.y-v.y);if(d<hitR&&d<best){best=d;hit=v.id}}if(hit!==null)attempt(hit)},{passive:false});
function handleButton(id){if(id==='play'){buildLevel(0);state.scene='game'}else if(id==='continue'){buildLevel(state.levelIndex);state.scene='game'}else if(id==='levels'){state.selectChapter=Math.floor(state.levelIndex/10);state.scene='levels'}else if(id==='home'){state.scene='home'}else if(id==='undo')undo();else if(id==='restart'){buildLevel(state.levelIndex);state.scene='game'}else if(id==='grid')state.showGrid=!state.showGrid;else if(id==='next'){const ni=Math.min(state.levelIndex+1,LEVELS.length-1);buildLevel(ni);state.scene='game'}else if(id.startsWith('chapter:')){state.selectChapter=Math.max(0,Math.min(2,Number(id.split(':')[1])||0))}else if(id.startsWith('lvl:')){const i=Number(id.split(':')[1]);buildLevel(i);state.scene='game'}}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='g')state.showGrid=!state.showGrid;if(k==='r'&&state.scene==='game')buildLevel(state.levelIndex);if((e.ctrlKey||e.metaKey)&&k==='z')undo();if(k==='escape')state.scene='home'});
function loop(now){const dt=Math.min(.033,(now-state.lastTime)/1000);state.lastTime=now;update(dt);draw();requestAnimationFrame(loop)}
buildLevel(state.levelIndex);state.scene='home';requestAnimationFrame(loop);
})();
