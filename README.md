# IeTecho

IeTecho 是一个家庭健康档案与体检报告解读产品，目标是帮助用户看懂体检报告 / 化验单、管理家人健康档案、持续追踪重点指标，并做好复查、复诊和生活方式提醒。

平台策略：微信小程序先行（自用验证与早期产品化），iOS App 后续（完美实现设计语言）。两阶段都真实落地。详见 `docs/plans/2026-06-17-platform-decision.md`。

## 当前阶段

截至 2026-06-29，项目处于 **P2 AI 解读（代码完成，待真机验证）**：

- P0 静态 Mock ✅、P1 云开发接入 ✅、P1 报告上传 ✅、P2 AI 解读代码 ✅。
- 微信云开发：4 云函数（memberOps/reportOps/exportData/getDashboard）+ interpretReport + 5 集合 + 多用户隔离（真机验证）。
- AI 解读：interpretReport 云函数（微信 OCR → DeepSeek 结构化 JSON）+ report-result 页四态轮询。
- 待做：AI 解读真机验证、指标确认入库、metric/reminder/interpretation service 接云函数、提醒系统、ECharts、Lottie。

## 产品边界

硬约束：

- 不定位为 AI 医生。
- 不提供疾病诊断、处方、药物剂量或治疗方案。
- AI 输出只用于帮助理解体检报告和管理健康档案。
- 未经用户确认的指标不得进入趋势统计。
- 上传报告进入 AI 解读前必须提示第三方 AI 服务会处理报告内容。

固定免责声明：

> 内容仅用于帮助理解体检报告和管理健康档案，不构成诊断或治疗建议。如指标持续异常或出现不适，请咨询医生。

## 项目结构

```text
IeTecho/
├─ docs/
│  ├─ plans/       # 产品设计、实施计划、平台决策
│  ├─ wireframes/  # 页面原型与状态矩阵
│  ├─ design/      # 组件、视觉系统、动效规范
│  └─ prd-family-health-miniapp-project-management.md
├─ miniprogram/    # 微信小程序工程（P0 静态 Mock + P1/P2 实现）
│  ├─ app.json / app.ts / app.wxss
│  ├─ pages/       # 页面（UI 层）
│  ├─ components/  # 组件（UI 层）
│  ├─ services/    # 数据访问收口层（Service 层）
│  ├─ styles/ models/ data/ utils/
│  └─ config/      # cloud.ts + cloud.local.example.ts（local 不入库）
├─ cloudfunctions/ # 云函数（memberOps/reportOps/exportData/getDashboard/interpretReport）
├─ seed/           # 种子数据（openid 用占位，不入库真实 openid）
├─ Design/         # 高保真设计原型 HTML
├─ Mobile-App/     # OpenDesign 导出产物
├─ project.config.json / tsconfig.json / .gitignore
```

## 如何打开（换电脑必看）

仓库不含私密信息，克隆后需重建两个本地配置文件：

```text
1. miniprogram/config/cloud.local.ts
   从 cloud.local.example.ts 复制，填入云开发环境 ID

2. cloudfunctions/interpretReport/config.json
   从 config.example.json 复制，填入 DeepSeek API key

3. 微信开发者工具打开 E:/Git/ClaudeCode/IeTecho
   project.config.json 的 appid 本地改回真实 AppID（不入库）

4. cloudfunctions/ 每个目录右键 → 创建并部署：云端安装依赖

5. 云开发控制台确认 5 个集合存在、权限为「仅创建者可读写」

6. 编译后应看到底部 Tab：首页 / 家人 / 报告 / 我的
```

## 当前页面

`miniprogram/app.json` 已注册以下页面：

```text
pages/home/index            首页
pages/family/index          家人
pages/reports/index         报告 Tab（跨家人报告列表）
pages/more/index            我的
pages/member-detail/index   成员详情（含底部录入入口）
pages/member-edit/index     添加 / 编辑家人
pages/report-upload/index   报告上传（聊天/相册双入口）
pages/interpreting/index    解读中
pages/report-result/index   报告解读结果（四态轮询）
pages/metric-confirm/index  指标确认
```

## 当前组件

```text
app-button
empty-state
error-state
family-profile-card
health-status-ring
metric-annotation-card
reminder-card
report-summary-card
status-tag
trend-chart-card
```

## Mock 数据

静态数据位于 `miniprogram/data/`：

- `mock-members.ts`：成员数据
- `mock-reports.ts`：报告数据
- `mock-metrics.ts`：指标数据
- `mock-reminders.ts`：提醒数据
- `mock-interpretations.ts`：AI 解读结果和免责声明
- `mock-dashboard.ts`：首页聚合数据
- `mock-scenarios.ts`：场景入口

## 关键文档

建议按以下顺序阅读：

1. `docs/plans/2026-06-17-platform-decision.md` — 平台决策（小程序先行 → iOS），三层分离架构。
2. `docs/prd-family-health-miniapp-project-management.md` — 项目管理 PRD，适合开发交接。
3. `docs/plans/2026-06-12-family-health-miniapp-design.md` — 产品设计总文档。
4. `docs/wireframes/family-health-miniapp-page-prototype.md` — 页面结构和流转。
5. `docs/wireframes/family-health-miniapp-state-matrix.md` — 页面状态覆盖。
6. `docs/design/family-health-miniapp-visual-system.md` — 视觉 token 和设计原则。
7. `docs/design/family-health-miniapp-components.md` — 核心组件规格。
8. `docs/design/family-health-miniapp-motion-spec.md` — 动效边界。
9. `docs/plans/2026-06-12-family-health-miniapp-prototype-implementation.md` — 静态 Mock 转实现计划。

## Git 注意事项

`.gitignore` 已排除（含本地私密配置）：

```text
.agents/
skills-lock.json
project.private.config.json
node_modules/
miniprogram/miniprogram_npm/
miniprogram/config/cloud.local.ts          # 云开发 env ID
cloudfunctions/interpretReport/config.json  # DeepSeek API key
.DS_Store
```

仓库保持 `touristappid`，真实 AppID / env ID / DeepSeek key 均不入库。提交时只纳入项目代码和文档。

## 下一步开发建议

当前首要：**验证 P2 AI 解读**。

```text
报告 Tab → 上传报告 → 选「我」→ 从相册选一张清晰化验单图片
→ 保存 → 自动跳解读页 → 显示「正在解读报告」
→ 等待 10-30 秒 → 出解读结果（摘要/异常指标/建议/复查提醒）
```

验证通过后的后续 P2/P3：

1. 指标确认入库（report-result → metric-confirm 真实写库）。
2. metric/reminder/interpretation service 接云函数（当前仍 mock）。
3. 提醒系统 + 订阅消息。
4. ECharts 趋势图、Lottie 动效。

接入云函数时只替换 `services/` 内部实现，页面和组件不动。三层分离是硬约束。

仍不建议做：多人共享、医生端、社区、药品管理、复杂健康评分。

## Git 注意事项

`.gitignore` 已排除：

```text
.agents/
skills-lock.json
project.private.config.json
node_modules/
miniprogram/miniprogram_npm/
.DS_Store
```

提交时只应纳入项目代码和文档，不提交本地 skill 安装目录和微信开发者工具私有配置。
