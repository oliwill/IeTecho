import { interpretations } from '../../data/mock-interpretations'
import { metricRecords } from '../../data/mock-metrics'
import { navigateTo } from '../../utils/route'

Page({
  data: {
    interpretation: interpretations[0],
    abnormalMetrics: metricRecords.filter(item => item.isAbnormal)
  },
  goConfirm() {
    navigateTo('/pages/metric-confirm/index')
  }
})
