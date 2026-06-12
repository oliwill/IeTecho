Component({
  options: {
    multipleSlots: true
  },
  properties: {
    mark: { type: String, value: '＋' },
    title: { type: String, value: '还没有内容' },
    description: { type: String, value: '先完成第一步，后续内容会在这里展示。' },
    actionText: { type: String, value: '' },
    actionVariant: { type: String, value: 'primary' }
  },
  methods: {
    handleAction() {
      this.triggerEvent('action')
    }
  }
})
