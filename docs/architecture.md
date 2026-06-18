# IeTecho 架构说明

## 当前架构阶段

截至 2026-06-12，IeTecho 处于 P0 静态 Mock 阶段。

当前架构只包含：

```text
微信小程序前端静态工程
+-- 页面
+-- 组件
+-- WXSS token
+-- TypeScript 数据类型
+-- mock 数据
```

尚未包含：

```text
微信云开发
云数据库
云存储
云函数
AI API
OCR
ECharts
Lottie
订阅消息
```

## P0 静态 Mock 架构

```text
+--------------------------------------------------+
| project.config.json                              |
| 微信开发者工具项目配置，当前 appid 为 touristappid |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
| miniprogram/app.json                             |
| 页面注册、窗口样式、底部 Tab：首页 / 家人 / 报告 / 我的   |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
| pages/                                          |
| home / family / more / member-detail / upload   |
| interpreting / report-result / metric-confirm   |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
| components/                                     |
| 家人档案卡、报告卡、指标批注卡、提醒卡、状态标签   |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
| data/ + models/                                 |
| mock 成员、报告、指标、提醒、解读和 TypeScript 类型 |
+--------------------------------------------------+
```

## 目录职责

```text
miniprogram/pages/       页面和页面级状态
miniprogram/components/  可复用 UI 组件
miniprogram/services/    数据访问收口层，UI 唯一数据入口
miniprogram/styles/      视觉 token、布局、动效
miniprogram/models/      TypeScript 数据类型
miniprogram/data/        静态 mock 数据
miniprogram/utils/       路由、状态、日期工具
```

## 平台策略与三层分离

平台决策见 `docs/plans/2026-06-17-platform-decision.md`：微信小程序先行（自用验证与早期产品化），iOS App 后续（完美实现设计语言）。两阶段都真实落地，小程序不是最终形态。

为控制 iOS 迁移成本，架构强制三层分离：

```text
┌─ UI 层      pages/ + components/        iOS 时重写（必然）
├─ Service 层 services/*.ts               iOS 时换实现，接口不变
└─ 后端层     cloudfunctions/             iOS 时搬到独立后端，Node 逻辑大量复用
```

Service 层接口（页面只调这些，不感知数据来自云函数还是 mock）：

```text
memberService.list()                    取家人列表
memberService.get(id)                   取单个成员
memberService.create(input)             创建成员
reportService.upload(file, memberId)    上传报告
reportService.interpret(reportId)       触发解读
metricService.confirm(recordId)         确认指标
reminderService.create(input)           创建提醒
dashboardService.get()                  取首页聚合
exportService.exportAll()               导出全部档案（iOS 迁移前置）
```

## 页面路由

```text
pages/home/index            首页：家庭健康总览
pages/family/index          家人：成员档案入口
pages/more/index            更多：设置、隐私、免责声明
pages/member-detail/index   成员详情：单个成员健康档案中心
pages/member-edit/index     添加 / 编辑家人
pages/report-upload/index   报告上传
pages/interpreting/index    解读中
pages/report-result/index   报告解读结果
pages/metric-confirm/index  指标确认
```

## 核心组件

```text
family-profile-card      家人档案卡，当前视觉记忆点
report-summary-card      报告摘要和解读状态
metric-annotation-card   指标批注卡，解释异常指标
reminder-card            复查 / 复诊 / 生活提醒
health-status-ring       关注项聚合，不是健康评分
trend-chart-card         静态趋势摘要，P2 再替换为 ECharts
status-tag               统一状态标签
app-button               主按钮 / 次按钮封装
empty-state              空态
error-state              错误态
```

## 数据模型

核心对象：

```text
Member          家庭成员
Report          体检 / 化验 / 门诊 / 影像报告
MetricRecord    指标记录
Reminder        复查 / 复诊 / 生活提醒
Interpretation  AI 解读结果
Dashboard       首页聚合数据
```

数据语义：

- `Member` 是聚合根。
- `Report` 保存原始事实。
- `MetricRecord` 用于趋势计算，但必须经过用户确认。
- `Reminder` 关联成员，也可关联报告和指标。
- `Interpretation` 是 AI 辅助解释，不是医学结论。

## P1 目标架构

```text
+--------------------------------------------------+
| 微信小程序前端                                    |
| 页面、组件、用户确认、提醒入口                    |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
| 微信云开发 CloudBase                              |
| 登录、云数据库、云存储、云函数、订阅消息            |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
| 外部 AI API                                       |
| 报告解读和结构化建议，不提供诊断或治疗              |
+--------------------------------------------------+
```

P1 云数据库集合建议：

```text
members
reports
metric_records
reminders
interpretations
```

P1 云函数建议：

```text
getDashboard       聚合首页数据
interpretReport    调用外部 AI API 生成报告解读
createReminder     创建复查 / 复诊 / 生活提醒
memberOps          成员增删改查
reportOps          报告与指标增删改查
exportData         导出全部档案为 JSON（iOS 迁移前置依赖）
```

云函数必须用纯 Node 编写业务逻辑，不依赖微信特有能力，以便 iOS 阶段搬到独立后端复用。

## 数据导出（iOS 迁移策略）

小程序为单人自用，不做跨平台实时同步或账号打通。迁移用导出与导入解决：

```text
小程序：exportService.exportAll() 导出全部档案为平台无关 JSON
iOS：   导入该 JSON，重建档案
```

导出格式：单一 JSON 文件 + 报告原始文件压缩包，结构平台无关。这是明确设计决策，导出能力必须在小程序阶段实现。详见平台决策文档第 5 节。

## 架构硬约束

- AI 生成内容不得作为医学事实直接入库。
- 指标进入趋势统计前必须由用户确认。
- 原始报告和 AI 解读记录要可追溯。
- 健康状态环不得计算健康分、疾病概率或风险排名。
- 提醒不能依赖微信订阅消息作为唯一渠道，小程序内提醒必须可见。
- 页面绝不直接调用 `wx.cloud.database()` 或 `wx.cloud.callFunction()`，所有数据访问必须收口到 `miniprogram/services/`。
- 数据模型平台无关，不依赖微信 `_openid` 作为唯一用户标识，预留自有 user id 字段。
- 云函数用纯 Node 写业务逻辑，不耦合微信特有能力。

## 可替换技术原则

平台路线：微信小程序先行 → iOS App 后续（见 `docs/plans/2026-06-17-platform-decision.md`）。

推荐默认：原生微信小程序 + TypeScript + WXSS token + 微信云开发。

迁移路径已规划：

- iOS 阶段 UI 用 SwiftUI 完全重写，复用数据模型语义，不复用代码。
- iOS 阶段后端可从云函数 Node 逻辑搬到独立后端复用。
- 小程序到 iOS 的数据迁移通过 JSON 导出导入完成，不做实时同步。
- 数据访问层因三层分离，iOS 时 service 接口不变，只换内部实现。

不做：

- 不做 Taro 或 uni-app 多端方案。只为小程序和 iOS 两个端，跨端框架对设计细节和动效控制力不足，违背 iOS 完美实现设计语言的初衷。两个端分别原生实现。

不可变：

- 4 Tab 信息架构。
- 成员、报告、指标、提醒的数据语义。
- 用户确认指标后入库。
- AI 非诊断边界。
- 三层分离，数据访问收口到 services 层。
