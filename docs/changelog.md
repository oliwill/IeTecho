# Changelog

## 2026-06-29

### Added

- P1 云开发：4 云函数（memberOps/reportOps/exportData/getDashboard）+ 5 集合 + 多用户隔离（真机验证通过）。
- P1 报告上传闭环：reportService.upload（前端直传云存储 + 写库）、report-upload 双入口（聊天/相册）、member-detail 底部录入入口、app-button 加 loading/disabled。
- P2 AI 解读：interpretReport 云函数（微信 OCR → DeepSeek 结构化 JSON）、report-result 页四态轮询（加载/解读中/失败/成功）、reportService.interpret、interpretationService.getByReport。
- 本地私密配置机制：cloud.local.ts（env ID）、config.json（DeepSeek key + OCR 权限），均不入库。
- seed/ 种子数据、Design/ 设计原型。

### Fixed

- 云函数取 openid 改用 `cloud.getWXContext()`（context.OPENID 为 null）。
- 云函数 get 查询改业务 id + _id 双查（原仅 _id 查询查不到记录）。
- 云函数 context 未定义 bug、status-tag null 兜底、services 目录 import 解析。

### Changed

- 当前阶段推进到 P2 AI 解读（代码完成，待真机验证）。

## 2026-06-18

### Added

- 接入 OpenDesign 高保真设计稿，产物归档至 `Mobile-App/`（启动页、首页、入口页、品牌规范、critique）。
- 新增报告 Tab 页面骨架（`miniprogram/pages/reports/`），作为跨家人报告列表一级入口。
- 新增 OpenDesign 设计简报 `docs/design/opendesign-brief.md`。

### Changed

- 配色体系由青绿（#35AFA0）调整为深绿（#4f7765），更沉稳自然。`tokens.wxss` 为唯一真源，视觉系统文档与设计简报已同步。
- 底部 Tab 由 3 个（首页/家人/更多）调整为 4 个（首页/家人/报告/我的），新增「报告」一级入口，「更多」改名为「我的」。11 个文档已同步。
- `app.json` 标题改为「我家手帖」，页面背景与导航配色对齐深绿体系。

### Cleaned

- 删除仓库根目录散落的 OpenDesign 导出文件（含 2 个旧青绿版本），统一归入 `Mobile-App/`。

## 2026-06-12

### Added

- 创建家庭健康档案与体检报告解读微信小程序产品设计文档。
- 确认产品边界：不做 AI 医生，不做诊断、处方、治疗方案。
- 确认底部 Tab：`首页 / 家人 / 更多`（2026-06-18 调整为 4 Tab）。
- 新增页面原型文档与页面状态矩阵。
- 新增组件规格、视觉系统、动效规范。
- 使用 qiaomu-ai-prd 方法论生成项目管理 PRD，并通过 PRD lint。
- 创建原生微信小程序 P0 静态 Mock 工程。
- 新增小程序页面：
  - 首页
  - 家人
  - 更多
  - 成员详情
  - 添加 / 编辑家人
  - 报告上传
  - 解读中
  - 报告解读结果
  - 指标确认
- 新增小程序组件：
  - `app-button`
  - `empty-state`
  - `error-state`
  - `family-profile-card`
  - `health-status-ring`
  - `metric-annotation-card`
  - `reminder-card`
  - `report-summary-card`
  - `status-tag`
  - `trend-chart-card`
- 新增 mock 数据和 TypeScript 数据模型。
- 新增 README、项目级 CLAUDE、架构说明、运行手册和交接说明。

### Current limitations

- 当前为静态 Mock，不接微信云开发。
- 当前不接 AI API。
- 当前不做真实报告上传。
- 当前不做 OCR。
- 当前不接 ECharts 和 Lottie。
- 当前不接订阅消息。
- 当前 `project.config.json` 使用 `touristappid`，正式开发前需替换为真实 AppID。
