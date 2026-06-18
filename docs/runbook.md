# IeTecho 运行与运维手册

## 当前阶段

截至 2026-06-12，项目是微信小程序 P0 静态 Mock。

当前不需要：

```text
npm install
微信云开发环境
AI API Key
数据库迁移
云函数部署
```

## 本地打开

1. 打开微信开发者工具。
2. 导入项目目录：

```text
E:/Git/ClaudeCode/IeTecho
```

3. 确认源码目录：

```text
miniprogram/
```

4. 当前 AppID：

```text
touristappid
```

正式开发前需要在 `project.config.json` 替换为真实小程序 AppID。

## 冒烟验证

编译后检查底部 Tab：

```text
首页 / 家人 / 报告 / 我的
```

手动走通主路径：

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

## 常见问题

### 编译提示 AppID 问题

当前 `project.config.json` 使用 `touristappid`。如果微信开发者工具不允许使用，请在导入时选择测试号，或替换为真实 AppID。

### 页面样式不生效

检查：

- `miniprogram/app.wxss` 是否引入 `styles/tokens.wxss`、`styles/theme.wxss`、`styles/layout.wxss`、`styles/motion.wxss`。
- 复用组件的 `index.json` 是否设置 `styleIsolation: "apply-shared"`。

### 点击按钮没有响应

检查自定义按钮事件：

```text
app-button 触发 tapbutton
页面使用 bind:tapbutton
```

不要改回驼峰 `tapButton`，小程序模板属性大小写兼容性不稳定。

### 报告上传没有真实文件

这是预期行为。P0 静态 Mock 不调用 `wx.chooseMedia`、不上传文件、不接云存储。

### 趋势图不是 ECharts

这是预期行为。P0 使用静态趋势摘要；P2 再引入 ECharts for Weixin。

## P1 环境变量 / 配置待办

P1 接入云开发和 AI 前，需要补齐：

```text
小程序 AppID
云开发环境 ID
AI API Provider
AI API Key 存储方式
订阅消息模板 ID
```

不要把 API Key 写入前端代码或仓库。

## Git 提交检查

提交前运行：

```bash
git status --short
```

允许提交：

```text
README.md
CLAUDE.md
docs/**
miniprogram/**
project.config.json
tsconfig.json
.gitignore
```

禁止提交：

```text
.agents/
skills-lock.json
project.private.config.json
node_modules/
miniprogram/miniprogram_npm/
```

## 发布前检查

正式发布前至少补齐：

- 真实 AppID。
- 隐私说明页面。
- 免责声明页面。
- AI 调用前显性同意。
- 数据删除路径。
- 云开发权限规则。
- 订阅消息授权失败兜底。
