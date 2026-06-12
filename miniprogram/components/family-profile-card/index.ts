import { getStatusTone } from '../../utils/status'

Component({
  properties: {
    member: {
      type: Object,
      value: {}
    }
  },
  data: {
    tone: 'default',
    avatarText: '家',
    hasFocusTags: false,
    nextActionText: '上传报告后开始追踪'
  },
  observers: {
    member(member) {
      if (!member) return
      this.setData({
        tone: getStatusTone(member.status),
        avatarText: member.name ? member.name.slice(0, 1) : '家',
        hasFocusTags: Boolean(member.focusTags && member.focusTags.length),
        nextActionText: member.nextAction || '上传报告后开始追踪'
      })
    }
  },
  methods: {
    handleOpen() {
      this.triggerEvent('open', { memberId: this.data.member.id })
    }
  }
})
