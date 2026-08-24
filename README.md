# Paw Escape V0.6 — L1–L30 Integrated Demo

这是将此前三个 Demo 合并后的连续版本：

- Chapter 1 — L1–10：基础移动、宠物阻挡、Turn、Wall
- Chapter 2 — L11–20：永久按钮、门、危险格、泥地、单向通道
- Chapter 3 — L21–30：压力板、ON/OFF Toggle、碎裂地板、Portal、多阶段状态谜题

## 运行

直接打开 `index.html`。如果浏览器限制本地脚本，也可以直接打开根目录的 Standalone HTML。

## 关卡选择

30 关按 Chapter 1 / 2 / 3 分页，每页 10 关。主线通关是连续的：L10 → L11，L20 → L21。

## 进度

- 当前关卡使用 `pawEscapeV06Level`
- 最佳步数使用 `pawEscapeV06Best`
- V0.6 会尝试合并读取 V0.3 / V0.4 / V0.5 的历史 Best 记录
- 第一次通关前隐藏 Perfect Moves；通关后显示 Best 与 Perfect

## 验证

`node validate_levels.js`

全量 A* Solver 已验证：L1–L30 共 30 关全部可解，并且每关最少步数与关卡 target 完全一致。详见 `SOLVER_REPORT.txt`。

## 文件结构

- `js/core.js`：纯规则 / 状态模拟
- `js/levels.js`：L1–L30 全部关卡数据
- `js/solver.js`：BFS / A* Solver
- `js/game.js`：Canvas 表现层、动画、UI、输入、存档
- `css/style.css`：页面与 Canvas 适配
- `index.html`：开发版入口
- `Paw_Escape_Standalone_V0.6_L1-L30.html`：单文件试玩版
- `SOLVER_REPORT.txt`：30 关 Solver 回归报告
