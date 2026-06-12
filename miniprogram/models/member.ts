export type MemberStatus = 'empty' | 'stable' | 'attention' | 'followUp' | 'overdue'

export interface Member {
  id: string
  name: string
  relation: 'self' | 'father' | 'mother' | 'partner' | 'child' | 'other'
  relationLabel: string
  gender?: 'male' | 'female' | 'unknown'
  ageLabel?: string
  birthYear?: number
  heightCm?: number
  weightKg?: number
  bmi?: number
  focusTags: string[]
  medicalHistory?: string[]
  allergyHistory?: string[]
  avatarType: string
  status: MemberStatus
  statusText: string
  latestReportDate?: string
  abnormalMetricCount: number
  reminderCount: number
  nextAction?: string
}
