export interface Interpretation {
  id: string
  memberId: string
  reportId: string
  createdAt: string
  riskLevel: 'low' | 'attention' | 'warning'
  summary: string
  abnormalMetricIds: string[]
  keyConcerns: string[]
  possibleFactors: string[]
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
