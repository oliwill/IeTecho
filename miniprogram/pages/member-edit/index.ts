Page({
  data: {
    name: '',
    relation: 'father',
    relations: [
      { label: '父亲', value: 'father', className: 'chip chip--active' },
      { label: '母亲', value: 'mother', className: 'chip' },
      { label: '伴侣', value: 'partner', className: 'chip' },
      { label: '孩子', value: 'child', className: 'chip' },
      { label: '其他', value: 'other', className: 'chip' }
    ],
    focusOptions: ['血压', '血糖', '血脂', '尿酸']
  },
  onNameInput(event: any) {
    this.setData({ name: event.detail.value })
  },
  selectRelation(event: any) {
    const relation = event.currentTarget.dataset.value
    const relations = this.data.relations.map(item => ({
      ...item,
      className: item.value === relation ? 'chip chip--active' : 'chip'
    }))
    this.setData({ relation, relations })
  },
  saveMock() {
    wx.showToast({ title: '静态 Mock：已保存', icon: 'none' })
    setTimeout(() => wx.navigateBack(), 500)
  }
})
