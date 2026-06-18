import { dashboardService } from '../../services'
import type { Dashboard } from '../../models/scenario'
import { navigateTo, showMockToast, switchTab } from '../../utils/route'

Page({
  data: {
    // 切换为 true 可查看首次使用空态。
    isFirstUse: false,
    dashboard: null as Dashboard | null
  },
  async onLoad(options) {
    const isFirstUse = options?.scenario === 'firstUse'
    const dashboard = isFirstUse ? await dashboardService.getFirstUse() : await dashboardService.get()
    this.setData({ isFirstUse, dashboard })
  },
  goUpload() {
    navigateTo('/pages/report-upload/index')
  },
  goMemberDetail() {
    navigateTo('/pages/member-detail/index?memberId=member-father')
  },
  goReportResult() {
    navigateTo('/pages/report-result/index')
  },
  goFamily() {
    switchTab('/pages/family/index')
  },
  showMock() {
    showMockToast('提醒管理会在下一阶段接入')
  }
})
