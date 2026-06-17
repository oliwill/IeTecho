# 家庭健康小程序页面原型转实现计划

## 1. 目标

本计划用于把已完成的页面原型、状态矩阵、组件规格、视觉系统和动效规范转化为后续微信小程序开发任务。

当前阶段仍不直接创建小程序工程代码。进入开发前，应先确认小程序 AppID、云开发环境、技术栈细节和第三方组件接入策略。

## 2. 输入文档

后续实现必须参考以下文档：

```text
docs/plans/2026-06-12-family-health-miniapp-design.md
docs/wireframes/family-health-miniapp-page-prototype.md
docs/wireframes/family-health-miniapp-state-matrix.md
docs/design/family-health-miniapp-components.md
docs/design/family-health-miniapp-visual-system.md
docs/design/family-health-miniapp-motion-spec.md
```

## 3. 推荐项目结构

MVP 阶段建议保持简单：

```text
IeTecho/
├─ docs/
│  ├─ plans/
│  ├─ wireframes/
│  └─ design/
├─ miniprogram/
│  ├─ app.json
│  ├─ app.ts
│  ├─ app.wxss
│  ├─ pages/
│  ├─ components/
│  ├─ styles/
│  ├─ utils/
│  ├─ services/
│  └─ assets/
└─ cloudfunctions/
   ├─ interpretReport/
   ├─ createReminder/
   └─ getDashboard/
```

不要一开始做复杂 monorepo。除非后续同时做 H5、管理后台或多端复用，再考虑 `apps/wechat-miniapp/` 结构。

`miniprogram/services/` 不是可选项，是三层分离架构硬约束。所有数据访问必须收口到 service 层，页面不直接接触云开发或 mock 数据。详见 `docs/plans/2026-06-17-platform-decision.md` 和 `docs/architecture.md`。

## 4. 开发前必须确认

| 项目 | 决策 |
|---|---|
| 小程序 AppID | 待确认 |
| 云开发环境 ID | 待确认 |
| 是否使用 TypeScript | 建议使用 |
| 是否使用 SCSS | 可选，MVP 可先 WXSS token |
| UI 组件库 | 自定义为主，TDesign / Vant 只做 Picker、Dialog、Toast |
| 图表库 | ECharts for Weixin，Phase 3 接入 |
| Lottie | Phase 2 后再接入，不作为首屏依赖 |
| AI API | DeepSeek / 通义千问 / GLM，开发前重新查价格与政策 |

## 5. 设计 Token 落地任务

创建：

```text
miniprogram/styles/tokens.wxss
miniprogram/styles/theme.wxss
miniprogram/styles/global.wxss
```

### 5.1 tokens.wxss

包含：

```text
--color-*
--font-*
--space-*
--radius-*
--shadow-*
--duration-*
--ease-*
```

来源：`docs/design/family-health-miniapp-visual-system.md` 与 `docs/design/family-health-miniapp-motion-spec.md`。

### 5.2 global.wxss

包含：

- 页面背景。
- 全局字体。
- 按钮基础点击区域。
- 安全区处理。
- 通用文本层级。

## 6. 组件实现顺序

建议先做基础组件，再做业务组件。

### 6.1 基础组件

```text
1. StatusTag
2. PrimaryButton / SecondaryButton / TextButton
3. EmptyState
4. ErrorState
5. BottomTab 或原生 tabBar 配置
```

### 6.2 业务组件

```text
1. FamilyProfileCard
2. ReportSummaryCard
3. MetricAnnotationCard
4. ReminderCard
5. TrendChartCard
6. HealthStatusRing
```

优先级：

```text
FamilyProfileCard > MetricAnnotationCard > ReportSummaryCard > ReminderCard > TrendChartCard > HealthStatusRing
```

原因：家人档案卡是视觉记忆点；指标批注卡承载报告解读核心价值；健康状态环容易过度设计，应晚一点实现。

## 7. 页面实现顺序

### Phase 1：静态页面与 Mock 数据

目标：不接后端，先跑通视觉和页面流转。

```text
1. 初始化小程序工程
2. 配置 3 Tab：首页 / 家人 / 更多
3. 建立全局视觉 token
4. 准备 mock 数据
5. 建立 services/ 层，mock 数据作为临时数据源收口到 service
6. 页面改为调用 service，不直接读 data/
7. 首页静态 mock
8. 家人页静态 mock
9. 成员详情静态 mock
10. 报告上传静态页
11. 解读中静态状态
12. 报告解读结果静态页
13. 指标确认静态页
14. 更多页静态页
```

第 5、6 步是三层分离的前置工作。静态 Mock 阶段就建立 service 层，确保后续接云函数时只改 service 内部实现，页面不动。

### Phase 2：本地交互闭环

目标：不用云开发，也能模拟完整用户路径。

```text
1. 首次使用状态切换
2. 添加 / 编辑家人 mock
3. 上传报告 mock
4. 解读状态 mock
5. 指标确认编辑 mock
6. 保存后刷新成员详情和首页 mock
7. 错误态和空态切换
```

### Phase 3：云开发接入

目标：持久化数据。

接入时只替换 `services/` 内部实现，页面和组件不动。

```text
1. 微信登录（预留自有 user id 字段，不依赖 _openid 做唯一标识）
2. 默认创建「我」
3. 云数据库集合：members
4. 云数据库集合：reports
5. 云数据库集合：metric_records
6. 云数据库集合：reminders
7. 云数据库集合：interpretations
8. 云存储上传报告文件
9. 首页 getDashboard 云函数（纯 Node）
```

云函数坚持纯 Node 写业务逻辑，不耦合微信特有能力，为 iOS 阶段复用做准备。

### Phase 4：AI 解读接入

目标：报告解读可用。

```text
1. interpretReport 云函数
2. 外部 AI API 调用
3. 结构化 Prompt 模板
4. 免责声明注入
5. 解读结果保存
6. 解读失败和超时兜底
```

### Phase 5：趋势和提醒

目标：形成长期使用价值。

```text
1. 指标趋势详情页
2. ECharts for Weixin 接入
3. 复查 / 复诊提醒
4. 日常习惯提醒
5. 订阅消息授权提示
6. 更多页提醒管理
```

### Phase 6：动效和质感打磨

目标：符合「温润健康管家」方向。

```text
1. 档案卡浮入
2. 指标批注点亮
3. 状态环展开
4. 按钮点击反馈
5. reduced-motion 等价降级
6. 必要时接入 Lottie
```

## 8. Mock 数据准备

至少准备以下场景：

### 8.1 首次使用

```text
默认成员：我
无基础档案
无报告
无提醒
```

### 8.2 只有我的档案

```text
我
最近报告：2026-06-01
重点关注：尿酸、血脂
1 个复查提醒
```

### 8.3 多家人

```text
父亲：血压关注中，3 天后复诊
母亲：血糖稳定，未来 7 天复查
我：尿酸偏高，待复查
```

### 8.4 报告解读

```text
报告：2026-06-01 体检报告
异常指标：尿酸 468 μmol/L，LDL-C 3.72 mmol/L
状态：已解读，待确认 2 个指标
```

### 8.5 错误与边界

```text
上传失败
解读失败
指标保存失败
趋势数据不足
订阅消息未授权
网络错误
```

## 9. 数据集合草案

后续可在云数据库中创建：

```text
members
reports
metric_records
reminders
interpretations
```

详细字段以产品设计文档为准：

- `docs/plans/2026-06-12-family-health-miniapp-design.md`

## 10. AI Prompt 准备任务

后续需要单独创建 Prompt 模板文档或云函数内模板。

AI 解读输出固定结构：

```text
1. 报告摘要
2. 异常指标
3. 重点关注
4. 可能影响因素
5. 生活方式建议
6. 复查 / 就医提醒
7. 免责声明
```

必须禁止：

```text
确诊疾病
推荐处方药
调整药物剂量
否定医生建议
承诺治疗效果
替代线下检查
```

固定免责声明：

```text
内容仅用于帮助理解体检报告和管理健康档案，不构成诊断或治疗建议。如指标持续异常或出现不适，请咨询医生。
```

## 11. 合规与隐私实现任务

开发时必须实现或预留：

```text
1. AI 调用前提示第三方模型服务会处理报告内容
2. 隐私说明页
3. 免责声明页
4. 删除报告能力
5. 删除指标能力
6. 删除成员档案能力
7. 不做公开分享
8. 不默认上传通讯录
```

## 12. 验收标准

### 12.1 主流程验收

用户可以完成：

```text
首次进入
→ 上传我的体检报告
→ 查看 AI 解读
→ 确认关键指标
→ 保存到健康档案
→ 首页看到今日重点
→ 成员详情查看趋势与提醒
```

### 12.2 页面状态验收

必须覆盖：

- 首次使用。
- 已有档案。
- 多家人。
- 上传中 / 上传失败。
- 解读中 / 解读失败 / 解读超时。
- 待确认指标。
- 空态。
- 错误态。
- 数据不足。
- 订阅消息未授权。

### 12.3 视觉验收

- 首屏能看出这是家庭健康档案产品。
- 家人档案卡是最强视觉记忆点。
- 字号和点击区域适合中老年用户。
- 不出现 AI 科技蓝紫渐变。
- 不出现医疗恐吓式大红警报。

### 12.4 动效验收

- 档案卡浮入、指标批注点亮、状态环展开都有实现边界。
- 动效不依赖复杂库。
- 关键信息在无动效时仍可理解。
- Lottie 不是首屏核心依赖。

## 13. 建议的第一轮开发范围

如果进入代码实现，第一轮只做：

```text
1. 小程序工程初始化
2. 3 Tab 页面壳
3. 视觉 token
4. mock 数据
5. 首页静态 mock
6. 家人页静态 mock
7. 成员详情静态 mock
8. 报告上传静态页
9. 报告解读结果静态页
10. 指标确认静态页
```

暂不做：

```text
云开发
AI API
ECharts
Lottie
订阅消息
真实上传
```

这样可以先验证页面结构和设计质感，再接入后端能力。
