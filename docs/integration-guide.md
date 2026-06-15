# IeTecho 集成指南

## 当前状态

截至 2026-06-12，IeTecho 只有微信小程序 P0 静态 Mock，没有对外 API、SDK 或后端服务。

因此当前的「集成」仅指：

- 在微信开发者工具中打开小程序工程。
- 基于 mock 数据验证页面流转。
- 为 P1 微信云开发接入做准备。

## 打开小程序工程

```text
项目目录：E:/Git/ClaudeCode/IeTecho
源码目录：miniprogram/
当前 AppID：touristappid
```

操作：

1. 打开微信开发者工具。
2. 导入 `E:/Git/ClaudeCode/IeTecho`。
3. 确认编译无错误。
4. 检查底部 Tab：`首页 / 家人 / 更多`。

## 当前页面入口

```text
/pages/home/index
/pages/family/index
/pages/more/index
/pages/member-detail/index
/pages/member-edit/index
/pages/report-upload/index
/pages/interpreting/index
/pages/report-result/index
/pages/metric-confirm/index
```

## P1 预期后端集成

P1 建议使用微信云开发。

### 云数据库集合

```text
members
reports
metric_records
reminders
interpretations
```

### 云函数

```text
getDashboard       聚合首页数据
interpretReport    调用外部 AI API 生成报告解读
createReminder     创建复查 / 复诊 / 生活提醒
```

### 云存储

用于保存：

```text
体检报告 PDF
化验单图片
门诊记录图片
```

## AI API 集成边界

AI 只允许输出：

```text
报告摘要
异常指标解释
可能影响因素
生活方式建议
复查 / 就医提醒
免责声明
```

AI 禁止输出：

```text
确诊疾病
处方药建议
药物剂量
治疗方案
否定医生建议
治疗效果承诺
```

固定免责声明：

```text
内容仅用于帮助理解体检报告和管理健康档案，不构成诊断或治疗建议。如指标持续异常或出现不适，请咨询医生。
```

## P1 接入待决项

- 真实小程序 AppID。
- 云开发环境 ID。
- AI API 供应商和密钥管理方式。
- OCR 方案。
- 订阅消息模板 ID。
- 数据删除与隐私说明实现。
