App<IAppOption>({
  globalData: {
    motionLevel: 'normal'
  },
  onLaunch() {
    // 静态 Mock 阶段不做微信登录和云开发初始化。
  }
})

interface IAppOption {
  globalData: {
    motionLevel: 'normal' | 'reduced' | 'off'
  }
}
