export type ReportStatus = 'none' | 'interpreting' | 'interpreted' | 'failed' | 'pendingMetrics' | 'saved'

export interface Report {
  id: string
  memberId: string
  memberName: string
  reportType: 'checkup' | 'lab' | 'outpatient' | 'imaging'
  reportTypeLabel: string
  hospital?: string
  department?: string
  reportDate: string
  fileType: 'image' | 'pdf' | 'mock'
  fileName?: string
  summary: string
  interpretationId?: string
  interpretationStatus: ReportStatus
  pendingMetricCount: number
}
