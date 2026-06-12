export function navigateTo(url: string) {
  wx.navigateTo({ url })
}

export function switchTab(url: string) {
  wx.switchTab({ url })
}

export function showMockToast(title = '静态 Mock，暂未接入真实功能') {
  wx.showToast({ title, icon: 'none' })
}
