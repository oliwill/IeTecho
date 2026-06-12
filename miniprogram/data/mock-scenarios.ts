import { firstUseMember, members } from './mock-members'
import { reports, uploadMockReport } from './mock-reports'
import { metricRecords } from './mock-metrics'
import { reminders } from './mock-reminders'
import { dashboard, firstUseDashboard } from './mock-dashboard'
import { interpretations } from './mock-interpretations'

export const mockScenarios = {
  firstUse: {
    dashboard: firstUseDashboard,
    members: [firstUseMember],
    reports: [],
    metrics: [],
    reminders: [],
    interpretations: []
  },
  multiFamily: {
    dashboard,
    members,
    reports,
    metrics: metricRecords,
    reminders,
    interpretations,
    uploadMockReport
  }
}

export type MockScenarioKey = keyof typeof mockScenarios
export const activeScenario: MockScenarioKey = 'multiFamily'
export const activeMock = mockScenarios[activeScenario]
