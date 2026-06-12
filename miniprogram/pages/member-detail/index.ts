import { members } from '../../data/mock-members'
import { reports } from '../../data/mock-reports'
import { trendSummaries } from '../../data/mock-metrics'
import { reminders } from '../../data/mock-reminders'
import { navigateTo } from '../../utils/route'

Page({
  data: {
    member: members[0],
    recentReport: reports[0],
    trendItems: trendSummaries,
    memberReminders: reminders.slice(0, 2)
  },
  onLoad(options) {
    const member = members.find(item => item.id === options?.memberId) || members[0]
    const recentReport = reports.find(item => item.memberId === member.id) || reports[0]
    const memberReminders = reminders.filter(item => item.memberId === member.id)
    this.setData({ member, recentReport, memberReminders: memberReminders.length ? memberReminders : reminders.slice(0, 1) })
  },
  goUpload() {
    navigateTo('/pages/report-upload/index')
  },
  goReportResult() {
    navigateTo('/pages/report-result/index')
  }
})
