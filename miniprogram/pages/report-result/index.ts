import { reportService } from '../../services/index'
import { interpretationService } from '../../services/index'
import type { Interpretation } from '../../models/interpretation'
import { navigateTo } from '../../utils/route'

const POLL_INTERVAL = 3000 // 轮询间隔 3 秒
const POLL_MAX = 20 // 最多轮询 20 次（约 1 分钟）

Page({
  data: {
    reportId: '',
    loading: true,
    interpreting: false, // 解读中
    failed: false, // 解读失败
    failedReason: '' as string, // 失败原因（展示给用户）
    interpretation: null as Interpretation | null,
    abnormalCount: 0
  },

  pollTimer: null as any,
  pollCount: 0,

  async onLoad(options: any) {
    const reportId = options?.id || ''
    if (!reportId) {
      this.setData({ loading: false, failed: true })
      return
    }
    this.setData({ reportId })
    await this.loadInterpretation()
  },

  onUnload() {
    this.clearPoll()
  },

  async loadInterpretation() {
    const { reportId } = this.data
    try {
      // 取报告状态
      const report = await reportService.getById(reportId)
      if (!report) {
        this.setData({ loading: false, failed: true })
        return
      }

      const status = report.interpretationStatus

      // 解读中：开始轮询
      if (status === 'interpreting') {
        this.setData({ loading: false, interpreting: true })
        this.startPoll()
        return
      }

      // 解读失败
      if (status === 'failed') {
        this.setData({ loading: false, failed: true })
        return
      }

      // 已解读：取解读记录
      if (status === 'interpreted' || status === 'pendingMetrics' || status === 'saved') {
        const interp = await interpretationService.getByReport(reportId)
        this.setData({
          loading: false,
          interpreting: false,
          interpretation: interp || null,
          abnormalCount: (interp && interp.abnormalMetrics && interp.abnormalMetrics.length) || 0
        })
        return
      }

      // 未解读（none）：主动触发解读
      if (status === 'none') {
        this.setData({ loading: false, interpreting: true })
        this.startInterpret()
        return
      }
    } catch (err) {
      console.warn('[report-result] loadInterpretation failed', err)
      this.setData({ loading: false, failed: true })
    }
  },

  // 主动触发解读（报告状态为 none 时）
  async startInterpret() {
    try {
      await reportService.interpret(this.data.reportId)
      this.startPoll()
    } catch (err) {
      console.warn('[report-result] startInterpret failed', err)
      // 提取错误文案：云函数业务错误(带友好提示) 或 SDK 层错误(超时/网络)
      const raw = (err && (err.error || err.message)) || ''
      let reason = raw
      if (/timed out|timeout|超时|-504003/i.test(raw)) {
        reason = 'AI 解读超时，请稍后重试。若多次超时，可能是网络波动或报告内容过多。'
      } else if (/网络|network|ECONNRESET|ETIMEDOUT|fail/i.test(raw) && !reason) {
        reason = '网络异常，请检查网络后重试。'
      }
      this.setData({
        interpreting: false,
        failed: true,
        failedReason: reason
      })
    }
  },

  // 轮询解读状态
  startPoll() {
    this.clearPoll()
    this.pollCount = 0
    this.pollTimer = setInterval(async () => {
      this.pollCount++
      if (this.pollCount > POLL_MAX) {
        this.clearPoll()
        this.setData({ interpreting: false, failed: true })
        return
      }
      const report = await reportService.getById(this.data.reportId)
      const status = report && report.interpretationStatus
      if (status === 'interpreted' || status === 'pendingMetrics' || status === 'saved') {
        this.clearPoll()
        await this.loadInterpretation()
      } else if (status === 'failed') {
        this.clearPoll()
        this.setData({ interpreting: false, failed: true })
      }
    }, POLL_INTERVAL)
  },

  clearPoll() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  },

  retry() {
    this.setData({ failed: false, failedReason: '', interpreting: true, loading: true })
    this.loadInterpretation()
  },

  goConfirm() {
    navigateTo(`/pages/metric-confirm/index?reportId=${this.data.reportId}`)
  }
})
