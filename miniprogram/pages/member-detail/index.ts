import { memberService, reportService, reminderService, metricService } from '../../services/index'
import type { Member } from '../../models/member'
import type { Report } from '../../models/report'
import type { Reminder } from '../../models/reminder'
import { navigateTo } from '../../utils/route'

type TrendItem = {
  metricName: string
  memberName: string
  direction: 'up' | 'down' | 'flat'
  symbol: string
  status: 'normal' | 'attention' | 'warning' | 'insufficient'
  currentValue?: string
}

Page({
  data: {
    member: null as Member | null,
    memberId: '' as string,
    recentReport: null as Report | null,
    trendItems: null as TrendItem[] | null,
    memberReminders: null as Reminder[] | null
  },
  async onLoad(options) {
    const member = (await memberService.getById(options?.memberId || '')) || null
    const memberId = member?.id || ''
    const reports = memberId ? await reportService.getByMember(memberId) : []
    const recentReport = reports[0] || null
    const trendItems = await metricService.getTrendSummaries()
    const memberReminders = memberId ? await reminderService.getByMember(memberId) : []
    // 空态回退:该成员无提醒时,取全局前 1 条,避免页面右侧提醒区空白。
    const fallback = memberReminders.length ? memberReminders : (await reminderService.list()).slice(0, 1)
    this.setData({ member, memberId, recentReport, trendItems, memberReminders: fallback })
  },
  goUpload() {
    navigateTo(`/pages/report-upload/index?memberId=${this.data.memberId}`)
  },
  goReportResult() {
    if (this.data.recentReport) {
      navigateTo(`/pages/report-result/index?id=${this.data.recentReport.id}`)
    }
  },
  goEdit() {
    navigateTo(`/pages/member-edit/index?memberId=${this.data.memberId}`)
  },
  goAddReminder() {
    // 提醒编辑页 P1 第二批未做，先给提示
    wx.showToast({ title: '提醒功能即将开放', icon: 'none' })
  }
})
