Component({
  properties: {
    text: {
      type: String,
      value: '',
      observer(nv) {
        // 防御：调用方传 null/undefined 时回退为空串，避免类型不兼容警告。
        if (nv == null) {
          this.setData({ text: '' })
        }
      }
    },
    tone: {
      type: String,
      value: 'default'
    }
  }
})
