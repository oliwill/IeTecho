import { navigateTo } from '../../utils/route'

Page({
  data: {
    fileSelected: false,
    uploadTitle: '上传体检报告或化验单',
    uploadDescription: '支持图片 / PDF。静态 Mock 不会读取真实文件。'
  },
  chooseMockFile() {
    this.setData({
      fileSelected: true,
      uploadTitle: '已选择示例报告',
      uploadDescription: '体检报告示例.pdf'
    })
    wx.showToast({ title: '已选择示例报告', icon: 'none' })
  },
  startInterpret() {
    navigateTo('/pages/interpreting/index')
  },
  saveOnly() {
    wx.showToast({ title: '静态 Mock：已保存报告', icon: 'none' })
    navigateTo('/pages/member-detail/index?memberId=member-self')
  }
})
