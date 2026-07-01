import { initCloud } from './config/cloud-init'

App<IAppOption>({
  globalData: {
    motionLevel: 'normal'
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('[cloud] 当前基础库不支持云开发，请升级微信开发者工具')
      return
    }
    // init 失败会重试，并记录状态供 service 层判断（见 config/cloud-init.ts）。
    initCloud()
  }
})

interface IAppOption {
  globalData: {
    motionLevel: 'normal' | 'reduced' | 'off'
  }
}
