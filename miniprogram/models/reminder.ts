export interface Reminder {
  id: string
  memberId: string
  memberName: string
  relatedReportId?: string
  relatedMetricId?: string
  type: 'followUpTest' | 'doctorVisit' | 'lifestyle'
  typeLabel: string
  title: string
  time: string
  displayTime: string
  repeatRule: 'once' | 'daily' | 'weekly'
  note?: string
  status: 'today' | 'future' | 'overdue' | 'done' | 'cancelled'
  subscriptionAuthorized?: boolean
}
