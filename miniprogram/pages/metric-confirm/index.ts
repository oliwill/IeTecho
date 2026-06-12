import { metricRecords } from '../../data/mock-metrics'
import { navigateTo, showMockToast } from '../../utils/route'

Page({
  data: {
    metrics: metricRecords
  },
  ignoreMetric(event: any) {
    const metricId = event.detail?.metricId
    const metrics = this.data.metrics.map(item => item.id === metricId ? { ...item, confirmationState: 'ignored', statusText: '已忽略' } : item)
    this.setData({ metrics })
    showMockToast('已在本地标记忽略')
  },
  editMetric() {
    showMockToast('编辑弹层会在下一阶段实现')
  },
  showMock() {
    showMockToast('手动添加指标会在下一阶段实现')
  },
  saveToProfile() {
    wx.showToast({ title: '已保存到健康档案', icon: 'none' })
    setTimeout(() => navigateTo('/pages/member-detail/index?memberId=member-self'), 500)
  }
})
