import { interpretations, disclaimer } from '../data/mock-interpretations'
import type { Interpretation } from '../models/interpretation'
import { resolve } from './_async'

/**
 * AI 解读读取 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现,接口不变。
 *
 * P1 接入计划：第二批（interpretationOps 云函数待建，主链路验证通过后再接入）。
 */
export const interpretationService = {
  /** 全部解读记录。 */
  list: (): Promise<Interpretation[]> => resolve(interpretations),

  /** 按 id 取单条解读,未找到返回 undefined。 */
  getById: (id: string): Promise<Interpretation | undefined> =>
    resolve(interpretations.find((item) => item.id === id)),

  /** 固定免责声明文案。 */
  getDisclaimer: (): Promise<string> => resolve(disclaimer)
}
