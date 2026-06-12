import type { Reminder } from './reminder'
import type { Report } from './report'

export type ScenarioName = 'firstUse' | 'selfOnly' | 'multiFamily' | 'noAbnormal' | 'error'

export interface Dashboard {
  scenario: ScenarioName
  todayFocus?: {
    memberId: string
    memberName: string
    title: string
    description: string
    nextAction: string
    targetPage: string
  }
  reminders: Reminder[]
  trendSummaries: Array<{
    metricName: string
    memberName: string
    direction: 'up' | 'down' | 'flat'
    status: 'normal' | 'attention' | 'warning' | 'insufficient'
    currentValue?: string
  }>
  recentReport?: Report
}
