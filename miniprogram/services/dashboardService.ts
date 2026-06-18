import { dashboard, firstUseDashboard } from '../data/mock-dashboard'
import type { Dashboard } from '../models/scenario'
import { resolve } from './_async'

/**
 * 首页聚合 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现,接口不变。
 */
export const dashboardService = {
  /** 多家人场景的首页聚合数据。 */
  get: (): Promise<Dashboard> => resolve(dashboard),

  /** 首次使用场景的空态聚合数据。 */
  getFirstUse: (): Promise<Dashboard> => resolve(firstUseDashboard)
}
