(function(root){
'use strict';
const C=root.PawCore;
const W=(cells)=>cells.trim()?cells.trim().split(/\s+/).map(c=>[c,'wall']):[];
const raw=[
{
 id:1,name:'First Rescue',subtitle:'第一只小家伙，回家吧',difficulty:6,rating:'Tutorial',target:1,time:'5–10 秒',theme:'小草坪',
 tutorial:'点击橘猫。它会沿箭头方向一直前进，进入 EXIT 就获救。',
 animals:[['orange_cat','B4','R']],
 tiles:[['F4','exit']]
},
{
 id:2,name:'Two Friends',subtitle:'两位朋友，两条方向',difficulty:9,rating:'Tutorial',target:2,time:'8–15 秒',theme:'小草坪',
 tutorial:'两只宠物都能直接获救，而且谁先走都可以。',
 animals:[['orange_cat','B3','R'],['corgi','E7','U']],
 tiles:[['F3','exit'],['E1','exit']]
},
{
 id:3,name:'Make Some Room',subtitle:'先给朋友让出道路',difficulty:12,rating:'Tutorial',target:3,time:'10–20 秒',theme:'小草坪',
 tutorial:'宠物也会挡路。观察谁挡住了谁，再从最外层开始救援。',
 animals:[['cow_cat','D3','R'],['corgi','D4','U'],['orange_cat','C4','R']],
 tiles:[['F3','exit'],['D1','exit'],['F4','exit']]
},
{
 id:4,name:'Which One First?',subtitle:'不止一个正确开局',difficulty:16,rating:'Easy',target:4,time:'15–25 秒',theme:'花园',
 tutorial:'地图分成上下两个小问题。每个区域有自己的先后，但两个区域可以交错处理。',
 animals:[['orange_cat','C3','R'],['corgi','D3','U'],['shiba','C6','D'],['cow_cat','D6','L']],
 tiles:[['D1','exit'],['F3','exit'],['A6','exit'],['C8','exit']]
},
{
 id:5,name:'Follow the Path',subtitle:'第一次转弯',difficulty:18,rating:'Easy',target:2,time:'15–30 秒',theme:'花园',
 tutorial:'绿色箭头地块会立刻改变方向并继续前进，不会额外消耗一步。',
 animals:[['orange_cat','B6','U'],['shiba','E7','U']],
 tiles:[['B3','turn','R'],['F3','exit'],['E1','exit']]
},
{
 id:6,name:'Around the Garden',subtitle:'墙开始塑造路线',difficulty:22,rating:'Easy',target:3,time:'20–30 秒',theme:'大型后院',
 tutorial:'树篱墙会封住格子；转向地块把道路连接起来。仍然只需要点击宠物。',
 animals:[['orange_cat','B7','U'],['corgi','E7','U'],['cow_cat','F6','L']],
 tiles:[
  ['C1','exit'],['E1','exit'],['A3','wall'],['A4','wall'],['B4','turn','R'],['F4','exit'],
  ['A5','wall'],['D5','wall'],['F5','wall'],['C6','turn','U']
 ]
},
{
 id:7,name:'Two Paths',subtitle:'把大地图拆成小问题',difficulty:25,rating:'Easy',target:5,time:'20–40 秒',theme:'大型后院',
 tutorial:'先扫描上半区和下半区。局部有依赖，但并不是所有宠物都属于同一条链。',
 animals:[['orange_cat','B3','R'],['corgi','D3','U'],['cow_cat','C7','U'],['shiba','E7','L'],['orange_cat','F8','U']],
 tiles:[
  ['D1','exit'],['F1','exit'],['F3','exit'],
  ['A4','wall'],['B4','wall'],['C4','wall'],['D4','wall'],['E4','wall'],
  ['C5','turn','R'],['F5','exit'],['A7','exit']
 ]
},
{
 id:8,name:'Chain Reaction',subtitle:'从最外层反推依赖链',difficulty:31,rating:'Normal',target:5,time:'30–50 秒',theme:'庭院花园',
 tutorial:'这次五只宠物形成一条连续阻挡链。先找出最先能真正离开的那一只。',
 animals:[['shiba','E3','U'],['cow_cat','D3','R'],['corgi','D6','U'],['orange_cat','B6','R'],['cow_cat','B8','U']],
 tiles:[
  ['B1','exit'],['D1','exit'],['E1','exit'],['F3','exit'],
  ['A4','wall'],['F4','wall'],['A5','wall'],['F5','wall'],['F6','exit']
 ]
},
{
 id:9,name:'Scan the Whole Map',subtitle:'难点变成全局扫描',difficulty:34,rating:'Normal',target:7,time:'30–60 秒',theme:'庭院花园',
 tutorial:'三组局部依赖分散在地图里，还有一只自由行动项。先看完整张地图再点。',
 animals:[
  ['cow_cat','C3','L'],['cow_cat','B4','R'],['shiba','E4','U'],['cow_cat','F5','L'],
  ['shiba','C6','U'],['orange_cat','B7','U'],['corgi','F7','U']
 ],
 tiles:[
  ['B1','exit'],['C1','exit'],['D1','wall'],['E1','exit'],['F1','exit'],
  ['D2','wall'],['A3','exit'],['F4','exit'],['A5','exit'],['D6','wall'],['D7','wall'],['D8','wall']
 ]
},
{
 id:10,name:'Backyard Test',subtitle:'Chapter 1 综合测试',difficulty:39,rating:'Normal',target:8,time:'45–90 秒',theme:'Garden Maze',mission:'BACKYARD RESCUE TEST',
 tutorial:'合法行动不一定高效。某些宠物太早移动只会停在半路，之后还得再点一次。',
 animals:[
  ['shiba','C3','L'],['shiba','E3','L'],['corgi','E4','U'],['cow_cat','E5','U'],
  ['cow_cat','C5','U'],['orange_cat','B8','U'],['cow_cat','F6','L'],['corgi','F8','U']
 ],
 tiles:[
  ['A1','wall'],['B1','wall'],['E1','exit'],['F1','exit'],['D2','wall'],['F2','wall'],
  ['A3','exit'],['C4','turn','R'],['F4','exit'],['B5','turn','R'],['F5','exit'],
  ['A6','wall'],['C6','turn','U'],['A7','wall'],['D7','wall']
 ]
},
{
 id:11,name:'Read the Yard',subtitle:'先读地图，再决定第一步',difficulty:46,rating:'Normal',target:5,time:'45–90 秒',theme:'Rescue Yard',cols:7,rows:9,
 tutorial:'黄色 S1 会永久开启同编号门，并解除同编号红色危险格。红色危险格未解除时进入会直接失败。',
 animals:[['orange_cat','B8','U'],['corgi','C4','R'],['cow_cat','F8','U'],['shiba','G7','L']],
 tiles:[
  ['B1','exit'],['F1','exit'],['G4','exit'],['A7','exit'],
  ['B5','switch','S1'],['E4','doorSwitch','S1'],['C7','hazard','S1'],
  ['D2','wall'],['D3','wall'],['D6','wall'],['D8','wall'],['D9','wall'],
  ['A2','wall'],['G2','wall'],['A6','wall'],['G6','wall'],['E2','wall'],['E6','wall']
 ]
},
{
 id:12,name:'False Corridor',subtitle:'能走，不代表现在该走',difficulty:53,rating:'Hard',target:7,time:'1–2 分钟',theme:'Rescue Center',cols:7,rows:9,
 tutorial:'不同编号的按钮会改变不同区域。提前撞上关闭的门不会失败，但可能让你后面多点一次。',
 animals:[['orange_cat','B8','U'],['corgi','C4','R'],['cow_cat','A3','R'],['shiba','G6','L'],['cow_cat','F8','U']],
 tiles:[
  ['B1','exit'],['G4','exit'],['G3','exit'],['A6','exit'],['F1','exit'],
  ['B6','switch','S1'],['E4','doorSwitch','S1'],['F4','switch','S2'],
  ['D3','hazard','S2'],['C6','doorSwitch','S2'],
  ['D1','wall'],['D2','wall'],['D7','wall'],['D8','wall'],['D9','wall'],
  ['A5','wall'],['A7','wall'],['G7','wall'],['E2','wall'],['E7','wall']
 ]
},
{
 id:13,name:'Trap Garden',subtitle:'一条近路，两个致命条件',difficulty:59,rating:'Hard',target:7,time:'1–2 分钟',theme:'Trap Garden',cols:8,rows:9,
 tutorial:'同一张地图里同时有门和危险格。先观察编号关系与每只宠物的直线路线，再决定操作。',
 animals:[['orange_cat','B8','U'],['corgi','C5','R'],['cow_cat','A4','R'],['shiba','H6','L'],['cow_cat','G8','U']],
 tiles:[
  ['B1','exit'],['H5','exit'],['H4','exit'],['A6','exit'],['G1','exit'],
  ['B6','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['D4','hazard','S2'],['D6','hazard','S1'],
  ['D2','wall'],['D3','wall'],['D7','wall'],['D8','wall'],
  ['E2','wall'],['E3','wall'],['E7','wall'],['E8','wall'],
  ['A2','wall'],['H2','wall'],['A7','wall'],['H7','wall'],['F2','wall']
 ]
},
{
 id:14,name:'Crossing Lines',subtitle:'路线交叉，但方向也会骗人',difficulty:64,rating:'Hard',target:8,time:'1–2 分钟',theme:'Service Corridors',cols:8,rows:10,
 tutorial:'蓝色箭头门只能沿箭头方向穿过；它不会改变方向。红色危险格依旧必须先由对应按钮解除。',
 animals:[['orange_cat','B9','U'],['corgi','C5','R'],['cow_cat','A4','R'],['shiba','H6','L'],['cow_cat','G9','U'],['corgi','F2','D']],
 tiles:[
  ['B1','exit'],['H5','exit'],['H4','exit'],['A6','exit'],['G1','exit'],['F10','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],['D6','doorSwitch','S2'],
  ['E4','oneway','R'],['E6','oneway','L'],['G4','hazard','S2'],['F7','hazard','S1'],
  ['D2','wall'],['D3','wall'],['D7','wall'],['D8','wall'],['D9','wall'],
  ['E2','wall'],['E3','wall'],['E7','wall'],['E8','wall'],['E9','wall'],
  ['A2','wall'],['H2','wall'],['A8','wall'],['H8','wall']
 ]
},
{
 id:15,name:'Do Not Rush',subtitle:'多个合法开局，只有一个最安全',difficulty:69,rating:'Hard',target:8,time:'1–2 分钟',theme:'Hazard Wing',cols:8,rows:10,
 tutorial:'从这一关开始，离出口近不再是优势。多个区域都能动，但部分路线会经过尚未解除的危险。',
 animals:[['orange_cat','B9','U'],['corgi','C5','R'],['cow_cat','A6','R'],['shiba','H4','L'],['cow_cat','G9','U'],['corgi','F2','D']],
 tiles:[
  ['B1','exit'],['H5','exit'],['H6','exit'],['A4','exit'],['G1','exit'],['F10','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['D6','hazard','S2'],['D4','hazard','S1'],['G7','hazard','S2'],['F7','hazard','S1'],
  ['D2','wall'],['D3','wall'],['D7','wall'],['D8','wall'],['D9','wall'],
  ['E2','wall'],['E3','wall'],['E7','wall'],['E8','wall'],['E9','wall'],
  ['A3','wall'],['A8','wall'],['H8','wall']
 ]
},
{
 id:16,name:'Locked Courtyard',subtitle:'房间之间互相开门',difficulty:74,rating:'Expert',target:10,time:'2–3 分钟',theme:'Courtyard',cols:8,rows:10,
 tutorial:'不要只看自己所在的房间。按钮、门与危险格分布在不同区域，一次操作可能改变另一侧的路线。',
 animals:[['orange_cat','B9','U'],['corgi','C5','R'],['cow_cat','H4','L'],['shiba','A6','R'],['cow_cat','G9','U'],['corgi','F2','D'],['shiba','H2','D']],
 tiles:[
  ['B1','exit'],['H5','exit'],['A4','exit'],['H6','exit'],['G1','exit'],['F10','exit'],['H10','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['F4','doorSwitch','S2'],['D4','switch','S3'],['E6','hazard','S3'],['H8','doorSwitch','S3'],['F7','hazard','S1'],
  ['D2','wall'],['D3','wall'],['D7','wall'],['D8','wall'],['D9','wall'],['D10','wall'],
  ['E2','wall'],['E3','wall'],['E7','wall'],['E8','wall'],['E9','wall'],['E10','wall'],
  ['A3','wall'],['A8','wall'],['C2','wall'],['C8','wall']
 ]
},
{
 id:17,name:'Three Locks',subtitle:'三层状态链藏在三个区域里',difficulty:80,rating:'Expert',target:10,time:'2–4 分钟',theme:'Three Rooms',cols:9,rows:10,
 tutorial:'三组机关被拆到不同房间。先扫描按钮、门和危险格的编号，再判断哪些路线存在依赖。',
 animals:[['orange_cat','B9','U'],['corgi','C5','R'],['cow_cat','I4','L'],['shiba','A6','R'],['cow_cat','H9','U'],['corgi','F2','D'],['shiba','I2','D']],
 tiles:[
  ['B1','exit'],['I5','exit'],['A4','exit'],['I6','exit'],['H1','exit'],['F10','exit'],['I10','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['G4','doorSwitch','S2'],['E4','switch','S3'],['E6','hazard','S3'],['I9','doorSwitch','S3'],['F7','hazard','S1'],
  ['D1','wall'],['D2','wall'],['D3','wall'],['D7','wall'],['D8','wall'],['D9','wall'],['D10','wall'],
  ['G2','wall'],['G3','wall'],['G7','wall'],['G8','wall'],['G9','wall'],
  ['A3','wall'],['A8','wall'],['E2','wall'],['E8','wall']
 ]
},
{
 id:18,name:'Looks Safe',subtitle:'错误操作可能两三步后才露馅',difficulty:85,rating:'Expert',target:11,time:'2–4 分钟',theme:'Containment Yard',cols:9,rows:10,
 tutorial:'紫色泥地在对应按钮开启前会黏住宠物，浪费额外点击；红色危险格则会直接失败。观察“软陷阱”和“硬陷阱”的区别。',
 animals:[['orange_cat','B9','U'],['corgi','C5','R'],['cow_cat','I4','L'],['shiba','A6','R'],['cow_cat','H9','U'],['corgi','F2','D'],['shiba','I2','D'],['cow_cat','A8','R']],
 tiles:[
  ['B1','exit'],['I5','exit'],['A4','exit'],['I6','exit'],['H1','exit'],['F10','exit'],['I10','exit'],['I8','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['G4','doorSwitch','S2'],['E4','switch','S3'],['E6','hazard','S3'],['I9','doorSwitch','S3'],['F7','hazard','S1'],
  ['D8','mud','S2'],['G8','hazard','S3'],['E8','oneway','R'],
  ['D1','wall'],['D2','wall'],['D3','wall'],['D7','wall'],['D9','wall'],['D10','wall'],
  ['G2','wall'],['G3','wall'],['G7','wall'],['G9','wall'],
  ['A3','wall'],['A9','wall'],['E2','wall'],['E9','wall']
 ]
},
{
 id:19,name:'Rescue Center Expert',subtitle:'几乎每只宠物都能动，但不都该动',difficulty:90,rating:'Extreme',target:11,time:'3–5 分钟',theme:'Rescue Center',cols:9,rows:11,
 tutorial:'多个永久按钮同时控制门、泥地与危险区。错误顺序未必立刻失败，可能几步之后才显出额外成本。',
 animals:[['orange_cat','B10','U'],['corgi','C5','R'],['cow_cat','I4','L'],['shiba','A6','R'],['cow_cat','H10','U'],['corgi','F2','D'],['shiba','I2','D'],['cow_cat','A8','R']],
 tiles:[
  ['B1','exit'],['I5','exit'],['A4','exit'],['I6','exit'],['H1','exit'],['F11','exit'],['I11','exit'],['I8','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['G4','doorSwitch','S2'],['E4','switch','S3'],['E6','hazard','S3'],['I9','doorSwitch','S3'],['F8','hazard','S1'],
  ['D8','mud','S1'],['G8','hazard','S3'],['E8','oneway','R'],
  ['D1','wall'],['D2','wall'],['D3','wall'],['D7','wall'],['D9','wall'],['D10','wall'],['D11','wall'],
  ['G2','wall'],['G3','wall'],['G7','wall'],['G9','wall'],['G10','wall'],
  ['A3','wall'],['A9','wall'],['E2','wall'],['E9','wall'],['E10','wall']
 ]
},
{
 id:20,name:'SAVE THE GOLDEN',subtitle:'Chapter 2 综合救援任务',difficulty:95,rating:'Extreme / Mission',target:13,time:'4–6 分钟',theme:'Night Rescue',mission:'SAVE THE GOLDEN RETRIEVER',cols:9,rows:11,
 tutorial:'金毛被困在设施深处。四组机关同时存在，先观察整张地图，再决定第一只应该移动的宠物。',
 animals:[['orange_cat','B10','U'],['corgi','C5','R'],['cow_cat','I4','L'],['shiba','A6','R'],['cow_cat','H10','U'],['corgi','F2','D'],['shiba','I2','D'],['cow_cat','A8','R'],['golden','G10','U']],
 tiles:[
  ['B1','exit'],['I5','exit'],['A4','exit'],['I6','exit'],['H1','exit'],['F11','exit'],['I11','exit'],['I8','exit'],['G1','exit'],
  ['B7','switch','S1'],['E5','doorSwitch','S1'],['F5','switch','S2'],
  ['G4','doorSwitch','S2'],['E4','switch','S3'],['E6','hazard','S3'],['I9','doorSwitch','S3'],['F8','hazard','S1'],
  ['D8','mud','S1'],['G8','hazard','S3'],['H8','switch','S4'],['G7','doorSwitch','S4'],['G6','hazard','S2'],['E8','oneway','R'],
  ['D1','wall'],['D2','wall'],['D3','wall'],['D7','wall'],['D9','wall'],['D10','wall'],['D11','wall'],
  ['E2','wall'],['E3','wall'],['E7','wall'],['E9','wall'],['E10','wall'],
  ['A3','wall'],['A9','wall']
 ]
},
{
 id:21,name:'Hold the Gate',subtitle:'教程结束：有时候，先别让宠物离开',difficulty:102,rating:'Advanced',target:10,time:'2–4 分钟',theme:'Hedge Corridors',cols:11,rows:13,
 tutorial:'P1 是临时压力板；T1 会同时打开 ON 通道并关闭 OFF 通道。先判断哪些宠物必须趁“旧地图状态”通过。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K10','exit'],['A13','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],
  ['H6','toggle','T1'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['F10','hazard','S1'],
  ['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B3 C3 E3 F3 H3 I3 J3 B5 D5 E5 G5 H5 J5 B7 C7 E7 F7 H7 I7 J7 B9 D9 E9 G9 H9 J9 B11 C11 E11 F11 H11 I11 J11')
 ]
},
{
 id:22,name:'Halfway Is a Choice',subtitle:'同一只宠物，可以先做一半',difficulty:110,rating:'Advanced',target:13,time:'3–5 分钟',theme:'Split Hedge',cols:11,rows:13,
 tutorial:'S2 会让泥地变安全，但继续前进又会触发 T2。你可以先只开启 S2，等旧通道用完后再切换 T2。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K10','exit'],['A13','exit'],['K11','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['F10','hazard','S1'],['J10','doorToggle','T2','on'],
  ['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['I11','doorToggle','T2','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B3 C3 E3 F3 H3 I3 J3 B5 D5 E5 G5 H5 J5 B7 C7 E7 F7 H7 I7 J7 B9 D9 E9 G9 H9 J9')
 ]
},
{
 id:23,name:'Second Pair of Hands',subtitle:'一扇门需要按住，另一条路还需要先稳定',difficulty:118,rating:'Advanced+',target:16,time:'3–6 分钟',theme:'Glasshouse',cols:11,rows:13,
 tutorial:'P2 必须持续有人站着；S3 会稳定裂纹地板。没有 S3 时，玻璃第一次踩上会碎并强制停下，之后再次进入会失败。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K10','exit'],['A13','exit'],['K11','exit'],['A3','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['F6','switch','S3'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['F10','hazard','S1'],['I10','doorPlate','P2'],['J10','doorToggle','T2','on'],
  ['I12','oneway','L'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B5 D5 E5 G5 H5 J5 B7 C7 E7 F7 H7 I7 J7 B9 D9 E9 G9 H9 J9')
 ]
},
{
 id:24,name:'Old Road First',subtitle:'新通道打开时，旧通道会同时消失',difficulty:128,rating:'Expert',target:19,time:'4–7 分钟',theme:'Moving Hedge',cols:11,rows:13,
 tutorial:'金毛可以先只踩 S4；如果太早继续到 T3，会关闭奶牛猫仍需要的旧通道。先做“一半”，再等时机。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K10','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['F10','hazard','S1'],['I10','doorPlate','P2'],['J10','doorToggle','T2','on'],
  ['I12','hazard','S4'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],
  ['I9','switch','S4'],['F9','toggle','T3'],['C9','doorToggle','T3','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B5 D5 E5 G5 H5 J5 B7 C7 E7 F7 H7 I7 J7')
 ]
},
{
 id:25,name:'Relay Plates',subtitle:'同一只宠物，要连续守住两扇门',difficulty:138,rating:'Expert',target:20,time:'5–8 分钟',theme:'Relay Courtyard',cols:11,rows:13,
 tutorial:'P2 的守门者完成第一份工作后，还要移动到 P3 继续守第二扇门。离开 P3 太早，金毛会被锁在门外。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K10','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['F10','hazard','S1'],['I10','doorPlate','P2'],['J10','doorToggle','T2','on'],
  ['I12','hazard','S4'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],['F3','plate','P3'],
  ['I9','switch','S4'],['H9','doorPlate','P3'],['F9','toggle','T3'],['C9','doorToggle','T3','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B5 D5 E5 G5 H5 J5 B7 C7 E7 F7 H7 I7 J7')
 ]
},
{
 id:26,name:'State Flip',subtitle:'同一只宠物，需要地图先关、再开',difficulty:149,rating:'Expert+',target:22,time:'5–9 分钟',theme:'Mirror Garden',cols:11,rows:13,
 tutorial:'右下奶牛猫必须先在 T4=OFF 时进入传送门；传送后却要等 T4=ON 才能走完另一侧。P2→P3→T4 是一条连续接力链。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K5','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['E10','doorToggle','T2','on'],['F10','hazard','S1'],['G10','doorToggle','T4','off'],['H10','doorPlate','P2'],['I10','portal','B'],
  ['C5','portal','B'],['G5','doorToggle','T4','on'],
  ['I12','hazard','S4'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],['F3','plate','P3'],['D3','toggle','T4'],
  ['I9','switch','S4'],['H9','doorPlate','P3'],['F9','toggle','T3'],['C9','doorToggle','T3','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B7 C7 E7 F7 H7 I7 J7')
 ]
},
{
 id:27,name:'One More Switch',subtitle:'地图已经变对了，也不代表现在就安全',difficulty:158,rating:'Extreme',target:23,time:'6–10 分钟',theme:'Trap Courtyard',cols:11,rows:13,
 tutorial:'T4 打开后，传送出来的奶牛猫看起来已经能走；但 H5 还有 S5 危险区。控制 T4 的宠物还必须再走一步开启 S5。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K5','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['E10','doorToggle','T2','on'],['F10','hazard','S1'],['G10','doorToggle','T4','off'],['H10','doorPlate','P2'],['I10','portal','B'],
  ['C5','portal','B'],['G5','doorToggle','T4','on'],['H5','hazard','S5'],
  ['I12','hazard','S4'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],['F3','plate','P3'],['D3','toggle','T4'],['C3','switch','S5'],
  ['I9','switch','S4'],['H9','doorPlate','P3'],['F9','toggle','T3'],['C9','doorToggle','T3','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B7 C7 E7 F7 H7 I7 J7')
 ]
},
{
 id:28,name:'Keep the Old Exit',subtitle:'最后一个旧出口，也会被你自己关掉',difficulty:168,rating:'Extreme',target:24,time:'6–11 分钟',theme:'Five-State Yard',cols:11,rows:13,
 tutorial:'T5 会关闭橘猫从 P1 离开时需要的旧通道，同时又会打开金毛最后的出口。先把橘猫送走，再进入 T5 阶段。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A6','exit'],['K8','exit'],['K5','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['H2','doorToggle','T5','off'],
  ['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['E10','doorToggle','T2','on'],['F10','hazard','S1'],['G10','doorToggle','T4','off'],['H10','doorPlate','P2'],['I10','portal','B'],
  ['C5','portal','B'],['G5','doorToggle','T4','on'],['H5','hazard','S5'],
  ['I12','hazard','S4'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['H11','toggle','T5'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],['F3','plate','P3'],['D3','toggle','T4'],['C3','switch','S5'],
  ['I9','switch','S4'],['H9','doorPlate','P3'],['F9','toggle','T3'],['C9','doorToggle','T5','on'],
  ...W('B1 C1 D1 F1 G1 I1 J1 B7 C7 E7 F7 H7 I7 J7')
 ]
},
{
 id:29,name:'Two-Phase Rescue',subtitle:'进入传送门时要旧状态，出来后却要新状态',difficulty:180,rating:'Master',target:25,time:'7–12 分钟',theme:'Two-Phase Labyrinth',cols:11,rows:13,
 tutorial:'左上奶牛猫必须先穿过 T3=OFF 的旧门进入传送门，之后留在另一层等待；直到金毛切到 T3=ON，它才能完成第二阶段。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A1','exit'],['K8','exit'],['K5','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['H2','doorToggle','T5','off'],
  ['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],['C6','portal','C'],
  ['J1','portal','C'],['F1','doorToggle','T3','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['E10','doorToggle','T2','on'],['F10','hazard','S1'],['G10','doorToggle','T4','off'],['H10','doorPlate','P2'],['I10','portal','B'],
  ['C5','portal','B'],['G5','doorToggle','T4','on'],['H5','hazard','S5'],
  ['I12','hazard','S4'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['H11','toggle','T5'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],['F3','plate','P3'],['D3','toggle','T4'],['C3','switch','S5'],
  ['I9','switch','S4'],['H9','doorPlate','P3'],['F9','toggle','T3'],['C9','doorToggle','T5','on'],
  ...W('B7 C7 E7 F7 H7 I7 J7')
 ]
},
{
 id:30,name:'THE LOST PARK',subtitle:'Chapter 3 综合测试：先读状态链，再动第一步',difficulty:195,rating:'Master / Mission',target:26,time:'8–15 分钟',theme:'Lost Park',mission:'RESCUE EVERYONE',cols:11,rows:13,
 tutorial:'P1/P2/P3、T1–T5、S1–S6、危险区、泥地、碎裂地板、单向通道与三组传送全部同时存在。部分宠物需要等待地图经历两个不同状态。',
 animals:[['orange_cat','A2','R'],['corgi','A4','R'],['cow_cat','K6','L'],['shiba','A8','R'],['cow_cat','A10','R'],['corgi','K12','L'],['shiba','A11','R'],['cow_cat','K3','L'],['golden','K9','L']],
 tiles:[
  ['K2','exit'],['K4','exit'],['A1','exit'],['K8','exit'],['K5','exit'],['A13','exit'],['K11','exit'],['A3','exit'],['A9','exit'],
  ['C2','plate','P1'],['H2','doorToggle','T5','off'],
  ['E4','doorPlate','P1'],['G4','mud','S2'],['H4','doorToggle','T2','off'],
  ['H6','toggle','T1'],['G6','doorToggle','T3','off'],['F6','switch','S3'],['D6','doorToggle','T1','on'],['C6','portal','C'],
  ['J1','portal','C'],['I1','oneway','L'],['H1','hazard','S6'],['F1','doorToggle','T3','on'],
  ['E8','doorToggle','T1','off'],['G8','switch','S1'],
  ['E10','doorToggle','T2','on'],['F10','hazard','S1'],['G10','doorToggle','T4','off'],['H10','doorPlate','P2'],['I10','portal','B'],
  ['C5','portal','B'],['D5','oneway','R'],['G5','doorToggle','T4','on'],['H5','hazard','S5'],
  ['I12','hazard','S4'],['H12','oneway','L'],['G12','crumble','S3'],['E12','portal','A'],['J13','portal','A'],['D13','doorToggle','T1','on'],
  ['C11','switch','S2'],['F11','toggle','T2'],['H11','toggle','T5'],['I11','doorToggle','T2','on'],
  ['H3','plate','P2'],['F3','plate','P3'],['D3','toggle','T4'],['C3','switch','S5'],
  ['I9','switch','S4'],['H9','doorPlate','P3'],['F9','toggle','T3'],['E9','switch','S6'],['C9','doorToggle','T5','on'],
  ...W('B7 C7 E7 F7 H7 I7 J7')
 ]
}
];
root.PawLevels=raw.map(C.createLevelRuntime);
})(typeof globalThis!=='undefined'?globalThis:this);
