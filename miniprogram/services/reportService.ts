import { reports } from '../data/mock-reports'
import type { Report } from '../models/report'
import { callCloud, isCloudReady } from './_cloud'

/**
 * 报告 service。
 * 数据来源：云函数可用时走 reportOps，否则回退本地 mock。
 * iOS 阶段：_cloud 实现换成 fetch 后端，此 service 接口不变。
 */

export const reportService = {
  /** 全部报告。 */
  async list(): Promise<Report[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<Report[]>('reportOps', { action: 'report.list' })
      } catch (err) {
        console.warn('[reportService.list] 云函数失败，回退 mock', err)
      }
    }
    return reports
  },

  /** 取某成员的全部报告。 */
  async getByMember(memberId: string): Promise<Report[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<Report[]>('reportOps', { action: 'report.getByMember', memberId })
      } catch (err) {
        console.warn('[reportService.getByMember] 云函数失败，回退 mock', err)
      }
    }
    return reports.filter((item) => item.memberId === memberId)
  },

  /** 按 id 取单条报告，未找到返回 undefined。 */
  async getById(id: string): Promise<Report | undefined> {
    if (isCloudReady()) {
      try {
        const data = await callCloud<Report | null>('reportOps', { action: 'report.get', id })
        return data || undefined
      } catch (err) {
        console.warn('[reportService.getById] 云函数失败，回退 mock', err)
      }
    }
    return reports.find((item) => item.id === id)
  }
}
