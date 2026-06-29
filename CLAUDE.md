# IeTecho 项目说明（给 AI Agent）

## 项目定位

IeTecho 是一个家庭健康档案与体检报告解读产品。

平台策略：微信小程序先行（自用验证与早期产品化），iOS App 后续（完美实现设计语言）。两阶段都真实落地。详见 `docs/plans/2026-06-17-platform-decision.md`。

核心目标：

```text
上传体检报告 / 化验单
→ AI 辅助解读
→ 用户确认关键指标
→ 保存到家人健康档案
→ 首页展示今日重点、趋势和复查提醒
```

## 平台策略与三层分离（架构硬约束）

小程序不是最终形态，iOS 是既定第二阶段。为控制迁移成本，架构强制三层分离：

```text
┌─ UI 层      pages/ + components/        iOS 时重写（必然）
├─ Service 层 services/*.ts               iOS 时换实现，接口不变
└─ 后端层     cloudfunctions/             iOS 时搬到独立后端，Node 逻辑大量复用
```

必须遵守：

- 页面绝不直接调用 `wx.cloud.database()` 或 `wx.cloud.callFunction()`，所有数据访问收口到 `miniprogram/services/`。
- 云函数用纯 Node 写业务逻辑，不耦合微信特有能力。
- 数据模型平台无关，不依赖微信 `_openid` 作唯一用户标识，预留自有 user id 字段。
- 数据迁移用 JSON 导出导入，不做实时同步或账号打通。`exportService` 是 iOS 迁移前置依赖，必须实现。
- 不做 Taro / uni-app 多端方案。两个端分别原生实现。

## 当前阶段

截至 2026-06-29，项目处于 **P2 AI 解读（代码完成，待真机验证）**。

已完成：

- P0 静态 Mock：页面原型、状态矩阵、组件/视觉/动效规范、PRD、原生小程序工程。
- P1 云开发接入：4 云函数（memberOps/reportOps/exportData/getDashboard）、5 集合、多用户隔离（真机验证）、报告上传（聊天/相册 → 云存储）。
- P1 报告上传闭环：reportService.upload、report-upload 双入口、member-detail 录入入口。
- P2 AI 解读：interpretReport 云函数（微信 OCR → DeepSeek 结构化 JSON）、report-result 四态轮询、reportService.interpret。

待完成：

- AI 解读真机验证（上传清晰化验单 → 自动解读）。
- 指标确认入库（metric-confirm 真实写库）。
- metric/reminder/interpretation service 接云函数（当前仍 mock）。
- 提醒系统、订阅消息、ECharts 趋势图、Lottie 动效。

## 本地私密配置（不入库，换电脑需重建）

```text
miniprogram/config/cloud.local.ts              云开发 env ID（从 cloud.local.example.ts 复制）
cloudfunctions/interpretReport/config.json     DeepSeek key + OCR 权限（从 config.example.json 复制）
```

仓库保持 touristappid，真实 AppID 本地保留。这两个文件已在 .gitignore。

## 云函数清单

```text
cloudfunctions/memberOps/         成员增删改查（action: list/get/getFirstUse/create/update/remove）
cloudfunctions/reportOps/         报告+指标+解读（report.* / metric.* / interp.* / trend.*）
cloudfunctions/exportData/        导出平台无关 JSON（iOS 迁移前置）
cloudfunctions/getDashboard/      首页聚合（自动识别 firstUse / multiFamily）
cloudfunctions/interpretReport/   AI 解读（OCR + DeepSeek，key 在 config.json）
```

云函数取 openid 必须用 `cloud.getWXContext()`（不是 context.OPENID，那个为 null）。get 类查询必须先按业务 id 再按 _id。

## 硬约束

必须遵守：

- 不把产品写成 AI 医生。
- 不使用「诊断中」「治疗方案」「处方建议」等表达。
- AI 输出不提供疾病诊断、处方药、药物剂量或治疗承诺。
- 未确认指标不能进入趋势统计。
- 健康状态环不能做成健康分、疾病概率或风险排名。
- 上传报告进入 AI 解读前必须提示第三方 AI 服务会处理报告内容。
- 异常状态用柔和橙红小面积表达，不做大面积红色警报。

固定免责声明：

```text
内容仅用于帮助理解体检报告和管理健康档案，不构成诊断或治疗建议。如指标持续异常或出现不适，请咨询医生。
```

## 技术结构

```text
miniprogram/
├─ app.json              # 页面和 Tab 配置（4 Tab）
├─ app.ts                # 小程序入口，onLaunch 初始化 wx.cloud.init
├─ app.wxss              # 全局样式入口
├─ pages/                # 页面（UI 层）
├─ components/           # 组件（UI 层）
├─ services/             # 数据访问收口层，UI 唯一数据入口（Service 层）
├─ styles/               # WXSS token、布局、动效
├─ models/               # TypeScript 数据类型
├─ data/                 # mock 数据（service 的回退数据源）
├─ config/               # cloud.ts（env 读取）+ cloud.local.example.ts
└─ utils/                # 路由、状态等工具
```

根配置：

```text
project.config.json      # 微信开发者工具配置，appid 为 touristappid（真实不入库）
tsconfig.json            # TypeScript 配置，moduleResolution: node
.gitignore               # 排除 cloud.local.ts / config.json / 私有配置
```

## 当前页面清单

`miniprogram/app.json` 注册：

```text
pages/home/index            首页
pages/family/index          家人
pages/reports/index         报告 Tab（跨家人报告列表）
pages/more/index            我的
pages/member-detail/index   成员详情（含底部录入入口）
pages/member-edit/index     添加 / 编辑家人
pages/report-upload/index   报告上传（聊天/相册双入口，固定底部提交）
pages/interpreting/index    解读中
pages/report-result/index   报告解读结果（四态轮询）
pages/metric-confirm/index  指标确认
```

## 当前组件清单

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

## 设计方向

视觉方向：**温润健康管家**。

关键词：

```text
温润、健康、可信、低压力、长期陪伴、中老年友好
```

视觉记忆点：`family-profile-card` 家人档案卡。

CSS 策略：单一 WXSS token 系统，不引入 Tailwind、CSS Modules、CSS-in-JS。

核心 token 来源：

- `miniprogram/styles/tokens.wxss`
- `docs/design/family-health-miniapp-visual-system.md`
- `docs/design/family-health-miniapp-motion-spec.md`

## 关键数据语义

核心对象：

```text
Member          家庭成员
Report          体检 / 化验 / 门诊 / 影像报告
MetricRecord    指标记录
Reminder        复查 / 复诊 / 生活提醒
Interpretation  AI 解读结果
Dashboard       首页聚合数据
```

数据原则：

- `Member` 是聚合根。
- `Report` 保存原始事实。
- `MetricRecord` 是趋势计算基础，但必须经过用户确认。
- `Reminder` 是行动层，可关联成员、报告和指标。
- `Interpretation` 是 AI 辅助层，不是医学结论。

## 后续实现顺序

P1 建议顺序：

1. 先用微信开发者工具确认静态 Mock 编译通过。
2. 建立 `miniprogram/services/`，把页面读 mock 的逻辑下沉到 service。
3. 替换真实小程序 AppID。
4. 启用微信云开发。
5. 实现微信登录和默认「我」（预留自有 user id 字段）。
6. 建立云数据库集合：`members`、`reports`、`metric_records`、`reminders`、`interpretations`。
7. 接入云存储上传报告文件。
8. 实现 AI 解读云函数（纯 Node，业务逻辑可复用）。
9. 实现指标确认后入库。
10. 实现小程序内提醒管理。
11. 实现 `exportService` 数据导出（iOS 迁移前置）。

不要在 P1 抢先做：

- 多人共享。
- 医生端。
- 社区。
- 药品管理。
- 复杂健康评分。
- 自动 OCR 全量解析。

## 重要文档入口

优先阅读：

1. `README.md`
2. `docs/plans/2026-06-17-platform-decision.md`
3. `docs/architecture.md`
4. `docs/prd-family-health-miniapp-project-management.md`
5. `docs/plans/2026-06-12-family-health-miniapp-design.md`
6. `docs/wireframes/family-health-miniapp-page-prototype.md`
7. `docs/wireframes/family-health-miniapp-state-matrix.md`
8. `docs/design/family-health-miniapp-components.md`
9. `docs/design/family-health-miniapp-visual-system.md`
10. `docs/design/family-health-miniapp-motion-spec.md`
11. `docs/plans/2026-06-12-family-health-miniapp-prototype-implementation.md`

## 提交注意事项

不要提交：

```text
.agents/
skills-lock.json
project.private.config.json
node_modules/
miniprogram/miniprogram_npm/
```

提交前必须检查：

```bash
git status --short
```

只提交与项目代码、docs、README、CLAUDE 相关的变更。
