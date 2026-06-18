import { interpretationService } from '../../services'
import { showMockToast } from '../../utils/route'

Page({
  showMock() {
    showMockToast('静态 Mock 阶段暂未实现')
  },
  showAiNotice() {
    wx.showModal({
      title: 'AI 设置',
      content: '报告解读需要调用第三方 AI 服务。当前静态 Mock 未接入真实接口。',
      showCancel: false
    })
  },
  showPrivacy() {
    wx.showModal({
      title: '隐私说明',
      content: '健康数据属于敏感信息。正式版本会说明数据用途、存储位置、删除路径和第三方 AI 调用范围。',
      showCancel: false
    })
  },
  async showDisclaimer() {
    const disclaimer = await interpretationService.getDisclaimer()
    wx.showModal({
      title: '免责声明',
      content: disclaimer,
      showCancel: false
    })
  }
})
