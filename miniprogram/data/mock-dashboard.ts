import type { Dashboard } from '../models/scenario'
import { reminders } from './mock-reminders'
import { reports } from './mock-reports'
import { trendSummaries } from './mock-metrics'

export const dashboard: Dashboard = {
  scenario: 'multiFamily',
  todayFocus: {
    memberId: 'member-father',
    memberName: '父亲',
    title: '血压连续 3 次偏高',
    description: '建议今晚继续记录血压，复诊时带上近期记录。',
    nextAction: '查看父亲档案',
    targetPage: '/pages/member-detail/index?memberId=member-father'
  },
  reminders: reminders.slice(0, 2),
  trendSummaries: [...trendSummaries],
  recentReport: reports[0]
}

export const firstUseDashboard: Dashboard = {
  scenario: 'firstUse',
  reminders: [],
  trendSummaries: []
}
