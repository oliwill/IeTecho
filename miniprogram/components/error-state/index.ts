Component({
  properties: {
    title: { type: String, value: '暂时无法加载' },
    description: { type: String, value: '请稍后重试，已填写的信息会保留。' },
    actionText: { type: String, value: '重试' }
  },
  methods: {
    handleRetry() {
      this.triggerEvent('retry')
    }
  }
})
