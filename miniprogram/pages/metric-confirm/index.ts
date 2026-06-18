import { metricService } from '../../services'
import type { MetricRecord } from '../../models/metric'
import { navigateTo, showMockToast } from '../../utils/route'

Page({
  data: {
    metrics: null as MetricRecord[] | null
  },
  async onLoad() {
    const metrics = await metricService.list()
    this.setData({ metrics })
  },
  async ignoreMetric(event: any) {
    const metricId = event.detail?.metricId
    if (!metricId) return
    const metrics = await metricService.updateConfirmation(metricId, 'ignored')
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
