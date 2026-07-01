import { reports } from '../data/mock-reports'
import type { Report } from '../models/report'
import { callCloud, isCloudReady } from './_cloud'

/**
 * 报告 service。
 * 数据来源：云函数可用时走 reportOps，否则回退本地 mock。
 * iOS 阶段：_cloud 实现换成 fetch 后端，此 service 接口不变。
 */

export interface UploadResult {
  report: Report
}

export const reportService = {
  /** 全部报告。 */
  async list(): Promise<Report[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<Report[]>('reportOps', { action: 'report.list' })
      } catch (err) {
        console.warn('[reportService.list] 云函数失败，回退 mock', err)
      }
    }
    return reports
  },

  /** 取某成员的全部报告。 */
  async getByMember(memberId: string): Promise<Report[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<Report[]>('reportOps', { action: 'report.getByMember', memberId })
      } catch (err) {
        console.warn('[reportService.getByMember] 云函数失败，回退 mock', err)
      }
    }
    return reports.filter((item) => item.memberId === memberId)
  },

  /** 按 id 取单条报告，未找到返回 undefined。 */
  async getById(id: string): Promise<Report | undefined> {
    if (isCloudReady()) {
      try {
        const data = await callCloud<Report | null>('reportOps', { action: 'report.get', id })
        return data || undefined
      } catch (err) {
        console.warn('[reportService.getById] 云函数失败，回退 mock', err)
      }
    }
    return reports.find((item) => item.id === id)
  },

  /**
   * 更新报告（如翻转 interpretationStatus: pendingMetrics -> saved）。
   * 注意：reportOps 的 report.update 按业务 id 过滤（与 memberOps 的 _id 不同），这里传业务 id。
   */
  async update(id: string, patch: Partial<Report>): Promise<void> {
    if (isCloudReady()) {
      await callCloud('reportOps', { action: 'report.update', id, patch })
      return
    }
    throw new Error('update 需要 cloud，mock 阶段不支持写操作')
  },

  /**
   * 上传报告文件 + 写入报告记录。
   * 两步：前端直传云存储拿 fileID → 调 reportOps.create 写库。
   *
   * iOS 阶段：第一步换成 presigned URL 直传对象存储，第二步不变。
   *
   * @param filePath 微信选文件返回的临时路径
   * @param input 报告元信息（成员、类型、日期等）
   */
  async upload(filePath: string, input: {
    memberId: string
    memberName: string
    reportType: Report['reportType']
    reportTypeLabel: string
    reportDate: string
    hospital?: string
    department?: string
  }): Promise<UploadResult> {
    if (!isCloudReady()) {
      throw new Error('上传需要云环境，mock 阶段不支持')
    }

    // 第一步：直传云存储。路径按 openid 隔离（云路径里 openid 从云函数 getWXContext 拿，
    // 但前端无法直接拿 openid，这里用「reports/ 时间戳」做路径，权限靠云存储规则保证）
    const ext = filePath.split('.').pop() || 'file'
    const cloudPath = `reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const uploadResult = await new Promise<string>((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: (res) => resolve(res.fileID),
        fail: (err) => reject(new Error(err.errMsg || '上传文件失败'))
      })
    })

    // 第二步：写报告记录（含 fileID）
    const report: Partial<Report> = {
      memberId: input.memberId,
      memberName: input.memberName,
      reportType: input.reportType,
      reportTypeLabel: input.reportTypeLabel,
      reportDate: input.reportDate,
      hospital: input.hospital,
      department: input.department,
      fileType: ext === 'pdf' ? 'pdf' : 'image',
      fileName: cloudPath.split('/').pop(),
      fileID: uploadResult,
      summary: '',
      interpretationStatus: 'none',
      pendingMetricCount: 0
    }

    const created = await callCloud<Report>('reportOps', { action: 'report.create', report })
    return { report: created }
  },

  /**
   * 触发 AI 解读。调用 interpretReport 云函数（OCR + DeepSeek）。
   * iOS 阶段：_cloud 实现换成 fetch 后端 /interpret，此方法不变。
   */
  async interpret(reportId: string): Promise<{ interpretationId: string }> {
    if (!isCloudReady()) {
      throw new Error('解读需要云环境')
    }
    const data = await callCloud<{ interpretationId: string }>('interpretReport', { reportId })
    return data
  }
}

