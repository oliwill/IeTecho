# IeTecho 交接说明

## 交接时间

2026-06-29

## 当前状态

项目已推进到 **P2 AI 解读（代码完成，待真机验证）**：

1. 产品定位已确认：家庭体检报告解读与健康指标追踪产品。
2. 平台策略已确认：微信小程序先行（自用验证），iOS App 后续（完美实现设计语言）。见 `docs/plans/2026-06-17-platform-decision.md`。
3. 信息架构已确认：底部 Tab 为 `首页 / 家人 / 报告 / 我的`（2026-06-18 由 3 Tab 调整，配色由青绿改深绿）。
4. 架构原则已确认：三层分离（UI / Service / 后端），数据访问收口到 `miniprogram/services/`，数据迁移用 JSON 导出导入。
5. P0 静态 Mock ✅、P1 云开发接入 ✅、P1 报告上传 ✅、P2 AI 解读代码 ✅。
6. 微信云开发：4 云函数（memberOps/reportOps/exportData/getDashboard/interpretReport）+ 5 集合 + 多用户隔离（真机验证）+ 报告上传（云存储）。
7. AI 解读：interpretReport 云函数（微信 OCR → DeepSeek 结构化 JSON）+ report-result 页四态轮询。真机验证待做。

远程仓库：

```text
https://github.com/oliwill/IeTecho
```

关键提交：

```text
7e19064 feat(p2): AI report interpretation with OCR and DeepSeek
7d00a1d feat(p1): report upload flow with cloud storage and bug fixes
22816cc fix(p1): use cloud.getWXContext() for openid and add seed data
44ec109 feat(p1): integrate cloud functions with three-layer separation
```

## 已完成文件

### 项目入口

```text
README.md
CLAUDE.md
docs/handoff.md
```

### 产品与设计文档

```text
docs/prd-family-health-miniapp-project-management.md
docs/plans/2026-06-17-platform-decision.md
docs/plans/2026-06-12-family-health-miniapp-design.md
docs/plans/2026-06-12-family-health-miniapp-prototype-implementation.md
docs/wireframes/family-health-miniapp-page-prototype.md
docs/wireframes/family-health-miniapp-state-matrix.md
docs/design/family-health-miniapp-components.md
docs/design/family-health-miniapp-visual-system.md
docs/design/family-health-miniapp-motion-spec.md
```

### 小程序静态 Mock + P1/P2 实现

```text
project.config.json
tsconfig.json
miniprogram/app.json
miniprogram/app.ts          # 已初始化 wx.cloud.init
miniprogram/app.wxss
miniprogram/sitemap.json
miniprogram/pages/**        # 含 reports Tab、report-result 四态轮询
miniprogram/components/**
miniprogram/services/**     # 三层分离，数据访问收口层
miniprogram/styles/**
miniprogram/models/**
miniprogram/data/**
miniprogram/utils/**
miniprogram/config/         # cloud.ts + cloud.local.example.ts（local 不入库）
```

### 云函数（P1/P2）

```text
cloudfunctions/memberOps/         成员增删改查
cloudfunctions/reportOps/         报告+指标+解读查询（report.* / metric.* / interp.*）
cloudfunctions/exportData/        导出平台无关 JSON（iOS 迁移前置）
cloudfunctions/getDashboard/      首页聚合
cloudfunctions/interpretReport/   AI 解读（OCR + DeepSeek，config.json 不入库）
```

## 需要严格保持的产品边界

- 不做 AI 医生。
- 不做疾病诊断、处方、药物剂量、治疗方案。
- AI 仅解释报告、整理异常指标、给生活方式和复查建议。
- 指标必须用户确认后才能进入趋势统计。
- 健康状态环只展示关注项数量、提醒数量、趋势变化，不展示健康分。
- 上传报告进入 AI 解读前必须提示第三方 AI 服务会处理报告内容。

## 如何继续开发

### 第一步：恢复本地私密配置（换电脑必做）

仓库不含私密信息，克隆后需重建两个文件：

```text
1. miniprogram/config/cloud.local.ts
   从 cloud.local.example.ts 复制，填入云开发环境 ID（env ID）

2. cloudfunctions/interpretReport/config.json
   从 config.example.json 复制，填入 DeepSeek API key
   （含 OCR 权限声明，部署时生效）
```

### 第二步：打开并部署

```text
1. 微信开发者工具打开 E:/Git/ClaudeCode/IeTecho
2. project.config.json 的 appid 本地改回真实 AppID（不入库）
3. cloudfunctions/ 每个目录右键 → 创建并部署：云端安装依赖
4. 云开发控制台确认 5 个集合存在、权限为「仅创建者可读写」
```

### 第三步：验证 P2 AI 解读（当前首要）

```text
报告 Tab → 上传报告 → 选「我」→ 从相册选一张清晰化验单图片
→ 保存 → 自动跳解读页 → 显示「正在解读报告」（呼吸动画）
→ 等待 10-30 秒 → 出解读结果（摘要/异常指标/建议/复查提醒）
```

解读失败时看 `interpretReport` 云函数日志排查（OCR 权限 / DeepSeek key / 图片质量）。

### 后续 P2/P3

- 指标确认入库（report-result → metric-confirm 真实写库）
- metric/reminder/interpretation service 接云函数
- 提醒系统 + 订阅消息
- ECharts 趋势图、Lottie 动效

接入云函数时只替换 `services/` 内部实现，页面和组件不动。三层分离是硬约束，详见 `docs/architecture.md`。

## 当前未解决问题

- 真实小程序 AppID 本地已配置（`wxfdce860c1207af5a`），但仓库 `project.config.json` 保持 touristappid（不入库策略）。
- **DeepSeek API key 与云开发 env ID 已配在本地不入库文件**（`cloudfunctions/interpretReport/config.json`、`miniprogram/config/cloud.local.ts`），换电脑需重建，见文末。
- AI 解读真机验证待做：需上传一份清晰化验单图片，确认 OCR + DeepSeek 全链路。
- OCR 方案已定为微信云开发 OCR（`cloud.openapi.ocr.printText`），准确率依赖图片质量，复杂体检大表可能识别差。
- metric/reminder/interpretation 三个 service 仍走 mock（标记 P1 第二批），主链路 member/report/dashboard/export 已接云函数。
- 指标确认入库（解读结果页「确认关键指标并保存」按钮逻辑）未实现。
- 提醒系统创建与管理、订阅消息、ECharts 趋势图、Lottie 动效均未做。
- 微信订阅消息模板 ID 和审核结果未知。

## 提交与同步要求

提交前检查：

```bash
git status --short
```

不要提交：

```text
.agents/
skills-lock.json
project.private.config.json
node_modules/
miniprogram/miniprogram_npm/
```

项目阶段性变更后，应同步：

- `README.md`
- `CLAUDE.md`
- `docs/handoff.md`
- 相关 `docs/` 设计或计划文档
- 如有跨会话重要事实，更新 Claude memory
