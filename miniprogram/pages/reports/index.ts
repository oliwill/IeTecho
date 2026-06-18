// 报告 Tab 页：跨家人的体检报告 / 化验单列表入口。
// 当前为静态 Mock 骨架，数据接入后改走 reportService。
import { reportService } from '../../services'
import type { Report } from '../../models/report'

interface ReportListItem {
  id: string
  title: string
  memberName: string
  reportDate: string
  statusLabel: string
}

const STATUS_LABELS: Record<Report['interpretationStatus'], string> = {
  none: '未解读',
  interpreting: '解读中',
  interpreted: '已解读',
  failed: '解读失败',
  pendingMetrics: '待确认',
  saved: '已保存'
}

Page({
  data: {
    loading: true,
    reports: [] as ReportListItem[]
  },

  async onLoad() {
    const reports = await reportService.list()
    this.setData({
      loading: false,
      reports: reports.map((item) => ({
        id: item.id,
        title: item.reportTypeLabel,
        memberName: item.memberName,
        reportDate: item.reportDate,
        statusLabel: STATUS_LABELS[item.interpretationStatus] || '未解读'
      }))
    })
  },

  tapUpload() {
    wx.navigateTo({ url: '/pages/report-upload/index' })
  },

  tapReport(e: any) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/report-result/index?id=${id}` })
  }
})
