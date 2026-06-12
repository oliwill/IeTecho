import { firstUseMember, members } from '../../data/mock-members'
import { navigateTo } from '../../utils/route'

Page({
  data: {
    isFirstUse: false,
    firstUseMember,
    members
  },
  onLoad(options) {
    if (options?.scenario === 'firstUse') {
      this.setData({ isFirstUse: true })
    }
  },
  goUpload() {
    navigateTo('/pages/report-upload/index')
  },
  goEdit() {
    navigateTo('/pages/member-edit/index')
  },
  goMemberDetail(event: any) {
    const memberId = event.detail?.memberId || 'member-self'
    navigateTo(`/pages/member-detail/index?memberId=${memberId}`)
  }
})
