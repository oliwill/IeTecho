import { memberService } from '../../services/index'
import type { Member } from '../../models/member'
import { navigateTo } from '../../utils/route'

Page({
  data: {
    isFirstUse: false,
    firstUseMember: null as Member | null,
    members: null as Member[] | null
  },
  async onLoad(options) {
    const isFirstUse = options?.scenario === 'firstUse'
    const firstUseMember = await memberService.getFirstUseMember()
    const members = await memberService.list()
    this.setData({ isFirstUse, firstUseMember, members })
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
