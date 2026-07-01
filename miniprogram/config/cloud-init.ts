import { CLOUD_ENV } from './cloud'

/**
 * 云开发初始化状态（跨模块共享）。
 *
 * 背景：isCloudReady() 只能判断「env 配置存在 + wx.cloud 可用」，
 *      但 wx.cloud.init 是异步且有概率失败（getwxaasyncsecinfo 安全检查网络超时）。
 *      init 失败后 wx.cloud.callFunction 会报「请先调用 init」，但 service 层
 *      在读路径 catch 后会静默回退 mock，导致「看起来成功，实际读到 mock 数据」。
 *
 * 这里用一个模块级状态记录 init 真实结果，让 _cloud.isCloudReady() 能区分：
 *   - init 未完成：按 env 有值乐观返回 true（兼容旧逻辑，给 init 时间完成）
 *   - init 成功：返回 true
 *   - init 失败：返回 false，让 service 层走 mock 回退或明确报错
 */

const INIT_MAX_RETRY = 2 // init 失败最多重试 2 次（共 3 次尝试）
const INIT_RETRY_DELAY = 500 // ms

let initStatus: 'pending' | 'success' | 'failed' = 'pending'

export function getCloudInitStatus() {
  return initStatus
}

function setStatus(status: typeof initStatus) {
  initStatus = status
}

/** 是否配置了云开发环境（与 init 成败无关，仅看 env）。 */
export function hasCloudEnv(): boolean {
  return !!wx.cloud && !!CLOUD_ENV
}

/**
 * 初始化云开发，带重试。
 * onLaunch 调用。init 成功后 setStatus('success')，失败重试到上限后 setStatus('failed')。
 */
export function initCloud(): void {
  if (!wx.cloud || !CLOUD_ENV) {
    setStatus('failed')
    return
  }
  attemptInit(0)
}

function attemptInit(attempt: number) {
  wx.cloud.init({
    env: CLOUD_ENV,
    traceUser: true,
    success() {
      setStatus('success')
      console.info('[cloud] init 成功')
    },
    fail(err) {
      console.warn(`[cloud] init 失败 (attempt ${attempt + 1}/${INIT_MAX_RETRY + 1})`, err)
      if (attempt < INIT_MAX_RETRY) {
        setTimeout(() => attemptInit(attempt + 1), INIT_RETRY_DELAY)
      } else {
        setStatus('failed')
        console.error('[cloud] init 重试用尽，云能力不可用。后续云函数调用将失败。')
      }
    }
  })
}
