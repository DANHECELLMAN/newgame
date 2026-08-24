global.PawCore=require('./js/core.js');
require('./js/levels.js');
const S=require('./js/solver.js');
let all=true;
console.log(`Loaded ${global.PawLevels.length} levels: L${global.PawLevels[0].id}–L${global.PawLevels.at(-1).id}`);
for(const level of global.PawLevels){
  const t=Date.now();
  const r=S.solveAStar(level,{maxStates:level.solverMax||1800000});
  const match=r.solvable&&r.minMoves===level.target; all=all&&match;
  console.log(`L${level.id}\t${match?'OK':'CHECK'}\tmin=${r.minMoves}\ttarget=${level.target}\tvisited=${r.visited}\texpanded=${r.expanded}\t${Date.now()-t}ms\t${level.name}`);
  if(r.solvable) console.log(' path='+r.path.join(','));
}
process.exitCode=all?0:1;
