import { CLOUD_ENV } from './config/cloud'

App<IAppOption>({
  globalData: {
    motionLevel: 'normal'
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('[cloud] 当前基础库不支持云开发，请升级微信开发者工具')
      return
    }
    wx.cloud.init({
      env: CLOUD_ENV,
      traceUser: true
    })
  }
})

interface IAppOption {
  globalData: {
    motionLevel: 'normal' | 'reduced' | 'off'
  }
}
