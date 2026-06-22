import { dashboard, firstUseDashboard } from '../data/mock-dashboard'
import type { Dashboard } from '../models/scenario'
import { callCloud, isCloudReady } from './_cloud'

/**
 * 首页聚合 service。
 * 数据来源：云函数可用时走 getDashboard（服务端聚合），否则回退本地 mock。
 * iOS 阶段：_cloud 实现换成 fetch 后端，此 service 接口不变。
 */

export const dashboardService = {
  /** 首页聚合数据（云函数会根据是否有数据自动返回多家人 / 首次使用场景）。 */
  async get(): Promise<Dashboard> {
    if (isCloudReady()) {
      try {
        const data = await callCloud<Dashboard>('getDashboard', {})
        if (data) return data
      } catch (err) {
        console.warn('[dashboardService.get] 云函数失败，回退 mock', err)
      }
    }
    return dashboard
  },

  /** 首次使用场景的空态聚合数据（本地兜底，不查库）。 */
  getFirstUse(): Promise<Dashboard> {
    return Promise.resolve(firstUseDashboard)
  }
}
