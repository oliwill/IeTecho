Component({
  properties: {
    text: {
      type: String,
      value: '',
      // 允许接收 null：父组件数据未就绪时可能传入 null，
      // optionalTypes 让框架不报类型不兼容警告，并用 value 兜底。
      optionalTypes: [null],
      observer(nv) {
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
