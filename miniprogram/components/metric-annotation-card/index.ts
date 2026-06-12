import { getStatusTone } from '../../utils/status'

Component({
  properties: {
    metric: { type: Object, value: {} },
    showActions: { type: Boolean, value: false }
  },
  data: { tone: 'default' },
  observers: {
    metric(metric) {
      this.setData({ tone: getStatusTone(metric?.status || 'default') })
    }
  },
  methods: {
    handleEdit() {
      this.triggerEvent('edit', { metricId: this.data.metric.id })
    },
    handleIgnore() {
      this.triggerEvent('ignore', { metricId: this.data.metric.id })
    }
  }
})
