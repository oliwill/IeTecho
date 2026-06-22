# P1 云开发联调清单

用途：云函数 + service 层接入后的真机验证。按顺序做，每步验证再下一步。

前提：env ID 已按 `miniprogram/config/cloud.local.example.ts` 说明配置到本地 `cloud.local.ts`，app.ts 已初始化云开发。

## 一、建数据库集合（必做）

云开发控制台 → 数据库 → 新建集合，依次建 5 个：

```text
members
reports
metric_records
reminders
interpretations
```

每个集合 → 权限设置 → 改为「仅创建者可读写」。

> 注意：云函数用管理权限读写，不受这个前端权限限制。这个权限只管前端直连，但我们走云函数，所以更安全。

## 二、部署云函数（必做）

微信开发者工具 → 左侧文件树 → `cloudfunctions/` 下每个目录 → **右键 → 上传并部署：云端安装依赖**。

需要部署 4 个：

```text
cloudfunctions/memberOps
cloudfunctions/reportOps
cloudfunctions/exportData
cloudfunctions/getDashboard
```

首次部署会自动 `npm install wx-server-sdk`，每个约 30 秒。部署成功后在云开发控制台「云函数」能看到。

## 三、导入种子数据（可选，推荐）

为了让首页/家人页/报告页有数据展示，把 mock 数据导入云数据库。两种方式：

**方式 A（推荐）：直接用控制台导入**

每个集合 → 导入记录。把 `miniprogram/data/mock-*.ts` 里的数组转成 JSON 数组导入。注意：
- 文件格式选「JSON 数组」
- 每条记录需要带 `userId` 字段，值填 `wx:你的openid`（看下一条怎么拿 openid）

**方式 B：跳过导入，直接看云函数空返回**

不导入数据也能验证云函数链路通不通，只是页面会是空态。先这样验证链路，再补数据。

## 四、拿你的 openid

云开发控制台 → 数据库 → 任意集合 → 添加一条记录 → 触发器里能看到，或：

```text
开发者工具 → 调试器 → Console → 输入：
wx.cloud.callFunction({ name: 'memberOps', data: { action: 'list' } }).then(console.log)
```

返回里 context 不含 openid，但云函数日志会有。更简单：云开发控制台 → 用户管理 → 能看到你的 openid。

把 openid 记下来，导入种子数据时 `userId` 字段填 `wx:{openid}`。

## 五、真机验证（核心）

重新编译，照此验证：

### 5.1 云函数链路通不通

开发者工具 → Console，应该**没有** `云函数失败，回退 mock` 的警告。

- 如果有这个警告 → 云函数有问题，看警告里的 error，贴给我。
- 如果没有 → 链路通了。

### 5.2 首页

- [ ] 首页正常渲染（不白屏）。
- [ ] 如果导入了种子数据 → 显示今日重点、提醒、最近报告。
- [ ] 如果没导入 → 显示首次使用空态或空列表（不报错）。

### 5.3 家人页

- [ ] 家人页正常渲染。
- [ ] 导入种子 → 显示家人列表。
- [ ] 没导入 → 空态。

### 5.4 报告页

- [ ] 报告 Tab 正常。
- [ ] 点报告 → 跳转解读结果页。

### 5.5 成员详情

- [ ] 家人页点成员 → 成员详情正常。

### 5.6 导出（联调验证用）

Console 里手动测：

```text
import('./services/index').then(m => m.exportService.exportAll()).then(console.log)
```

应该返回 ExportBundle 结构。检查 meta、members、reports 等字段。

## 六、常见问题

| 现象 | 原因 | 处理 |
|---|---|---|
| `云函数失败，回退 mock` | 云函数没部署 / 报错 | 部署 + 看云函数日志 |
| 页面空，但有数据 | userId 不匹配 | 种子数据 userId 要等于 `wx:{你的openid}` |
| `module xxx is not defined` | 又是模块解析 | 贴报错给我 |
| 云函数部署超时 | 网络 | 重试 |

## 七、反馈给我

验证完告诉我：

1. 4 个云函数是否都部署成功。
2. Console 有没有 `云函数失败` 警告。
3. 5.1-5.5 是否通过。
4. 5.6 导出测试返回什么。

把任何报错贴给我，我来修。
