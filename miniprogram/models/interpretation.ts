import type { MetricStatus } from './metric'

/**
 * 解读记录中内嵌的异常指标（云函数 interpretReport 写入 + DeepSeek 输出）。
 * 字段对齐 cloudfunctions/interpretReport/index.js 写入的 abnormalMetrics 数组。
 */
export interface AbnormalMetric {
  metricName: string
  value: number | string
  unit: string
  status: MetricStatus
  statusText: string
  referenceRange: string
  plainExplanation: string
  nextSuggestion: string
  possibleFactors?: string[]
}

export interface Interpretation {
  id: string
  memberId: string
  reportId: string
  createdAt: string
  riskLevel: 'low' | 'attention' | 'warning'
  summary: string
  /** AI 解读出的异常指标（内嵌完整对象，物化入库的来源）。 */
  abnormalMetrics: AbnormalMetric[]
  keyConcerns: string[]
  lifestyleSuggestions: {
    diet: string[]
    exercise: string[]
    sleep?: string[]
    habits?: string[]
  }
  followUpSuggestions: string[]
  disclaimer: string
  hasViewed: boolean
}
