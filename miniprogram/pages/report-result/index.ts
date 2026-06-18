import { interpretationService, metricService } from '../../services'
import type { Interpretation } from '../../models/interpretation'
import type { MetricRecord } from '../../models/metric'
import { navigateTo } from '../../utils/route'

Page({
  data: {
    interpretation: null as Interpretation | null,
    abnormalMetrics: null as MetricRecord[] | null
  },
  async onLoad() {
    const list = await interpretationService.list()
    const interpretation = list[0] || null
    const abnormalMetrics = await metricService.getAbnormal()
    this.setData({ interpretation, abnormalMetrics })
  },
  goConfirm() {
    navigateTo('/pages/metric-confirm/index')
  }
})
