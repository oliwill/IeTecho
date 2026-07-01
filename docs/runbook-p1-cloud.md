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

> 还要部署第 5 个：`cloudfunctions/interpretReport`（AI 报告解读，依赖 `pdf-parse`）。它有额外的超时配置要求，**务必看下一节**。

## 二·五、interpretReport 超时配置（必做，否则必报 -504003）

`interpretReport` 的工作流是 OCR（约 2 秒）+ 调 DeepSeek 大模型解读（5-20 秒），整体远超微信云开发**默认 3 秒**超时。不调超时，调用必在第 3 秒被平台 kill，报错：

```text
errCode: -504003 | Invoking task timed out after 3 seconds
(FUNCTIONS_TIME_LIMIT_EXCEEDED)
```

**正确做法（二选一，推荐 A）：**

**A. 控制台直接改（最可靠，立即生效）**

云开发控制台 → 云函数 → `interpretReport` → 配置：

```text
超时时间：60 秒
内存：   512 MB（可选，256 也能跑，调大可减少冷启动）
```

保存即生效，无需重新部署。

**B. 走 config.json 部署（易踩坑，不推荐单独用）**

`cloudfunctions/interpretReport/config.json`（在 `.gitignore`，本地建）里写：

```json
{
  "permissions": { "openapi": ["ocr.printText"] },
  "environment": { "DEEPSEEK_API_KEY": "sk-..." },
  "timeout": 60,
  "memorySize": 512
}
```

⚠️ **已知坑**：对**已存在于线上的云函数**，「右键 → 上传并部署」会更新代码，但 `config.json` 里的 `timeout` / `memorySize` 经常**不覆盖**线上既有配置（旧版微信开发者工具尤其明显）。代码更新了、超时还是 3 秒，导致 `config.json` 写了 60 秒但线上仍报超时。所以**改完必须回控制台核对一遍**，或直接用方案 A。

**验证是否真的修好：**

1. 小程序里重新解读一份报告，看是否还报 -504003。
2. 或云函数日志里看 `Duration`：修好前是 `3000ms` 卡死，修好后应是十几秒正常返回。
3. 报错日志里 `Memory: 256MB` 说明跑的是默认配置；改为 512MB 后日志应显示 `Memory: 512MB`。

> 超时上限：微信云开发云函数最大 300 秒。60 秒足够覆盖 OCR + DeepSeek + 余量，不必拉满。

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
