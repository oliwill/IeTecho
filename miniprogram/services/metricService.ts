import { metricRecords, trendSummaries } from '../data/mock-metrics'
import type { MetricRecord, MetricConfirmationState } from '../models/metric'
import { resolve } from './_async'

/**
 * 指标读取 + 本地态更新 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现,接口不变。
 *
 * confirmationState 的本地更新当前只作用于内存副本(乐观 UI),
 * 接云函数后改为调用 createMetric / updateMetric 之类的写操作。
 */
const localMetrics: MetricRecord[] = metricRecords.map((item) => ({ ...item }))

/** trendSummaries 的元素类型。 */
type TrendSummary = (typeof trendSummaries)[number]

export const metricService = {
  /** 全部指标。 */
  list: (): Promise<MetricRecord[]> => resolve(localMetrics.map((item) => ({ ...item }))),

  /** 取某报告下的全部指标。 */
  getByReport: (reportId: string): Promise<MetricRecord[]> =>
    resolve(localMetrics.filter((item) => item.reportId === reportId).map((item) => ({ ...item }))),

  /** 取全部异常指标。 */
  getAbnormal: (): Promise<MetricRecord[]> =>
    resolve(localMetrics.filter((item) => item.isAbnormal).map((item) => ({ ...item }))),

  /** 取首页 / 成员详情用的趋势摘要。 */
  getTrendSummaries: (): Promise<TrendSummary[]> => resolve([...trendSummaries]),

  /**
   * 本地更新某条指标的确认状态,返回更新后的全量列表(新数组)。
   * 静态 Mock 阶段仅改内存副本,不持久化。
   */
  updateConfirmation: (id: string, state: MetricConfirmationState): Promise<MetricRecord[]> => {
    const target = localMetrics.find((item) => item.id === id)
    if (target) {
      target.confirmationState = state
      if (state === 'ignored') {
        target.statusText = '已忽略'
      }
    }
    return resolve(localMetrics.map((item) => ({ ...item })))
  }
}
