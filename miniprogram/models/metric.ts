export type MetricStatus = 'normal' | 'high' | 'low' | 'warning'
export type MetricConfirmationState = 'pending' | 'confirmed' | 'modified' | 'ignored' | 'uncertain'

export interface MetricRecord {
  id: string
  memberId: string
  reportId: string
  metricName: string
  metricCode: string
  category: string
  value: number | string
  unit: string
  referenceRange: string
  status: MetricStatus
  statusText: string
  isAbnormal: boolean
  measuredAt: string
  plainLanguageExplanation?: string
  possibleFactors?: string[]
  nextSuggestion?: string
  confirmationState: MetricConfirmationState
}
