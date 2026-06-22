import { members } from '../data/mock-members'
import { reports } from '../data/mock-reports'
import { metricRecords } from '../data/mock-metrics'
import { reminders } from '../data/mock-reminders'
import { interpretations } from '../data/mock-interpretations'
import type { Member } from '../models/member'
import type { Report } from '../models/report'
import type { MetricRecord } from '../models/metric'
import type { Reminder } from '../models/reminder'
import type { Interpretation } from '../models/interpretation'
import { callCloud, isCloudReady } from './_cloud'

/**
 * 平台无关导出格式。
 * 结构与 docs/plans/2026-06-17-platform-decision.md 第 5.2 节一致，
 * 小程序和 iOS 都能读写，作为两阶段迁移的数据载体。
 */
export interface ExportBundle {
  meta: {
    schemaVersion: number
    exportedAt: string
    sourcePlatform: 'wechat-miniapp' | 'ios'
    appVersion: string
  }
  members: Member[]
  reports: Report[]
  metrics: MetricRecord[]
  reminders: Reminder[]
  interpretations: Interpretation[]
}

/** 当前产品版本，随发布更新。 */
const APP_VERSION = '0.1.0'

/** 当前导出文件格式版本。字段结构破坏性变更时递增。 */
const SCHEMA_VERSION = 1

/**
 * 导出 service。
 * 数据来源：云函数可用时走 exportData 云函数（从云数据库聚合全部档案），
 * 否则回退本地 mock。
 *
 * iOS 阶段：_cloud 实现换成 fetch 后端 /export，此 service 接口不变。
 */
export const exportService = {
  /**
   * 导出全部档案为平台无关 JSON 结构。
   * 返回的对象可直接 JSON.stringify 写入文件，供 iOS 端导入。
   */
  async exportAll(): Promise<ExportBundle> {
    if (isCloudReady()) {
      try {
        return await callCloud<ExportBundle>('exportData', {})
      } catch (err) {
        console.warn('[exportService.exportAll] 云函数失败，回退 mock', err)
      }
    }
    return {
      meta: {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        sourcePlatform: 'wechat-miniapp',
        appVersion: APP_VERSION
      },
      members: members.map((item) => ({ ...item })),
      reports: reports.map((item) => ({ ...item })),
      metrics: metricRecords.map((item) => ({ ...item })),
      reminders: reminders.map((item) => ({ ...item })),
      interpretations: interpretations.map((item) => ({ ...item }))
    }
  }
}
