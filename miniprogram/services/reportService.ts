import { reports } from '../data/mock-reports'
import type { Report } from '../models/report'
import { resolve } from './_async'

/**
 * 报告读取 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现,接口不变。
 */
export const reportService = {
  /** 全部报告。 */
  list: (): Promise<Report[]> => resolve(reports),

  /** 取某成员的全部报告。 */
  getByMember: (memberId: string): Promise<Report[]> =>
    resolve(reports.filter((item) => item.memberId === memberId)),

  /** 按 id 取单条报告,未找到返回 undefined。 */
  getById: (id: string): Promise<Report | undefined> =>
    resolve(reports.find((item) => item.id === id))
}
