# IeTecho 交接说明

## 交接时间

2026-06-12

## 当前状态

项目已完成从产品构想到 P0 静态 Mock 的第一轮闭环：

1. 产品定位已确认：家庭体检报告解读与健康指标追踪微信小程序。
2. 信息架构已确认：底部 Tab 为 `首页 / 家人 / 更多`。
3. 页面原型、状态矩阵、组件规格、视觉系统、动效规范已落文档。
4. qiaomu-ai-prd 风格项目管理 PRD 已生成并通过 lint。
5. 原生微信小程序静态 Mock 已创建并推送。

远程仓库：

```text
https://github.com/oliwill/IeTecho
```

关键提交：

```text
956db4d feat: add static miniapp mock and project PRD
62f4ade docs: add family health miniapp design docs
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
docs/plans/2026-06-12-family-health-miniapp-design.md
docs/plans/2026-06-12-family-health-miniapp-prototype-implementation.md
docs/wireframes/family-health-miniapp-page-prototype.md
docs/wireframes/family-health-miniapp-state-matrix.md
docs/design/family-health-miniapp-components.md
docs/design/family-health-miniapp-visual-system.md
docs/design/family-health-miniapp-motion-spec.md
```

### 小程序静态 Mock

```text
project.config.json
tsconfig.json
miniprogram/app.json
miniprogram/app.ts
miniprogram/app.wxss
miniprogram/sitemap.json
miniprogram/pages/**
miniprogram/components/**
miniprogram/styles/**
miniprogram/models/**
miniprogram/data/**
miniprogram/utils/**
```

## 需要严格保持的产品边界

- 不做 AI 医生。
- 不做疾病诊断、处方、药物剂量、治疗方案。
- AI 仅解释报告、整理异常指标、给生活方式和复查建议。
- 指标必须用户确认后才能进入趋势统计。
- 健康状态环只展示关注项数量、提醒数量、趋势变化，不展示健康分。
- 上传报告进入 AI 解读前必须提示第三方 AI 服务会处理报告内容。

## 如何继续开发

### 第一步：打开静态 Mock

1. 打开微信开发者工具。
2. 导入 `E:/Git/ClaudeCode/IeTecho`。
3. 确认源码目录为 `miniprogram/`。
4. 使用测试 AppID 或替换为真实小程序 AppID。
5. 编译并检查底部 Tab：`首页 / 家人 / 更多`。

### 第二步：验证 P0 路径

```text
首页
→ 上传报告
→ 解读中
→ 报告解读结果
→ 指标确认
→ 成员详情
```

补充路径：

```text
家人页 → 成员详情
家人页 → 添加 / 编辑家人
首页 → 最近报告 → 报告解读结果
更多页 → 免责声明弹窗
```

### 第三步：进入 P1

P1 目标是把静态 Mock 变成可持久化的最小可用版本。

建议顺序：

1. 替换真实小程序 AppID。
2. 启用微信云开发环境。
3. 实现微信登录和默认「我」。
4. 建立云数据库集合：`members`、`reports`、`metric_records`、`reminders`、`interpretations`。
5. 接入云存储上传报告文件。
6. 实现 AI 解读云函数。
7. 实现指标确认后入库。
8. 实现小程序内提醒管理。

## 当前未解决问题

- 真实小程序 AppID 未配置，当前 `project.config.json` 使用 `touristappid`。
- 云开发环境 ID 未创建。
- AI API 供应商未最终确认；开发前需根据当期价格、稳定性和政策选择 DeepSeek / 通义千问 / GLM 或其他方案。
- OCR 方案未确定，P0 不实现。
- 微信订阅消息模板 ID 和审核结果未知。
- 真实医学指标知识库来源和维护策略未定。

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
