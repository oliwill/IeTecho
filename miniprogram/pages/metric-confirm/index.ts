import { metricService, reportService } from '../../services/index'
import type { MetricRecord, MetricConfirmationState } from '../../models/metric'
import { navigateTo } from '../../utils/route'

/**
 * 指标确认页。
 *
 * 数据来源：从 report-result 跳转时带 ?reportId=...，本页据此：
 *   1. 读报告取 reportDate（作为 measuredAt）和 memberId；
 *   2. 调 metricService.getPendingFromInterpretation 物化解读内嵌的异常指标供用户确认。
 *
 * 保存语义（PRD 3.4）：确认是默认动作，除显式 ignored 外的指标都物化写入
 *   metric_records（confirmationState=confirmed，云端 genId）；全部成功后翻转
 *   report.interpretationStatus -> saved。
 */
Page({
  data: {
    reportId: '',
    memberId: '',
    metrics: null as MetricRecord[] | null,
    loading: true,
    loadFailed: false,
    saving: false
  },

  async onLoad(options: any) {
    const reportId = options?.reportId || ''
    if (!reportId) {
      this.setData({ loading: false, loadFailed: true })
      return
    }
    this.setData({ reportId })
    await this.loadPending()
  },

  async loadPending() {
    const { reportId } = this.data
    try {
      // 报告日期作为指标的 measuredAt；memberId 来自解读记录（与报告一致）。
      const report = await reportService.getById(reportId)
      const measuredAt = (report && report.reportDate) || new Date().toISOString().slice(0, 10)
      const result = await metricService.getPendingFromInterpretation(reportId, measuredAt)
      if (!result || !result.metrics.length) {
        this.setData({ loading: false, loadFailed: true })
        return
      }
      this.setData({
        loading: false,
        loadFailed: false,
        memberId: result.memberId,
        metrics: result.metrics
      })
    } catch (err) {
      console.warn('[metric-confirm] loadPending failed', err)
      this.setData({ loading: false, loadFailed: true })
    }
  },

  // 本地切换某条指标的确认状态（仅 UI 态，不入库；保存时按状态决定是否 create）。
  setConfirmation(metricId: string, state: MetricConfirmationState) {
    const metrics = this.data.metrics
    if (!metrics) return
    const next = metrics.map((item) => {
      if (item.id !== metricId) return item
      const updated = { ...item, confirmationState: state }
      if (state === 'ignored') updated.statusText = '已忽略'
      return updated
    })
    this.setData({ metrics: next })
  },

  async ignoreMetric(event: any) {
    const metricId = event.detail?.metricId
    if (!metricId) return
    this.setConfirmation(metricId, 'ignored')
    wx.showToast({ title: '已标记忽略，不会保存到档案', icon: 'none' })
  },

  editMetric() {
    wx.showToast({ title: '编辑弹层会在下一阶段实现', icon: 'none' })
  },

  showMock() {
    wx.showToast({ title: '手动添加指标会在下一阶段实现', icon: 'none' })
  },

  async saveToProfile() {
    if (this.data.saving) return
    const { reportId, memberId, metrics } = this.data
    if (!metrics || !reportId) return

    // PRD 3.4：确认是默认动作（点底部保存即确认），忽略是显式动作。
    // 因此除 ignored 外的指标都视为确认入库。
    const toSave = metrics.filter((item) => item.confirmationState !== 'ignored')
    this.setData({ saving: true })
    try {
      // 1. 物化确认指标入库（云端 genId 生成真实 id，confirmationState 标 confirmed）
      let saved = 0
      for (const metric of toSave) {
        const created = await metricService.create({ ...metric, confirmationState: 'confirmed' })
        saved++
        // 复验探针：确认走的是云函数（created._id 来自云端）而非 mock。
        console.info('[metric-confirm] 入库成功', created.metricName, '_id=', created._id)
      }
      // 2. 翻转报告状态
      await reportService.update(reportId, { interpretationStatus: 'saved', pendingMetricCount: 0 })
      console.info('[metric-confirm] 报告状态已翻转为 saved，共入库', saved, '条')
      wx.showToast({ title: '已保存到健康档案', icon: 'success' })
      const target = memberId || 'member-self'
      setTimeout(() => navigateTo(`/pages/member-detail/index?memberId=${target}`), 600)
    } catch (err) {
      console.warn('[metric-confirm] saveToProfile failed', err)
      this.setData({ saving: false })
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  },

  retryLoad() {
    this.setData({ loading: true, loadFailed: false })
    this.loadPending()
  }
})
