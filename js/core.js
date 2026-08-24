(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  root.PawCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DEFAULT_COLS=6, DEFAULT_ROWS=8;
  const DIRS={
    R:{dc:1,dr:0,arrow:'→'}, L:{dc:-1,dr:0,arrow:'←'},
    U:{dc:0,dr:-1,arrow:'↑'}, D:{dc:0,dr:1,arrow:'↓'}
  };

  function cidx(ch){ return ch.charCodeAt(0)-65; }
  function parseCell(s){ return {c:cidx(s[0]),r:Number(s.slice(1))-1}; }
  function key(c,r){ return `${c},${r}`; }
  function dims(level){ return {cols:level.cols||DEFAULT_COLS,rows:level.rows||DEFAULT_ROWS}; }
  function cloneState(state){
    return {
      animals: state.animals.map(a=>({...a})),
      switches:[...(state.switches||[])],
      toggles:[...(state.toggles||[])],
      crumbled:[...(state.crumbled||[])],
      moves:state.moves||0,
      failed:!!state.failed,
      failReason:state.failReason||null
    };
  }
  function createLevelRuntime(level){
    const tiles=new Map();
    (level.tiles||[]).forEach(t=>{
      const p=parseCell(t[0]);
      tiles.set(key(p.c,p.r),{type:t[1],arg:t[2]??null,arg2:t[3]??null,cell:t[0]});
    });
    return {...level,...dims(level),_tiles:tiles};
  }
  function createInitialState(level){
    return {
      animals:level.animals.map((a,id)=>{
        const p=parseCell(a[1]);
        return {id,breed:a[0],c:p.c,r:p.r,dir:a[2],rescued:false,stuck:false,fallen:false};
      }),
      switches:[],toggles:[],crumbled:[],moves:0,failed:false,failReason:null
    };
  }
  function occupied(state,c,r,ignoreId=-1){
    return state.animals.find(a=>!a.rescued && !a.fallen && a.id!==ignoreId && a.c===c && a.r===r) || null;
  }
  function tileAt(level,c,r){ return level._tiles.get(key(c,r)) || {type:'floor',arg:null,arg2:null}; }
  function switchOn(state,id){ return (state.switches||[]).includes(id); }
  function toggleOn(state,id){ return (state.toggles||[]).includes(id); }
  function crumbled(state,cell){ return (state.crumbled||[]).includes(cell); }
  function plateOccupied(level,state,id){
    for(const [k,t] of level._tiles){
      if(t.type==='plate' && t.arg===id){
        const [c,r]=k.split(',').map(Number);
        if(occupied(state,c,r,-1)) return true;
      }
    }
    return false;
  }
  function doorOpen(level,state,tile){
    if(tile.type==='doorSwitch') return switchOn(state,tile.arg);
    if(tile.type==='doorPlate') return plateOccupied(level,state,tile.arg);
    if(tile.type==='doorToggle' || tile.type==='toggleWall'){
      const on=toggleOn(state,tile.arg);
      return tile.arg2==='off' ? !on : on;
    }
    return true;
  }
  function hazardSafe(state,tile){
    if(tile.type!=='hazard') return true;
    return !!tile.arg && switchOn(state,tile.arg);
  }
  function oneWayAllows(tile,dir){ return tile.type!=='oneway' || tile.arg===dir; }
  function portalPair(level,c,r,id){
    for(const [k,t] of level._tiles){
      if(t.type!=='portal'||t.arg!==id) continue;
      const [pc,pr]=k.split(',').map(Number);
      if(pc!==c||pr!==r) return {c:pc,r:pr};
    }
    return null;
  }
  function isSolved(state){ return !state.failed && state.animals.every(a=>a.rescued); }
  function isFailed(state){ return !!state.failed || state.animals.some(a=>a.fallen); }

  function toggleId(next,id){
    const i=next.toggles.indexOf(id);
    if(i>=0) next.toggles.splice(i,1); else next.toggles.push(id);
    next.toggles.sort();
    return next.toggles.includes(id);
  }

  /** Pure rules function. Returns a new state and a movement trace. */
  function simulateAction(level,state,animalId){
    const next=cloneState(state);
    const a=next.animals[animalId];
    const trace=[];
    let effect=null;
    if(!a || a.rescued || a.fallen || next.failed) return {state:next,trace,effect,changed:false};

    next.moves=(next.moves||0)+1;
    if(a.stuck){
      a.stuck=false;
      return {state:next,trace,effect:{type:'unstick'},changed:true};
    }

    let c=a.c,r=a.r,dir=a.dir;
    const {cols,rows}=dims(level);
    for(let guard=0;guard<240;guard++){
      const d=DIRS[dir];
      const nc=c+d.dc,nr=r+d.dr;
      if(nc<0||nc>=cols||nr<0||nr>=rows) break;
      if(occupied(next,nc,nr,a.id)) break;
      const t=tileAt(level,nc,nr);
      if(t.type==='wall') break;
      if((t.type==='doorSwitch'||t.type==='doorPlate'||t.type==='doorToggle'||t.type==='toggleWall') && !doorOpen(level,next,t)) break;
      if(t.type==='oneway' && !oneWayAllows(t,dir)) break;

      // A previously broken floor is a hard failure when entered again.
      if(t.type==='crumble' && crumbled(next,t.cell) && !(t.arg && switchOn(next,t.arg))){
        c=nc;r=nr;trace.push({c,r});
        a.fallen=true;next.failed=true;next.failReason=`crumble:${t.cell}`;
        effect={type:'crumbleFail',cell:t.cell,id:t.arg||null};
        break;
      }

      c=nc;r=nr;
      const step={c,r};
      trace.push(step);
      if(t.type==='exit'){
        effect={type:'rescue'};
        a.rescued=true;
        break;
      }
      if(t.type==='turn'){
        dir=t.arg;step.dir=dir;continue;
      }
      if(t.type==='switch'){
        if(!switchOn(next,t.arg)){
          next.switches.push(t.arg);next.switches.sort();
          effect={type:'switch',id:t.arg};break;
        }
        continue;
      }
      if(t.type==='toggle'){
        const on=toggleId(next,t.arg);
        effect={type:'toggle',id:t.arg,on};
        break;
      }
      if(t.type==='plate'){
        effect={type:'plate',id:t.arg};
        break;
      }
      if(t.type==='mud' || t.type==='trap'){
        if(t.arg && switchOn(next,t.arg)) continue;
        a.stuck=true;effect={type:'mud',id:t.arg||null};break;
      }
      if(t.type==='hazard' && !hazardSafe(next,t)){
        a.fallen=true;next.failed=true;next.failReason=`hazard:${t.cell}`;
        effect={type:'hazard',cell:t.cell,id:t.arg};break;
      }
      if(t.type==='crumble'){
        // Optional stabilizer switch: once ON, fragile flooring no longer breaks.
        // Unstabilized flooring breaks on first entry and stops that animal; later re-entry is fatal.
        if(!(t.arg && switchOn(next,t.arg))){
          if(!next.crumbled.includes(t.cell)) next.crumbled.push(t.cell);
          next.crumbled.sort();
          step.crumble=true;
          effect={type:'crumble',cell:t.cell,id:t.arg||null};
          break;
        }
        continue;
      }
      if(t.type==='portal'){
        const pair=portalPair(level,c,r,t.arg);
        if(pair && !occupied(next,pair.c,pair.r,a.id)){
          c=pair.c;r=pair.r;trace.push({c,r,teleport:true});
          effect={type:'portal',id:t.arg};
        }
        break;
      }
    }

    a.c=c;a.r=r;a.dir=dir;
    const changed=trace.length>0 || !!effect;
    return {state:next,trace,effect,changed};
  }

  function stateKey(state){
    const animals=state.animals.map(a=>a.rescued?'X':a.fallen?'F':`${a.c},${a.r},${a.dir},${a.stuck?'1':'0'}`).join('|');
    return `${animals}#S:${[...(state.switches||[])].sort().join(',')}#T:${[...(state.toggles||[])].sort().join(',')}#C:${[...(state.crumbled||[])].sort().join(',')}#${state.failed?'1':'0'}`;
  }

  return {
    DEFAULT_COLS,DEFAULT_ROWS,DIRS,parseCell,key,dims,createLevelRuntime,createInitialState,
    cloneState,simulateAction,isSolved,isFailed,stateKey,tileAt,doorOpen,plateOccupied,
    hazardSafe,oneWayAllows,switchOn,toggleOn,crumbled
  };
});
