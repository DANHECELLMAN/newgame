(function(root,factory){
 const api=factory(root.PawCore);
 if(typeof module==='object'&&module.exports) module.exports=api;
 root.PawSolver=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(C){
 'use strict';

 function reconstruct(nodes,idx){
   const out=[];
   while(idx>0){out.push(nodes[idx].action);idx=nodes[idx].parent;}
   return out.reverse();
 }

 function solveFrom(level,startState,opts={}){
   const maxStates=opts.maxStates||level.solverMax||900000;
   const start=C.cloneState(startState);
   if(C.isFailed(start)) return {solvable:false,minMoves:null,path:null,visited:1,failed:true};
   if(C.isSolved(start)) return {solvable:true,minMoves:0,path:[],visited:1};
   const nodes=[{state:start,parent:-1,action:-1,depth:0}];
   const seen=new Set([C.stateKey(start)]);let head=0;
   while(head<nodes.length && seen.size<=maxStates){
     const cur=nodes[head];
     for(const a of cur.state.animals){
       if(a.rescued||a.fallen) continue;
       const res=C.simulateAction(level,cur.state,a.id);
       if(!res.changed || C.isFailed(res.state)) continue;
       const k=C.stateKey(res.state);if(seen.has(k)) continue;
       const node={state:res.state,parent:head,action:a.id,depth:cur.depth+1};
       if(C.isSolved(res.state)){
         nodes.push(node);const idx=nodes.length-1;
         return {solvable:true,minMoves:node.depth,path:reconstruct(nodes,idx),visited:seen.size+1};
       }
       seen.add(k);nodes.push(node);if(seen.size>maxStates) break;
     }
     head++;
   }
   return {solvable:false,minMoves:null,path:null,visited:seen.size,truncated:seen.size>maxStates};
 }

 // Relaxed single-animal click lower bound. Doors, hazards, switches, mud,
 // crumble and other animals are ignored; only unavoidable plate/toggle/portal
 // stops remain. This cannot overestimate the real number of clicks.
 function relaxedAnimalClicks(level,animal){
   if(animal.rescued) return 0;
   let c=animal.c,r=animal.r,dir=animal.dir;
   let clicks=animal.stuck?1:0;
   const maxClicks=24,{cols,rows}=C.dims(level);
   for(let action=0;action<maxClicks;action++){
     clicks++;
     let moved=false;
     for(let guard=0;guard<220;guard++){
       const d=C.DIRS[dir],nc=c+d.dc,nr=r+d.dr;
       if(nc<0||nc>=cols||nr<0||nr>=rows) return Math.max(1,clicks-1);
       const t=C.tileAt(level,nc,nr);
       if(t.type==='wall') return Math.max(1,clicks-1);
       c=nc;r=nr;moved=true;
       if(t.type==='exit') return clicks;
       if(t.type==='turn'){dir=t.arg;continue;}
       if(t.type==='plate'||t.type==='toggle') break;
       if(t.type==='portal'){
         let pair=null;
         for(const [k,pt] of level._tiles){
           if(pt.type!=='portal'||pt.arg!==t.arg) continue;
           const [pc,pr]=k.split(',').map(Number);
           if(pc!==c||pr!==r){pair={c:pc,r:pr};break;}
         }
         if(pair){c=pair.c;r=pair.r;}break;
       }
       // relaxed: all other mechanisms are pass-through
     }
     if(!moved) return Math.max(1,clicks-1);
   }
   return 1;
 }
 function relaxedHeuristic(level,state){
   let h=0;for(const a of state.animals) if(!a.rescued&&!a.fallen) h+=relaxedAnimalClicks(level,a);return h;
 }

 class MinHeap{
   constructor(){this.a=[];}
   push(x){const a=this.a;a.push(x);let i=a.length-1;while(i){const p=(i-1)>>1;if(compare(a[p],x)<=0)break;a[i]=a[p];i=p;}a[i]=x;}
   pop(){const a=this.a;if(!a.length)return null;const top=a[0],last=a.pop();if(a.length){let i=0;while(true){let l=i*2+1,r=l+1;if(l>=a.length)break;let m=(r<a.length&&compare(a[r],a[l])<0)?r:l;if(compare(a[m],last)>=0)break;a[i]=a[m];i=m;}a[i]=last;}return top;}
   get length(){return this.a.length;}
 }
 function compare(x,y){return x.f-y.f || x.h-y.h || x.g-y.g || x.seq-y.seq;}

 function solveAStar(level,opts={}){
   const maxStates=opts.maxStates||level.solverMax||1600000;
   const start=C.createInitialState(level);const sk=C.stateKey(start);
   const nodes=[{state:start,parent:-1,action:-1,g:0}];
   const bestG=new Map([[sk,0]]);const heap=new MinHeap();let seq=0;
   const h0=relaxedHeuristic(level,start);heap.push({idx:0,g:0,h:h0,f:h0,seq:seq++});
   let expanded=0;
   while(heap.length && bestG.size<=maxStates){
     const item=heap.pop(),curNode=nodes[item.idx],cur=curNode.state;
     const ck=C.stateKey(cur);if(bestG.get(ck)!==item.g) continue;
     if(C.isSolved(cur)) return {solvable:true,minMoves:item.g,path:reconstruct(nodes,item.idx),visited:bestG.size,expanded,algorithm:'A*'};
     expanded++;
     for(const a of cur.animals){
       if(a.rescued||a.fallen) continue;
       const res=C.simulateAction(level,cur,a.id);if(!res.changed||C.isFailed(res.state))continue;
       const k=C.stateKey(res.state),g=item.g+1,old=bestG.get(k);if(old!==undefined&&old<=g)continue;
       const node={state:res.state,parent:item.idx,action:a.id,g};nodes.push(node);const idx=nodes.length-1;bestG.set(k,g);
       const h=relaxedHeuristic(level,res.state);heap.push({idx,g,h,f:g+h,seq:seq++});
       if(bestG.size>maxStates)break;
     }
   }
   return {solvable:false,minMoves:null,path:null,visited:bestG.size,expanded,truncated:bestG.size>maxStates,algorithm:'A*'};
 }

 function solve(level,opts={}){ return solveFrom(level,C.createInitialState(level),opts); }
 function validate(levels){
   return levels.map(level=>{
     const result=solve(level,{maxStates:level.solverMax||900000});
     return {id:level.id,name:level.name,target:level.target,...result,matchesTarget:level.target==null?true:result.minMoves===level.target};
   });
 }
 return {solve,solveFrom,solveAStar,relaxedHeuristic,validate};
});
