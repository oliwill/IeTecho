# IeTecho 项目说明（给 AI Agent）

## 项目定位

IeTecho 是一个家庭健康档案与体检报告解读微信小程序项目。

核心目标：

```text
上传体检报告 / 化验单
→ AI 辅助解读
→ 用户确认关键指标
→ 保存到家人健康档案
→ 首页展示今日重点、趋势和复查提醒
```

## 当前阶段

截至 2026-06-12，项目处于 **P0 静态 Mock 阶段**。

已完成：

- 产品设计文档。
- 页面原型与状态矩阵。
- 组件规格、视觉系统、动效规范。
- qiaomu-ai-prd 风格项目管理 PRD。
- 原生微信小程序静态 Mock 工程。

未完成：

- 微信云开发。
- AI API。
- 真实文件上传。
- OCR。
- ECharts。
- Lottie。
- 订阅消息。
- 登录和真实持久化。

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
├─ app.json              # 页面和 Tab 配置
├─ app.ts                # 小程序入口，静态 Mock 阶段不初始化云开发
├─ app.wxss              # 全局样式入口
├─ pages/                # 页面
├─ components/           # 组件
├─ styles/               # WXSS token、布局、动效
├─ models/               # TypeScript 数据类型
├─ data/                 # mock 数据
└─ utils/                # 路由、状态等工具
```

根配置：

```text
project.config.json      # 微信开发者工具配置，当前 appid 为 touristappid
tsconfig.json            # TypeScript 配置
.gitignore               # 排除本地 skill 和私有配置
```

## 当前页面清单

`miniprogram/app.json` 注册：

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
2. 替换真实小程序 AppID。
3. 启用微信云开发。
4. 实现微信登录和默认「我」。
5. 建立云数据库集合：`members`、`reports`、`metric_records`、`reminders`、`interpretations`。
6. 接入云存储上传报告文件。
7. 实现 AI 解读云函数。
8. 实现指标确认后入库。
9. 实现小程序内提醒管理。

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
2. `docs/prd-family-health-miniapp-project-management.md`
3. `docs/plans/2026-06-12-family-health-miniapp-design.md`
4. `docs/wireframes/family-health-miniapp-page-prototype.md`
5. `docs/wireframes/family-health-miniapp-state-matrix.md`
6. `docs/design/family-health-miniapp-components.md`
7. `docs/design/family-health-miniapp-visual-system.md`
8. `docs/design/family-health-miniapp-motion-spec.md`
9. `docs/plans/2026-06-12-family-health-miniapp-prototype-implementation.md`

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
