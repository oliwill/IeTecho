const statusMap: Record<string, { text: string; tone: string }> = {
  none: { text: '未解读', tone: 'default' },
  interpreting: { text: '解读中', tone: 'info' },
  interpreted: { text: '已解读', tone: 'normal' },
  failed: { text: '解读失败', tone: 'warning' },
  pendingMetrics: { text: '待确认', tone: 'info' },
  saved: { text: '已入档', tone: 'done' }
}

Component({
  properties: {
    report: { type: Object, value: {} }
  },
  data: {
    statusText: '未解读',
    tone: 'default'
  },
  observers: {
    report(report) {
      const item = statusMap[report?.interpretationStatus] || statusMap.none
      this.setData({ statusText: item.text, tone: item.tone })
    }
  },
  methods: {
    handleOpen() {
      this.triggerEvent('open', { reportId: this.data.report.id })
    }
  }
})
