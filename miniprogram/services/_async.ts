/**
 * Service 层异步包装。
 *
 * 当前阶段(P0/P1 静态 Mock)数据来源是本地 mock,本身同步可用。
 * 这里用 Promise.resolve 包一层,是为了保证接口形状与未来接微信云函数时一致:
 * 接云函数时,每个 service 内部只需把 resolve(value) 换成 wx.cloud.callFunction(...),
 * 页面层调用签名不变。详见 docs/plans/2026-06-17-platform-decision.md 三层分离约束。
 */
export const resolve = <T>(value: T): Promise<T> => Promise.resolve(value)
