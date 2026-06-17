# IeTecho

IeTecho 是一个家庭健康档案与体检报告解读产品，目标是帮助用户看懂体检报告 / 化验单、管理家人健康档案、持续追踪重点指标，并做好复查、复诊和生活方式提醒。

平台策略：微信小程序先行（自用验证与早期产品化），iOS App 后续（完美实现设计语言）。两阶段都真实落地。详见 `docs/plans/2026-06-17-platform-decision.md`。

## 当前阶段

截至 2026-06-17，项目处于 **P0 静态 Mock 阶段**：

- 已完成产品设计、页面原型、状态矩阵、视觉系统、动效规范、PRD 和平台决策。
- 已确认三层分离架构（UI / Service / 后端），数据访问收口到 `miniprogram/services/`。
- 已创建可由微信开发者工具打开的原生微信小程序静态工程。
- 当前不接微信云开发、不接 AI API、不做真实上传、不接 OCR、不接 ECharts、不接 Lottie。

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
├─ miniprogram/    # 微信小程序静态 Mock 工程
│  ├─ app.json
│  ├─ app.ts
│  ├─ app.wxss
│  ├─ pages/       # 页面（UI 层）
│  ├─ components/  # 组件（UI 层）
│  ├─ services/    # 数据访问收口层（Service 层，待建）
│  ├─ styles/
│  ├─ models/
│  ├─ data/
│  └─ utils/
├─ project.config.json
├─ tsconfig.json
└─ .gitignore
```

## 如何打开

1. 打开微信开发者工具。
2. 导入项目目录：`E:/Git/ClaudeCode/IeTecho`。
3. 小程序源码目录：`miniprogram/`。
4. 当前 `project.config.json` 使用 `touristappid`，正式开发前需要替换为实际小程序 AppID。
5. 编译后应看到底部 Tab：`首页 / 家人 / 更多`。

## 当前页面

`miniprogram/app.json` 已注册以下页面：

```text
pages/home/index            首页
pages/family/index          家人
pages/more/index            更多
pages/member-detail/index   成员详情
pages/member-edit/index     添加 / 编辑家人
pages/report-upload/index   报告上传
pages/interpreting/index    解读中
pages/report-result/index   报告解读结果
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

## P0 验收路径

在微信开发者工具中手动验证：

```text
首页
→ 上传报告
→ 解读中
→ 报告解读结果
→ 指标确认
→ 成员详情
```

同时验证：

```text
家人页 → 成员详情
家人页 → 添加 / 编辑家人
首页 → 最近报告 → 报告解读结果
更多页 → 免责声明弹窗
```

## 下一步开发建议

P1 目标：把静态 Mock 变成可持久化的最小可用版本。

建议顺序：

1. 建立 `miniprogram/services/`，把页面读 mock 的逻辑下沉到 service（三层分离前置）。
2. 替换真实小程序 AppID。
3. 启用微信云开发环境。
4. 实现微信登录和默认「我」（预留自有 user id 字段，不依赖 `_openid`）。
5. 建立云数据库集合：`members`、`reports`、`metric_records`、`reminders`、`interpretations`。
6. 接入云存储上传报告文件。
7. 实现 AI 解读云函数（纯 Node，业务逻辑可复用）。
8. 实现指标确认后入库。
9. 实现小程序内提醒管理。
10. 实现 `exportService` 数据导出（iOS 迁移前置）。

接入云开发时只替换 `services/` 内部实现，页面和组件不动。

P1 仍不建议先做：多人共享、医生端、社区、药品管理、复杂健康评分。

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
