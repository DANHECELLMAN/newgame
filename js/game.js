(() => {
"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W=1080,H=1920;
const COLS=6,ROWS=8,CELL=150,BOARD_X=90,BOARD_Y=350;
const BOARD_W=COLS*CELL,BOARD_H=ROWS*CELL;

const DIRS={
  R:{dc:1,dr:0,arrow:"→"},L:{dc:-1,dr:0,arrow:"←"},
  U:{dc:0,dr:-1,arrow:"↑"},D:{dc:0,dr:1,arrow:"↓"}
};

const BREEDS={
  orange_cat:{label:"橘猫",emoji:"🐱",kind:"cat",body:"#E5A05D",accent:"#FFF0CF"},
  cow_cat:{label:"奶牛猫",emoji:"🐱",kind:"cat",body:"#F0F1ED",accent:"#353A36"},
  corgi:{label:"柯基",emoji:"🐶",kind:"dog",body:"#D58B47",accent:"#FFF0D3"},
  shiba:{label:"柴犬",emoji:"🐶",kind:"dog",body:"#C97843",accent:"#F9E5C8"},
  golden:{label:"金毛",emoji:"🐕",kind:"dog",body:"#DBB46B",accent:"#FFF2C8"}
};

const LEVELS=[
{
 name:"01 · 出口",
 subtitle:"先确认新的基础规则",
 tutorial:"宠物必须走进出口才能获救。点击宠物，它会沿朝向自动前进。",
 stars:[2,3],
 animals:[["orange_cat","B4","R"],["corgi","D6","U"]],
 tiles:[["F4","exit"],["D1","exit"]]
},
{
 name:"02 · 转弯与墙",
 subtitle:"地图开始真正参与路线",
 tutorial:"绿色箭头会自动改变宠物方向；墙会封死道路，但你仍然只需要点击宠物。",
 stars:[2,3],
 animals:[["orange_cat","B6","U"],["shiba","E2","D"]],
 tiles:[
  ["B3","turn","R"],["F3","exit"],
  ["E5","turn","L"],["A5","exit"],
  ["C4","wall"],["D4","wall"],["B2","wall"],["F5","wall"]
 ]
},
{
 name:"03 · 永久按钮",
 subtitle:"先做什么开始影响效率",
 tutorial:"踩到黄色按钮会停下，并永久打开同编号的门。",
 stars:[3,4],
 animals:[["cow_cat","B6","U"],["corgi","C4","R"]],
 tiles:[
  ["B3","switch","S1"],["B1","exit"],
  ["E4","doorSwitch","S1"],["F4","exit"],
  ["A4","wall"],["D6","wall"]
 ]
},
{
 name:"04 · 压力按钮",
 subtitle:"能走，不代表现在应该走",
 tutorial:"蓝色压力板只有宠物站在上面时才开门。过早离开可能制造死局，试试 Undo。",
 stars:[3,4],
 animals:[["orange_cat","B6","U"],["shiba","C4","R"]],
 tiles:[
  ["B3","plate","P1"],["B1","exit"],
  ["E4","doorPlate","P1"],["F4","exit"],
  ["A3","wall"],["D6","wall"]
 ]
},
{
 name:"05 · 依赖链",
 subtitle:"真正的行动顺序 Puzzle",
 tutorial:"先让一只宠物保持压力板，再让另一只去开启永久按钮。",
 stars:[4,5],
 animals:[["orange_cat","B7","U"],["corgi","C4","R"]],
 tiles:[
  ["B4","plate","P1"],
  ["B2","doorSwitch","S1"],["B1","exit"],
  ["D4","doorPlate","P1"],["E4","switch","S1"],["F4","exit"],
  ["A5","wall"],["E6","wall"]
 ]
},
{
 name:"06 · 传送门",
 subtitle:"位置也开始成为谜题",
 tutorial:"进入同色传送门会移动到另一端，并在那里结束本次行动；朝向保持不变。",
 stars:[3,4],
 animals:[["cow_cat","B7","U"],["shiba","A3","R"]],
 tiles:[
  ["B4","portal","A"],["E6","portal","A"],["E1","exit"],["F3","exit"],
  ["C5","wall"],["D5","wall"]
 ]
},
{
 name:"07 · 陷阱地块",
 subtitle:"安全路线也可能增加代价",
 tutorial:"紫色黏黏地会困住宠物。再次点击先挣脱，再下一次才能继续移动。",
 stars:[6,7],
 animals:[["orange_cat","B7","U"],["shiba","A4","R"]],
 tiles:[
  ["B4","trap"],["B1","exit"],["F4","exit"],
  ["D6","wall"],["E6","wall"]
 ]
},
{
 name:"08 · 行动限制",
 subtitle:"第一次 Challenge",
 tutorial:"这一关最多 5 次行动。错误的提前移动不会立刻输，但会浪费宝贵步数。",
 stars:[5,5], limit:5,
 animals:[
  ["orange_cat","B7","U"],["corgi","C4","R"],
  ["cow_cat","E7","U"],["shiba","A6","R"]
 ],
 tiles:[
  ["B5","switch","S1"],["B3","turn","R"],["F3","exit"],
  ["E4","doorSwitch","S1"],["F4","exit"],
  ["E1","exit"],["F6","exit"],
  ["C2","wall"],["D2","wall"]
 ]
},
{
 name:"09 · 机关组合",
 subtitle:"压力板 + 门 + 传送 + 按钮",
 tutorial:"观察每一步会改变什么。真正重要的问题已经不是“谁能走”，而是“谁该先走”。",
 stars:[5,6],
 animals:[["cow_cat","A7","U"],["corgi","B4","R"]],
 tiles:[
  ["A4","plate","P1"],["A2","doorSwitch","S1"],["A1","exit"],
  ["D4","doorPlate","P1"],
  ["E4","portal","A"],["C2","portal","A"],
  ["E2","switch","S1"],["F2","exit"],
  ["C6","wall"],["D6","wall"]
 ]
},
{
 name:"10 · Rescue Mission",
 subtitle:"救出金毛",
 tutorial:"这是第一张综合任务图：保持压力板、开永久门、使用传送，最后救出全部宠物。",
 stars:[6,7],
 mission:"SAVE THE GOLDEN RETRIEVER",
 animals:[
  ["orange_cat","A7","U"],["shiba","B4","R"],["golden","C7","U"]
 ],
 tiles:[
  ["A5","plate","P1"],["A2","doorSwitch","S1"],["A1","exit"],
  ["D4","doorPlate","P1"],["E4","switch","S1"],["F4","exit"],
  ["C5","doorSwitch","S1"],["C3","portal","A"],["E7","portal","A"],["E1","exit"],
  ["B2","wall"],["C2","wall"],["D2","wall"]
 ]
}
];

function cidx(s){return s.charCodeAt(0)-65}
function parseCell(s){return {c:cidx(s[0]),r:Number(s.slice(1))-1}}
function cellCenter(c,r){return{x:BOARD_X+c*CELL+CELL/2,y:BOARD_Y+r*CELL+CELL/2}}

let state={
 scene:"home", levelIndex:Math.min(Number(localStorage.getItem("pawEscapeV02Level")||0),LEVELS.length-1),
 animals:[], tiles:new Map(), switches:new Set(), moves:0, history:[],
 particles:[], floats:[], won:false, failed:false, locked:false, showGrid:false,
 intro:0, shake:0, lastTime:performance.now()
};

function key(c,r){return `${c},${r}`}
function rr(x,y,w,h,r){
 const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);
 ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath();
}

function buildLevel(i){
 const L=LEVELS[i];
 state.levelIndex=i; state.switches=new Set(); state.moves=0; state.history=[];
 state.won=false;state.failed=false;state.locked=false;state.intro=3.0;
 state.particles=[];state.floats=[];state.tiles=new Map();
 L.tiles.forEach(t=>{
   const p=parseCell(t[0]), type=t[1], arg=t[2];
   state.tiles.set(key(p.c,p.r),{type,arg,cell:t[0]});
 });
 state.animals=L.animals.map((a,id)=>{
   const p=parseCell(a[1]),pos=cellCenter(p.c,p.r);
   return {id,breed:a[0],c:p.c,r:p.r,dir:a[2],rescued:false,stuck:false,
     x:pos.x,y:pos.y,scale:1,alpha:1,anim:null};
 });
 localStorage.setItem("pawEscapeV02Level",String(i));
}

function snapshot(){
 return {
   animals:state.animals.map(a=>({c:a.c,r:a.r,dir:a.dir,rescued:a.rescued,stuck:a.stuck})),
   switches:[...state.switches], moves:state.moves,won:state.won,failed:state.failed
 };
}
function restore(s){
 state.switches=new Set(s.switches);state.moves=s.moves;state.won=s.won;state.failed=s.failed;
 state.animals.forEach((a,i)=>{
   Object.assign(a,s.animals[i]); const p=cellCenter(a.c,a.r);
   a.x=p.x;a.y=p.y;a.alpha=a.rescued?0:1;a.scale=1;a.anim=null;
 });
 state.locked=false;state.particles=[];state.floats=[];
}
function undo(){
 if(state.locked||!state.history.length)return;
 const s=state.history.pop();restore(s);addFloat("UNDO",W/2,260);
}

function occupied(c,r,ignoreId=-1){
 return state.animals.find(a=>!a.rescued&&a.id!==ignoreId&&a.c===c&&a.r===r);
}
function plateOccupied(id){
 for(const [k,t] of state.tiles) if(t.type==="plate"&&t.arg===id){
   const [c,r]=k.split(",").map(Number);
   if(occupied(c,r,-1)) return true;
 }
 return false;
}
function doorOpen(tile){
 if(tile.type==="doorSwitch") return state.switches.has(tile.arg);
 if(tile.type==="doorPlate") return plateOccupied(tile.arg);
 return true;
}
function portalPair(c,r,id){
 const pts=[];
 for(const [k,t] of state.tiles){
   if(t.type==="portal"&&t.arg===id){
     const [pc,pr]=k.split(",").map(Number);pts.push({c:pc,r:pr});
   }
 }
 return pts.find(p=>p.c!==c||p.r!==r)||null;
}
function tileAt(c,r){return state.tiles.get(key(c,r))||{type:"floor"}}

function addFloat(text,x,y){
 state.floats.push({text,x,y,life:1.15});
}
function burst(x,y,n=12){
 for(let i=0;i<n;i++){
   const a=Math.random()*Math.PI*2,s=80+Math.random()*210;
   state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-90,life:.7+Math.random()*.4,size:5+Math.random()*9});
 }
}

function computeRoute(a){
 const route=[]; let c=a.c,r=a.r,dir=a.dir; let effect=null;
 for(let guard=0;guard<60;guard++){
   const d=DIRS[dir],nc=c+d.dc,nr=r+d.dr;
   if(nc<0||nc>=COLS||nr<0||nr>=ROWS) break;
   if(occupied(nc,nr,a.id)) break;
   const t=tileAt(nc,nr);
   if(t.type==="wall") break;
   if((t.type==="doorSwitch"||t.type==="doorPlate")&&!doorOpen(t)) break;

   c=nc;r=nr;route.push({c,r});
   if(t.type==="exit"){effect={type:"rescue"};break}
   if(t.type==="turn"){dir=t.arg; route[route.length-1].dir=dir; continue}
   if(t.type==="switch"){
     if(!state.switches.has(t.arg)){effect={type:"switch",id:t.arg};break}
     continue;
   }
   if(t.type==="plate"){effect={type:"plate",id:t.arg};break}
   if(t.type==="trap"){effect={type:"trap"};break}
   if(t.type==="portal"){
     const pair=portalPair(c,r,t.arg);
     if(pair && !occupied(pair.c,pair.r,a.id)){
       c=pair.c;r=pair.r;
       route.push({c,r,teleport:true});
       effect={type:"portal",id:t.arg};
     }
     break;
   }
 }
 return {route,c,r,dir,effect};
}

function resolveEnd(){
 if(state.animals.every(a=>a.rescued)){
   state.won=true;state.locked=false;burst(W/2,300,34);return;
 }
 const L=LEVELS[state.levelIndex];
 if(L.limit && state.moves>=L.limit){
   state.failed=true;state.locked=false;return;
 }
 state.locked=false;
}

function attempt(a){
 if(state.locked||state.won||state.failed||a.rescued)return;
 state.history.push(snapshot()); state.moves++;

 if(a.stuck){
   a.stuck=false;addFloat("挣脱！",a.x,a.y-95);burst(a.x,a.y,8);
   resolveEnd();return;
 }

 const result=computeRoute(a);
 if(!result.route.length){
   addFloat("被挡住了",a.x,a.y-95);state.shake=8;
   resolveEnd();return;
 }

 state.locked=true;
 a.c=result.c;a.r=result.r;a.dir=result.dir;
 if(result.effect?.type==="switch"){
   state.switches.add(result.effect.id);addFloat("门已开启",a.x,a.y-95);
 }
 if(result.effect?.type==="trap") a.stuck=true;
 if(result.effect?.type==="rescue") a.rescued=true;

 const points=result.route.map(p=>({...cellCenter(p.c,p.r),teleport:p.teleport||false,c:p.c,r:p.r}));
 a.anim={points,index:0,speed:900,pendingRescue:result.effect?.type==="rescue",effect:result.effect};
}

function update(dt){
 state.shake*=Math.pow(.01,dt);
 if(state.intro>0)state.intro-=dt;
 let anyAnim=false;
 for(const a of state.animals){
   if(a.anim){
     anyAnim=true;
     const p=a.anim.points[a.anim.index];
     if(p.teleport){
       a.x=p.x;a.y=p.y;burst(a.x,a.y,14);a.anim.index++;
       if(a.anim.index>=a.anim.points.length){
         const fx=a.anim.effect;
         if(fx?.type==="portal")addFloat(`PORTAL ${fx.id}`,a.x,a.y-95);
         if(fx?.type==="trap")addFloat("被黏住了",a.x,a.y-95);
         a.anim=null;
       }
       continue;
     }
     const dx=p.x-a.x,dy=p.y-a.y,dist=Math.hypot(dx,dy),step=a.anim.speed*dt;
     if(dist<=step){
       a.x=p.x;a.y=p.y;a.anim.index++;
       if(a.anim.index>=a.anim.points.length){
         const fx=a.anim.effect;
         if(fx?.type==="rescue"){burst(a.x,a.y,18);a.alpha=0}
         if(fx?.type==="switch"){burst(a.x,a.y,12)}
         if(fx?.type==="plate"){addFloat("保持站立 = 开门",a.x,a.y-90)}
         if(fx?.type==="trap"){addFloat("被黏住了",a.x,a.y-95)}
         a.anim=null;
       }
     }else{a.x+=dx/dist*step;a.y+=dy/dist*step}
   }else if(!a.rescued){
     a.scale=1+Math.sin(performance.now()/480+a.id)*.012;
   }
 }
 if(state.locked&&!state.animals.some(a=>a.anim)) resolveEnd();

 state.particles=state.particles.filter(p=>{
   p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=460*dt;return p.life>0;
 });
 state.floats=state.floats.filter(f=>{f.life-=dt;f.y-=48*dt;return f.life>0});
}

function drawBg(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#F7F0E2");g.addColorStop(1,"#E8E7CF");
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.15;
 for(let i=0;i<20;i++){ctx.fillStyle=i%2?"#80A76B":"#BBCB88";ctx.beginPath();ctx.arc((i*177)%W,210+((i*241)%1500),48+(i%5)*12,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;
}
function button(x,y,w,h,label,id,font=24,disabled=false){
 rr(x,y,w,h,22);ctx.fillStyle=disabled?"#D9D9D1":"#FFFFFFD9";ctx.fill();
 ctx.strokeStyle="rgba(48,68,52,.12)";ctx.lineWidth=3;ctx.stroke();
 ctx.fillStyle=disabled?"#9C9C94":"#314A38";ctx.font=`700 ${font}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(label,x+w/2,y+h/2);
 buttons.push({x,y,w,h,id,disabled});
}
function drawTop(){
 const L=LEVELS[state.levelIndex];
 ctx.textBaseline="alphabetic";ctx.textAlign="left";ctx.fillStyle="#2E4233";ctx.font="800 44px system-ui";ctx.fillText(L.name,62,92);
 ctx.fillStyle="#758073";ctx.font="600 24px system-ui";ctx.fillText(L.subtitle,64,132);
 ctx.textAlign="right";ctx.fillStyle="#344D39";ctx.font="800 34px system-ui";
 ctx.fillText(L.limit?`MOVES ${state.moves}/${L.limit}`:`MOVES ${state.moves}`,1018,96);
 ctx.fillStyle="#7B8578";ctx.font="600 22px system-ui";ctx.fillText(`RESCUED ${state.animals.filter(a=>a.rescued).length}/${state.animals.length}`,1018,132);
 button(62,178,165,62,"↶ Undo","undo",23,!state.history.length||state.locked);
 button(245,178,165,62,"↻ 重开","restart",23,state.locked);
 button(848,178,170,62,state.showGrid?"隐藏网格":"开发网格","grid",21,false);
}
function drawBoard(){
 rr(BOARD_X-20,BOARD_Y-20,BOARD_W+40,BOARD_H+40,48);ctx.fillStyle="#AEC97E";ctx.fill();
 ctx.strokeStyle="rgba(50,77,47,.17)";ctx.lineWidth=5;ctx.stroke();

 if(state.showGrid){
   ctx.strokeStyle="rgba(47,70,46,.28)";ctx.lineWidth=2;
   for(let c=0;c<=COLS;c++){const x=BOARD_X+c*CELL;ctx.beginPath();ctx.moveTo(x,BOARD_Y);ctx.lineTo(x,BOARD_Y+BOARD_H);ctx.stroke()}
   for(let r=0;r<=ROWS;r++){const y=BOARD_Y+r*CELL;ctx.beginPath();ctx.moveTo(BOARD_X,y);ctx.lineTo(BOARD_X+BOARD_W,y);ctx.stroke()}
   ctx.fillStyle="#35503B";ctx.font="600 19px monospace";ctx.textAlign="center";
   for(let c=0;c<COLS;c++)ctx.fillText(String.fromCharCode(65+c),BOARD_X+c*CELL+CELL/2,BOARD_Y-26);
   ctx.textAlign="right";for(let r=0;r<ROWS;r++)ctx.fillText(String(r+1),BOARD_X-27,BOARD_Y+r*CELL+CELL/2+6);
 }
 drawTiles();
}
function tileBox(c,r,pad=16){return{x:BOARD_X+c*CELL+pad,y:BOARD_Y+r*CELL+pad,w:CELL-pad*2,h:CELL-pad*2}}
function drawTiles(){
 for(const [k,t] of state.tiles){
   const [c,r]=k.split(",").map(Number),b=tileBox(c,r,16),cx=b.x+b.w/2,cy=b.y+b.h/2;
   if(t.type==="wall"){
     rr(b.x,b.y,b.w,b.h,24);ctx.fillStyle="#637268";ctx.fill();ctx.fillStyle="#839087";
     for(let y=b.y+20;y<b.y+b.h;y+=28)for(let x=b.x+20;x<b.x+b.w;x+=34){ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill()}
   }else if(t.type==="exit"){
     rr(b.x,b.y,b.w,b.h,28);ctx.fillStyle="#F2D478";ctx.fill();ctx.strokeStyle="#A47E25";ctx.lineWidth=4;ctx.stroke();
     ctx.fillStyle="#6E571F";ctx.font="800 27px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("EXIT",cx,cy);
   }else if(t.type==="turn"){
     ctx.beginPath();ctx.arc(cx,cy,45,0,Math.PI*2);ctx.fillStyle="#5B9F6D";ctx.fill();
     ctx.fillStyle="white";ctx.font="800 46px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(DIRS[t.arg].arrow,cx,cy-1);
   }else if(t.type==="switch"){
     ctx.beginPath();ctx.arc(cx,cy,42,0,Math.PI*2);ctx.fillStyle=state.switches.has(t.arg)?"#FFD35A":"#E7B836";ctx.fill();
     ctx.strokeStyle="#8E6D16";ctx.lineWidth=5;ctx.stroke();ctx.fillStyle="#6D5415";ctx.font="800 22px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(t.arg,cx,cy);
   }else if(t.type==="plate"){
     rr(cx-47,cy-33,94,66,20);ctx.fillStyle=plateOccupied(t.arg)?"#67B8D7":"#92CDE5";ctx.fill();ctx.strokeStyle="#397A95";ctx.lineWidth=4;ctx.stroke();
     ctx.fillStyle="#2F6A80";ctx.font="800 21px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(t.arg,cx,cy);
   }else if(t.type==="doorSwitch"||t.type==="doorPlate"){
     const open=doorOpen(t);rr(cx-48,cy-55,96,110,18);ctx.fillStyle=open?"#B7D7AF":"#8B634E";ctx.fill();
     ctx.strokeStyle=open?"#4D8552":"#5F3E30";ctx.lineWidth=5;ctx.stroke();
     ctx.fillStyle=open?"#3F7445":"#F6E4D7";ctx.font="800 21px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(open?"OPEN":"DOOR",cx,cy);
   }else if(t.type==="portal"){
     const grad=ctx.createRadialGradient(cx,cy,8,cx,cy,48);grad.addColorStop(0,"#F5EAFF");grad.addColorStop(.45,"#A977D8");grad.addColorStop(1,"#513276");
     ctx.beginPath();ctx.arc(cx,cy,48,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();
     ctx.fillStyle="white";ctx.font="800 24px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(t.arg,cx,cy);
   }else if(t.type==="trap"){
     rr(cx-48,cy-40,96,80,25);ctx.fillStyle="#9C79A8";ctx.fill();ctx.fillStyle="#F4DDF7";
     ctx.font="800 24px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("STICKY",cx,cy);
   }
 }
}
function drawAnimal(a){
 if(a.alpha<=0)return;const b=BREEDS[a.breed];
 ctx.save();ctx.translate(a.x,a.y);ctx.scale(a.scale,a.scale);ctx.globalAlpha=a.alpha;
 ctx.fillStyle="rgba(45,52,43,.16)";ctx.beginPath();ctx.ellipse(0,46,51,18,0,0,Math.PI*2);ctx.fill();
 rr(-55,-55,110,110,40);ctx.fillStyle=b.body;ctx.fill();ctx.strokeStyle="rgba(54,55,48,.12)";ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle=b.accent;ctx.beginPath();ctx.arc(19,-18,18,0,Math.PI*2);ctx.fill();
 ctx.font="50px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(b.emoji,0,2);
 const d=DIRS[a.dir],bx=d.dc*58,by=d.dr*58;ctx.beginPath();ctx.arc(bx,by,24,0,Math.PI*2);ctx.fillStyle="#294838";ctx.fill();
 ctx.fillStyle="white";ctx.font="800 29px system-ui";ctx.fillText(d.arrow,bx,by-1);
 if(a.stuck){ctx.fillStyle="#6E4A77";ctx.font="800 22px system-ui";ctx.fillText("STUCK",0,-73)}
 ctx.restore();
}
function drawFx(){
 for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle="#FFF2B8";ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;
 for(const f of state.floats){ctx.globalAlpha=Math.max(0,f.life);ctx.fillStyle="#304735";ctx.font="800 28px system-ui";ctx.textAlign="center";ctx.fillText(f.text,f.x,f.y)}
 ctx.globalAlpha=1;
}
function drawLegend(){
 const L=LEVELS[state.levelIndex];
 ctx.textAlign="center";ctx.fillStyle="#526050";ctx.font="600 25px system-ui";
 ctx.fillText(L.tutorial,W/2,1618);
 if(L.mission){ctx.fillStyle="#A06335";ctx.font="900 29px system-ui";ctx.fillText(L.mission,W/2,1682)}
 else{ctx.fillStyle="#82907E";ctx.font="500 22px system-ui";ctx.fillText("普通关允许 Undo / Restart；星级鼓励更优解法",W/2,1670)}
}
function starsForMoves(m,L){
 if(m<=L.stars[0])return 3;if(m<=L.stars[1])return 2;return 1;
}
function overlay(title,sub,primary,pid,secondary,sid){
 ctx.fillStyle="rgba(29,38,32,.42)";ctx.fillRect(0,0,W,H);
 rr(120,580,840,650,58);ctx.fillStyle="#FFF9EE";ctx.fill();
 ctx.fillStyle="#2E4233";ctx.textAlign="center";ctx.font="900 66px system-ui";ctx.fillText(title,W/2,742);
 ctx.fillStyle="#6D786D";ctx.font="500 29px system-ui";ctx.fillText(sub,W/2,802);
 button(250,936,580,100,primary,pid,33,false);
 if(secondary)button(250,1060,580,84,secondary,sid,27,false);
}
function drawHome(){
 drawBg();ctx.textAlign="center";ctx.fillStyle="#2C4937";ctx.font="900 86px system-ui";ctx.fillText("PAW ESCAPE",W/2,300);
 ctx.fillStyle="#778072";ctx.font="600 28px system-ui";ctx.fillText("Puzzle System Prototype V0.2",W/2,350);
 ctx.font="145px system-ui";ctx.fillText("🐱  🐶",W/2,610);
 rr(142,735,796,390,52);ctx.fillStyle="#FFFFFFBD";ctx.fill();
 ctx.fillStyle="#3E5141";ctx.font="800 36px system-ui";ctx.fillText("V0.2 新玩法",W/2,825);
 ctx.font="600 28px system-ui";ctx.fillText("出口 · 墙 · 转向 · 门 · 两类按钮",W/2,895);
 ctx.fillText("传送 · 陷阱 · Undo · 行动限制",W/2,945);
 ctx.fillStyle="#778173";ctx.font="500 24px system-ui";ctx.fillText("10 个实验关，用来验证真正的 Puzzle 地基",W/2,1010);
 button(220,1200,640,118,"开始实验  ▶","play",37,false);
 button(320,1345,440,82,`继续 ${LEVELS[state.levelIndex].name}`,"continue",24,false);
 ctx.fillStyle="#8A9185";ctx.font="500 21px system-ui";ctx.fillText("纯 HTML5 + Canvas 2D，无游戏引擎",W/2,1745);
}
const buttons=[];
function draw(){
 buttons.length=0;ctx.clearRect(0,0,W,H);
 if(state.scene==="home"){drawHome();return}
 ctx.save();if(state.shake>0)ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);
 drawBg();drawTop();drawBoard();state.animals.forEach(drawAnimal);drawFx();drawLegend();

 if(state.intro>0){
   ctx.globalAlpha=Math.min(1,state.intro*1.1);rr(175,276,730,96,34);ctx.fillStyle="#2D4939E8";ctx.fill();
   ctx.fillStyle="white";ctx.font="800 28px system-ui";ctx.textAlign="center";ctx.fillText(LEVELS[state.levelIndex].subtitle,W/2,336);ctx.globalAlpha=1;
 }
 if(state.won){
   const L=LEVELS[state.levelIndex],s=starsForMoves(state.moves,L),last=state.levelIndex===LEVELS.length-1;
   overlay(last?"V0.2 实验完成！":"救援成功！",`${"★".repeat(s)}${"☆".repeat(3-s)}   ·   ${state.moves} Moves`,
     last?"回到首页":"下一关  →",last?"home":"next","再玩一次","restart");
 }else if(state.failed){
   overlay("Challenge Failed",`行动次数已用完：${state.moves}/${LEVELS[state.levelIndex].limit}`,"Undo 一步","undo","重新挑战","restart");
 }
 ctx.restore();
}
function canvasPoint(ev){const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height}}
function inside(p,b){return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h}
canvas.addEventListener("pointerdown",ev=>{
 ev.preventDefault();const p=canvasPoint(ev);
 for(let i=buttons.length-1;i>=0;i--){const b=buttons[i];if(!b.disabled&&inside(p,b)){
   if(b.id==="play"||b.id==="continue"){buildLevel(state.levelIndex);state.scene="game"}
   else if(b.id==="restart"){buildLevel(state.levelIndex);state.scene="game"}
   else if(b.id==="undo")undo();
   else if(b.id==="grid")state.showGrid=!state.showGrid;
   else if(b.id==="home")state.scene="home";
   else if(b.id==="next"){state.levelIndex=Math.min(state.levelIndex+1,LEVELS.length-1);buildLevel(state.levelIndex)}
   return;
 }}
 if(state.scene!=="game"||state.won||state.failed||state.locked)return;
 let hit=null,best=999;
 for(const a of state.animals){if(a.rescued)continue;const d=Math.hypot(p.x-a.x,p.y-a.y);if(d<74&&d<best){best=d;hit=a}}
 if(hit)attempt(hit);
},{passive:false});
window.addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();if(k==="g")state.showGrid=!state.showGrid;
 if(k==="r"&&state.scene==="game")buildLevel(state.levelIndex);
 if((e.ctrlKey||e.metaKey)&&k==="z")undo();
});
function loop(now){const dt=Math.min(.033,(now-state.lastTime)/1000);state.lastTime=now;update(dt);draw();requestAnimationFrame(loop)}
buildLevel(state.levelIndex);state.scene="home";requestAnimationFrame(loop);
})();
