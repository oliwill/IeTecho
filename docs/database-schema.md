# 云数据库集合 Schema

IeTecho P1 云开发数据库设计。5 个集合，字段与 `miniprogram/models/*` 数据模型对齐。

## 设计原则

- **平台无关**：不依赖 `_openid` 做唯一用户标识，用自有 `userId` 字段隔离。详见 `docs/plans/2026-06-17-platform-decision.md`。
- **userId 格式**：P1 阶段为 `wx:{openid}`（云函数从 context 解析），iOS 阶段换自有鉴权产出 userId，service 接口不变。
- **时间字段**：统一 ISO 8601 字符串，不用云数据库的 `Date` 类型（平台无关）。
- **id 字段**：业务自生成（如 `member-xxx`），与云数据库 `_id` 并存。导出时移除 `_id`/`_openid`，保留 `id`。

## 集合清单

```text
members           家庭成员
reports           体检/化验/门诊/影像报告
metric_records    指标记录
reminders         复查/复诊/生活提醒
interpretations   AI 解读记录
```

## members

```text
_id              云数据库自动生成
userId           用户标识（隔离用，平台无关）
id               业务 id，如 member-self
name             姓名/昵称
relation         self | father | mother | partner | child | other
relationLabel    关系显示名
gender           male | female | unknown
ageLabel         年龄显示，如 "67 岁"
birthYear        出生年份（可选）
heightCm         身高 cm（可选）
weightKg         体重 kg（可选）
bmi              BMI（可选）
focusTags        关注重点标签数组
medicalHistory   既往病史数组（可选）
allergyHistory   过敏史数组（可选）
avatarType       self | father | mother | partner | child | other
status           empty | stable | attention | followUp | overdue
statusText       状态显示文字
latestReportDate 最近报告日期（可选）
abnormalMetricCount  异常指标数
reminderCount    提醒数
nextAction       下一步行动描述（可选）
createdAt        创建时间 ISO
updatedAt        更新时间 ISO
```

## reports

```text
_id
userId
id                业务 id
memberId          所属成员 id
memberName        所属成员名（冗余，方便列表显示）
reportType        checkup | lab | outpatient | imaging
reportTypeLabel   报告类型显示名
hospital          医院（可选）
department        科室（可选）
reportDate        报告日期
fileType          image | pdf | mock
fileName          文件名（可选）
fileID            云存储文件 ID（P1 接云存储后加，导出时保留引用）
summary           报告摘要
interpretationId  关联解读 id（可选）
interpretationStatus  none | interpreting | interpreted | failed | pendingMetrics | saved
pendingMetricCount    待确认指标数
createdAt
updatedAt
```

## metric_records

```text
_id
userId
id               业务 id
memberId         所属成员
reportId         所属报告
metricName       指标名
metricCode       指标编码
category         分类（血常规/肝功/肾功/血脂/代谢等）
value            数值（number 或 string）
unit             单位
referenceRange   参考范围
status           normal | high | low | warning
statusText       状态显示
isAbnormal       是否异常（布尔，用于趋势和聚合）
measuredAt       测量时间
plainLanguageExplanation  通俗解释（可选）
possibleFactors           可能因素数组（可选）
nextSuggestion            下一步建议（可选）
confirmationState  pending | confirmed | modified | ignored | uncertain
createdAt
updatedAt
```

**硬约束**：`confirmationState` 必须为 `confirmed`/`modified` 才能进入趋势统计。`pending`/`ignored` 不计入。

## reminders

```text
_id
userId
id               业务 id
memberId         所属成员
memberName       成员名（冗余）
relatedReportId  关联报告（可选）
relatedMetricId  关联指标（可选）
type             followUpTest | doctorVisit | lifestyle
typeLabel        类型显示
title            标题
time             触发时间 ISO
displayTime      显示时间
repeatRule       once | daily | weekly
note             备注（可选）
status           today | future | overdue | done | cancelled
subscriptionAuthorized  是否已授权订阅消息
createdAt
updatedAt
```

## interpretations

```text
_id
userId
id               业务 id
memberId         所属成员
reportId         所属报告
createdAt        解读生成时间
riskLevel        low | attention | warning
summary          摘要
abnormalMetricIds  异常指标 id 数组
keyConcerns      重点关注数组
possibleFactors  可能因素数组
lifestyleSuggestions  { diet[], exercise[], sleep?[], habits?[] }
followUpSuggestions   复查建议数组
disclaimer       免责声明
hasViewed        是否已查看
```

**硬约束**：interpretation 是 AI 辅助解释，不是医学结论。`summary`/`keyConcerns` 不得包含诊断结论、处方、药物剂量。

## 权限规则

P1 阶段（云开发控制台设置）：

- 所有集合权限设为「仅创建者可读写」。
- 用户隔离通过 `userId` 字段 + 云函数 where 条件双重保证（云函数绕过前端权限，直接服务端过滤）。

## 索引建议

数据量上来后加索引（P1 初期可不做）：

```text
members:           userId
reports:           userId + reportDate
metric_records:    userId + memberId + measuredAt
reminders:         userId + status + time
interpretations:   userId + reportId
```

## 与现有代码的对应

| 集合 | Model | Service | 云函数 |
|---|---|---|---|
| members | `models/member.ts` | memberService | memberOps |
| reports | `models/report.ts` | reportService | reportOps |
| metric_records | `models/metric.ts` | metricService | reportOps（action=metric.*） |
| reminders | `models/reminder.ts` | reminderService | （P1 第二批） |
| interpretations | `models/interpretation.ts` | interpretationService | （P1 第二批） |

## 创建集合的操作步骤

拿到 env ID 后，在微信开发者工具「云开发控制台」：

```text
1. 数据库 → 新建集合，依次建 5 个：
   members / reports / metric_records / reminders / interpretations
2. 每个集合 → 权限设置 → 改为「仅创建者可读写」
   （注意：云函数用管理权限读写，不受此限制）
3. （可选）导入 mock 数据做联调，见 miniprogram/data/mock-*.ts
```

云函数部署：

```text
cloudfunctions/ 下每个目录右键 → 上传并部署：云端安装依赖
（首次部署会自动 npm install wx-server-sdk）
```
