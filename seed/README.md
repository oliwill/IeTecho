# 种子数据

用于本地联调的种子数据。云数据库集合为空时,导入这些数据看完整效果。

## 文件

```text
members-seed.json     JSON 数组(3 条成员:我/父亲/母亲)
members-seed.jsonl    JSON Lines(同上,不同格式)
```

## 使用前:替换占位 openid

seed 文件里 `userId` 是占位值 `wx:YOUR_OPENID`。导入前替换成你的真实 openid:

```text
查找:    wx:YOUR_OPENID
替换为:  wx:你的真实 openid
```

你的 openid 获取方式:

- 真机预览小程序后,看云函数日志(getWXContext 打印的 WX_OPENID)
- 或云开发控制台 → 用户管理

## 导入方式

云开发控制台 → 数据库 → members → 导入数据:

- **格式 A:JSON Lines**(推荐)
  - 文件:members-seed.jsonl
  - 格式:JSON Lines
- **格式 B:手动添加**
  - members → 添加记录 → JSON 模式
  - 把 JSON 数组里的每条单独贴一次

> 2026-06-22 实测:云开发控制台的文件导入对中文/日期类型校验较严,手动逐条添加最稳。

## 注意

- seed 文件里 openid 是占位,不会泄露你的真实 openid
- 导入是本地联调用,不进生产数据
- 真实使用时,用户数据由前端 create action 写入,类型由云函数保证
