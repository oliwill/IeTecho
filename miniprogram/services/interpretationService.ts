import { interpretations, disclaimer } from '../data/mock-interpretations'
import type { Interpretation } from '../models/interpretation'
import { callCloud, isCloudReady } from './_cloud'

/**
 * AI 解读读取 service。
 * 数据来源：云函数可用时走 reportOps（interp.getByReport），否则回退 mock。
 * iOS 阶段：_cloud 实现换成 fetch 后端，此 service 接口不变。
 */
export const interpretationService = {
  /** 全部解读记录（mock 回退）。 */
  async list(): Promise<Interpretation[]> {
    return interpretations
  },

  /** 按 reportId 取该报告的最新解读。 */
  async getByReport(reportId: string): Promise<Interpretation | undefined> {
    if (isCloudReady()) {
      try {
        const data = await callCloud<Interpretation | null>('reportOps', {
          action: 'interp.getByReport',
          reportId
        })
        return data || undefined
      } catch (err) {
        console.warn('[interpretationService.getByReport] 云函数失败，回退 mock', err)
      }
    }
    return interpretations.find((item) => item.reportId === reportId)
  },

  /** 按 id 取单条解读。 */
  async getById(id: string): Promise<Interpretation | undefined> {
    return interpretations.find((item) => item.id === id)
  },

  /** 固定免责声明文案。 */
  getDisclaimer(): Promise<string> {
    return Promise.resolve(disclaimer)
  }
}
