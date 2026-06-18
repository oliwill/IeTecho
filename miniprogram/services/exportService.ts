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
import { resolve } from './_async'

/**
 * 平台无关导出格式。
 * 结构与 docs/plans/2026-06-17-platform-decision.md 第 5.2 节一致,
 * 小程序和 iOS 都能读写,作为两阶段迁移的数据载体。
 */
export interface ExportBundle {
  /** 导出文件元信息,用于校验和版本兼容。 */
  meta: {
    /** 导出文件格式版本,字段结构有破坏性变更时递增。 */
    schemaVersion: number
    /** 导出时间,ISO 8601。 */
    exportedAt: string
    /** 来源平台,小程序为 wechat-miniapp。 */
    sourcePlatform: 'wechat-miniapp' | 'ios'
    /** 产品内部版本,用于排查兼容性问题。 */
    appVersion: string
  }
  members: Member[]
  reports: Report[]
  metrics: MetricRecord[]
  reminders: Reminder[]
  interpretations: Interpretation[]
}

/** 当前产品版本,随发布更新。 */
const APP_VERSION = '0.1.0-mock'

/** 当前导出文件格式版本。字段结构破坏性变更时递增。 */
const SCHEMA_VERSION = 1

/**
 * 导出 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现为 exportData 云函数,接口不变。
 *
 * 当前阶段报告原始文件(图片 / PDF)仍为 mock 占位,导出只含元数据引用;
 * 接云存储后,exportData 云函数负责把原始文件一并打包,JSON 内仍只保留 fileName 引用。
 */
export const exportService = {
  /**
   * 导出全部档案为平台无关 JSON 结构。
   * 返回的对象可直接 JSON.stringify 写入文件,供 iOS 端导入。
   */
  exportAll: (): Promise<ExportBundle> =>
    resolve({
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
    })
}
