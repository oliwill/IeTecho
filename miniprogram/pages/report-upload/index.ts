import { reportService } from '../../services/index'
import { memberService } from '../../services/index'
import type { Report } from '../../models/report'
import { navigateTo } from '../../utils/route'

interface MemberOption {
  id: string
  name: string
  relationLabel: string
}

interface ReportTypeOption {
  value: Report['reportType']
  label: string
}

const REPORT_TYPES: ReportTypeOption[] = [
  { value: 'checkup', label: '体检' },
  { value: 'lab', label: '化验' },
  { value: 'outpatient', label: '门诊' },
  { value: 'imaging', label: '影像' }
]

Page({
  data: {
    loadingMembers: true,
    members: [] as MemberOption[],
    selectedMemberId: '',
    selectedMemberName: '',
    reportTypes: REPORT_TYPES,
    selectedReportType: 'checkup' as Report['reportType'],
    reportDate: '',
    filePath: '',
    fileName: '',
    uploading: false,
    errorMsg: ''
  },

  async onLoad(options: any) {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    try {
      const members = await memberService.list()
      const memberOptions: MemberOption[] = members.map((m: any) => ({
        id: m.id,
        name: m.name,
        relationLabel: m.relationLabel
      }))
      // 默认选中：URL 传入 memberId 优先，否则「我」，否则第一个
      const presetId = options?.memberId
      const self = members.find((m: any) => m.relation === 'self')
      const defaultId = presetId || (self && self.id) || (memberOptions[0] && memberOptions[0].id) || ''
      const defaultMember = memberOptions.find((m) => m.id === defaultId)

      this.setData({
        loadingMembers: false,
        members: memberOptions,
        selectedMemberId: defaultId,
        selectedMemberName: defaultMember ? defaultMember.name : '',
        reportDate: dateStr
      })
    } catch (err) {
      console.warn('[report-upload] load members failed', err)
      this.setData({ loadingMembers: false, errorMsg: '加载家人列表失败' })
    }
  },

  selectMember(e: any) {
    const id = e.currentTarget.dataset.id as string
    const member = this.data.members.find((m) => m.id === id)
    this.setData({
      selectedMemberId: id,
      selectedMemberName: member ? member.name : '',
      errorMsg: ''
    })
  },

  selectReportType(e: any) {
    this.setData({ selectedReportType: e.currentTarget.dataset.value })
  },

  // 从聊天文件选择（PDF / 图片）
  async chooseFile() {
    try {
      const res = await new Promise<any>((resolve, reject) => {
        wx.chooseMessageFile({
          count: 1,
          type: 'file',
          extension: ['pdf', 'jpg', 'jpeg', 'png', 'heic'],
          success: resolve,
          fail: reject
        })
      })
      const file = res.tempFiles && res.tempFiles[0]
      if (!file) return
      this.setData({ filePath: file.path, fileName: file.name, errorMsg: '' })
    } catch (err: any) {
      if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        this.setData({ errorMsg: '选择文件失败' })
      }
    }
  },

  // 从本地相册选择（图片）
  async chooseFromAlbum() {
    try {
      const res = await new Promise<any>((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        })
      })
      const file = res.tempFiles && res.tempFiles[0]
      if (!file) return
      this.setData({
        filePath: file.tempFilePath,
        fileName: `相册图片-${Date.now()}.jpg`,
        errorMsg: ''
      })
    } catch (err: any) {
      if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        this.setData({ errorMsg: '选择图片失败' })
      }
    }
  },

  onDateChange(e: any) {
    this.setData({ reportDate: e.detail.value })
  },

  async saveOnly() {
    const { filePath, selectedMemberId, selectedReportType, reportDate, members } = this.data as any

    if (!selectedMemberId) {
      this.setData({ errorMsg: '请先选择归属成员' })
      return
    }
    if (!filePath) {
      this.setData({ errorMsg: '请先选择报告文件' })
      return
    }

    const member = members.find((m: MemberOption) => m.id === selectedMemberId)
    if (!member) {
      this.setData({ errorMsg: '成员信息异常' })
      return
    }

    this.setData({ uploading: true, errorMsg: '' })

    try {
      await reportService.upload(filePath, {
        memberId: selectedMemberId,
        memberName: member.name,
        reportType: selectedReportType,
        reportTypeLabel: REPORT_TYPES.find((t) => t.value === selectedReportType)?.label || '报告',
        reportDate
      })

      this.setData({ uploading: false })
      wx.showToast({ title: '已保存报告', icon: 'success' })
      setTimeout(() => {
        navigateTo(`/pages/member-detail/index?memberId=${selectedMemberId}`)
      }, 800)
    } catch (err: any) {
      this.setData({
        uploading: false,
        errorMsg: err && err.message ? err.message : '上传失败，请重试'
      })
    }
  }
})
