# 平台决策：微信小程序先行，iOS 后续

日期：2026-06-17
状态：已确认
决策人：产品负责人

## 1. 决策结论

IeTecho 采用两阶段平台策略：

```text
第一阶段：微信小程序，用于自用验证和早期产品化。
第二阶段：iOS App，用于完美实现设计语言和长期产品形态。
```

两个阶段都会真实落地。小程序不是最终形态，iOS 不是可选项。

## 2. 为什么是这个结论

### 2.1 产品目标链

```text
先自用验证
→ 再做成产品给更多人使用
```

这要求同一套方案在两个阶段都占优：验证阶段要快，产品化阶段要能获客。

### 2.2 小程序为什么是第一阶段

- 一个人开发，两周能跑通主链路，验证阶段最怕慢。
- 目标用户是家庭，含中老年。小程序群里发链接即用，App Store 下载注册授权的转化率对中老年接近于零。
- 微信云开发免费额度内能跑起来，零运维，不需要域名备案和独立后端。

### 2.3 iOS 为什么是第二阶段

- 部分设计语言只能在 iOS 上完美实现，这是明确的个人偏好和产品要求。
- iOS 版本不是为了覆盖更多用户，而是为了实现小程序做不到的视觉与交互质感。

## 3. 这个决策对当前小程序架构的影响

两阶段策略把「小程序」从最终方案降级为第一阶段。如果小程序完全绑死微信云开发，iOS 阶段后端和业务逻辑几乎要从零重写。

为控制迁移成本，小程序阶段采用三层分离架构，UI 层重写是必然且可接受的，但数据访问层和后端层要做到可复用。

## 4. 三层分离架构原则

```text
┌─ UI 层      小程序页面 + 组件           iOS 时重写（必然）
├─ Service 层 services/*.ts               iOS 时换实现，接口不变
└─ 后端层     云函数                       iOS 时搬到独立后端，Node 逻辑大量复用
```

### 4.1 硬约束

约束一：小程序页面绝不直接调用 `wx.cloud.database()` 或 `wx.cloud.callFunction()`。所有数据访问必须收口到 `miniprogram/services/` 下的 service 函数。

约束二：云函数用纯 Node 编写业务逻辑，不依赖微信特有能力。AI 调用、数据校验、Prompt 模板全部放在云函数内。

约束三：数据模型设计成平台无关。不依赖微信 `_openid` 作为唯一用户标识，预留自有 user id 字段，方便 iOS 阶段复用同一套数据语义。

### 4.2 Service 层接口示例

页面只调用 service，不感知数据来源是云函数还是独立后端。

```text
memberService.list()                    取家人列表
memberService.get(id)                   取单个成员
memberService.create(input)             创建成员
reportService.upload(file, memberId)    上传报告
reportService.interpret(reportId)       触发解读
metricService.confirm(recordId)         确认指标
reminderService.create(input)           创建提醒
dashboardService.get()                  取首页聚合
```

iOS 阶段这些接口签名保持不变，只替换内部实现：从调用云函数改为调用独立后端 HTTP API。

## 5. 数据迁移策略：导出与导入

### 5.1 策略

小程序阶段是单人自用，不需要做跨平台实时同步、账号打通或独立后端。数据迁移用导出与导入解决。

```text
小程序：支持把全部档案导出为结构化文件
iOS：   支持导入该文件，重建档案
```

### 5.2 导出格式

采用单一 JSON 文件，包含全部成员、报告、指标、提醒、解读记录。文件结构平台无关，小程序和 iOS 都能读写。

```text
ietecho-export-{日期}.json
├─ meta        版本号、导出时间、来源平台
├─ members     全部成员
├─ reports     全部报告（含原始文件引用）
├─ metrics     全部已确认指标
├─ reminders   全部提醒
└─ interpretations 全部 AI 解读记录
```

报告原始文件（图片、PDF）单独导出为压缩包，JSON 内只保留文件名引用。

### 5.3 为什么不做更复杂的迁移

- 单人自用，数据量小，JSON 文件足够。
- 不需要实时同步，一次性导入即可。
- 不引入账号体系打通、OAuth、独立后端等复杂度。
- iOS 启动时用户只需要点一次「从微信小程序导入」。

这是明确的设计决策，不是临时补丁。导出能力必须在小程序阶段就实现，作为 iOS 迁移的前置依赖。

## 6. 各层职责划分

### 6.1 UI 层

包含：

```text
miniprogram/pages/       页面
miniprogram/components/  组件
miniprogram/styles/      样式
```

职责：渲染数据、处理交互、调用 service。不直接接触云开发 SDK。

iOS 阶段：完全重写为 SwiftUI，复用数据模型语义和设计规范，不复用代码。

### 6.2 Service 层

包含：

```text
miniprogram/services/
├─ memberService.ts
├─ reportService.ts
├─ metricService.ts
├─ reminderService.ts
├─ interpretationService.ts
├─ dashboardService.ts
└─ exportService.ts
```

职责：封装所有数据访问，向 UI 层提供平台无关接口。内部调用云函数或本地 mock，对 UI 层透明。

iOS 阶段：接口签名不变，内部实现从「调云函数」改为「调独立后端 API」。

### 6.3 后端层

包含：

```text
cloudfunctions/
├─ interpretReport/
├─ createReminder/
├─ getDashboard/
├─ memberOps/
├─ reportOps/
└─ exportData/
```

职责：业务逻辑、数据持久化、AI 调用、Prompt 管理。纯 Node 实现，不耦合微信特有能力。

iOS 阶段：Node 逻辑搬到独立后端（FastAPI 或 Node 服务），云数据库数据通过导出文件迁移，云函数逻辑大量复用。

## 7. 当前小程序需要调整的点

当前 P0 静态 Mock 已完成页面和组件，但尚未建立 service 层。P1 进入云开发前必须先做以下调整：

```text
1. 创建 miniprogram/services/ 目录
2. 定义每个 service 的 TypeScript 接口
3. 页面改为调用 service，而非直接读 data/ mock
4. mock 数据下沉到 service 内部实现，作为临时数据源
5. P1 接云函数时，只改 service 内部实现，页面不动
```

这一步不引入云开发，只是把数据访问收口，为未来换实现留接口。

## 8. iOS 阶段启动前提

启动 iOS 开发前，小程序必须满足：

```text
1. service 层接口稳定，至少覆盖核心流程
2. 数据导出功能可用，JSON 格式稳定
3. 主流程已自用验证通过
4. 数据模型语义稳定，不再频繁变动
```

不满足这些前提，不要启动 iOS，否则两个端会同时返工。

## 9. 不做的事

```text
不做小程序与 iOS 实时数据同步
不做统一账号体系
不为迁移搭独立后端
不做 Taro 或 uni-app 多端方案（只为两个端，不值得跨端框架成本）
```

多端框架（Taro、uni-app）看起来能复用代码，但它们对设计细节和动效的控制力不如原生，违背「iOS 完美实现设计语言」的初衷。两个端分别原生实现，靠数据导出导入打通。

## 10. 最脆弱的假设

> 本计划假设：云函数的 Node 业务逻辑能低成本搬到独立后端。

成立条件：云函数坚持纯 Node 写业务，不依赖微信特有能力。

如果不成立：iOS 阶段后端部分重写成本上升，但 UI 重写本就是计划内的，整体方向不变，只是后端要多花时间。这个风险可接受，因为自用验证阶段用户量小，迁移窗口在产品化之前，风险可控。

## 11. 与现有文档的关系

本决策文档优先级高于以下文档中与之冲突的部分：

- `docs/architecture.md`：补充三层分离与 services 层。
- `docs/plans/2026-06-12-family-health-miniapp-prototype-implementation.md`：第 3 节项目结构中的 `services/` 目录从建议升级为硬约束。
- `CLAUDE.md`：补充平台策略和三层分离约束。

后续实现以本文档为准。
