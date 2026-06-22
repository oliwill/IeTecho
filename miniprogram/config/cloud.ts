// 云开发环境配置。
//
// 重要：env ID 不入库（个人隐私偏好，与 AppID 同策略）。
// 本地使用方式：
//   1. 复制 miniprogram/config/cloud.local.example.ts 为 cloud.local.ts
//   2. 在 cloud.local.ts 里填入你的真实环境 ID
//   3. cloud.local.ts 已在 .gitignore，不会入库
//   4. 没有 cloud.local.ts 时，CLOUD_ENV 为空字符串，云开发不初始化（走 mock 回退）
//
// 换机器时按上面 1、2 步做一次即可。

let env = ''

try {
  // cloud.local.ts 不入库，存在时覆盖占位值。
  // 用 require 避免 TypeScript 在文件不存在时报编译错。
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const local = require('./cloud.local')
  if (local && local.CLOUD_ENV_LOCAL) {
    env = local.CLOUD_ENV_LOCAL
  }
} catch (e) {
  // cloud.local.ts 不存在，保持 env 为空。
}

export const CLOUD_ENV = env
