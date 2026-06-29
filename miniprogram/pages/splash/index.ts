// 启动页：冷启动入口，停留约 1.8s 后切换到首页（tabBar 页用 switchTab）
const SPLASH_DURATION = 1800

Page({
  timer: null as null | ReturnType<typeof setTimeout>,

  onLoad() {
    this.timer = setTimeout(() => {
      wx.switchTab({ url: '/pages/home/index' })
    }, SPLASH_DURATION)
  },

  onHide() {
    this.clearTimer()
  },

  onUnload() {
    this.clearTimer()
  },

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
})
