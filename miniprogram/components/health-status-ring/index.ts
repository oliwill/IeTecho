Component({
  properties: {
    title: { type: String, value: '当前关注事项' },
    // optionalTypes 兼容 null：父组件数据未就绪时（如解读结果未返回）
    // 可能传入 null/非数字，框架会用 value(0) 兜底，不报类型不兼容警告。
    attentionCount: { type: Number, value: 0, optionalTypes: [null] },
    reminderCount: { type: Number, value: 0, optionalTypes: [null] },
    trendChangeCount: { type: Number, value: 0, optionalTypes: [null] },
    tone: { type: String, value: 'normal' }
  }
})
