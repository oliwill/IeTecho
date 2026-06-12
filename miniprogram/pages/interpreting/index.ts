import { navigateTo } from '../../utils/route'

Page({
  goResult() {
    navigateTo('/pages/report-result/index')
  },
  goBackLater() {
    navigateTo('/pages/member-detail/index?memberId=member-self')
  }
})
