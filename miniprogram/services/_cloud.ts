import { CLOUD_ENV } from '../config/cloud'

/**
 * Service 层云函数调用辅助。
 *
 * 三层分离核心：所有 wx.cloud.callFunction 都收口到这里，service 内部调用。
 * 页面层绝不直接调用 wx.cloud，只调 service 方法。
 *
 * iOS 阶段：此文件实现换成 fetch 独立后端 HTTP API，service 接口签名不变。
 * 详见 docs/plans/2026-06-17-platform-decision.md。
 */

interface CloudResult<T> {
  ok: boolean
  data?: T
  error?: string
  [key: string]: any
}

/**
 * 调用云函数并返回其 result。
 * 失败时抛错，由 service 调用方决定如何处理（回退 mock / 报错 / 空态）。
 */
export function callCloud<T = any>(name: string, data: Record<string, any> = {}): Promise<T> {
  return new Promise((resolvePromise, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res.result as CloudResult<T>
        if (result && result.ok) {
          resolvePromise(result.data as T)
        } else {
          reject(new Error(result?.error || `cloud function ${name} returned ok=false`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || `cloud function ${name} failed`))
      }
    })
  })
}

/**
 * 当前是否已接入云开发。
 * 用于 service 层在云函数不可用时（如本地 mock 调试）回退到 mock 数据。
 */
export function isCloudReady(): boolean {
  return !!wx.cloud && !!CLOUD_ENV
}
