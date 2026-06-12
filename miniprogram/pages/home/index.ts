import { dashboard, firstUseDashboard } from '../../data/mock-dashboard'
import { navigateTo, showMockToast, switchTab } from '../../utils/route'

Page({
  data: {
    // 切换为 true 可查看首次使用空态。
    isFirstUse: false,
    dashboard
  },
  onLoad(options) {
    if (options?.scenario === 'firstUse') {
      this.setData({ isFirstUse: true, dashboard: firstUseDashboard })
    }
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
