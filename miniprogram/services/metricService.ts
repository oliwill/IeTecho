import { metricRecords, trendSummaries } from '../data/mock-metrics'
import type { MetricRecord, MetricConfirmationState } from '../models/metric'
import type { AbnormalMetric } from '../models/interpretation'
import { callCloud, isCloudReady } from './_cloud'
import { interpretationService } from './interpretationService'

/**
 * 指标 service。
 * 数据来源：云函数可用时走 reportOps（metric.* action），否则回退本地 mock。
 * iOS 阶段：_cloud 实现换成 fetch 后端，此 service 接口不变。
 *
 * 重要：AI 解读出的指标当前只内嵌在 interpretations.abnormalMetrics，
 *      metric_records 集合在解读完成后是空的，确认入库 = 物化 CREATE。
 */

/** trendSummaries 的元素类型。 */
type TrendSummary = (typeof trendSummaries)[number]

/** 物化时给异常指标补的默认分类。P0 不维护完整知识库，先按指标名兜底。 */
function inferCategory(metricName: string): string {
  if (/尿酸|血糖|糖化|血脂|胆固醇|甘油三酯|LDL|HDL|载脂蛋白/.test(metricName)) return '代谢'
  if (/血压|心率/.test(metricName)) return '循环'
  if (/血红蛋白|红细胞|白细胞|血小板|中性粒|淋巴|粒细胞/.test(metricName)) return '血液'
  if (/转氨酶|胆红素|白蛋白|肝/.test(metricName)) return '肝功能'
  if (/肌酐|尿素/.test(metricName)) return '肾功能'
  return '其他'
}

/** 默认视为异常指标（解读只产异常项），isAbnormal 由 status 推断。 */
function isStatusAbnormal(status: AbnormalMetric['status']): boolean {
  return status === 'high' || status === 'low' || status === 'warning'
}

/** 把解读内嵌的异常指标物化成待确认的 MetricRecord（不含 id，由云端 genId 生成）。 */
function toPendingMetric(
  item: AbnormalMetric,
  ctx: { reportId: string; memberId: string; measuredAt: string }
): Omit<MetricRecord, 'id'> {
  return {
    memberId: ctx.memberId,
    reportId: ctx.reportId,
    metricName: item.metricName,
    metricCode: '', // P0 不维护标准编码表，留空
    category: inferCategory(item.metricName),
    value: item.value,
    unit: item.unit,
    referenceRange: item.referenceRange,
    status: item.status,
    statusText: item.statusText,
    isAbnormal: isStatusAbnormal(item.status),
    measuredAt: ctx.measuredAt,
    plainLanguageExplanation: item.plainExplanation,
    possibleFactors: item.possibleFactors,
    nextSuggestion: item.nextSuggestion,
    confirmationState: 'pending'
  }
}

export const metricService = {
  /** 全部指标。 */
  async list(): Promise<MetricRecord[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<MetricRecord[]>('reportOps', { action: 'metric.list' })
      } catch (err) {
        console.warn('[metricService.list] 云函数失败，回退 mock', err)
      }
    }
    return metricRecords
  },

  /** 取某报告下的全部指标。 */
  async getByReport(reportId: string): Promise<MetricRecord[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<MetricRecord[]>('reportOps', {
          action: 'metric.getByReport',
          reportId
        })
      } catch (err) {
        console.warn('[metricService.getByReport] 云函数失败，回退 mock', err)
      }
    }
    return metricRecords.filter((item) => item.reportId === reportId)
  },

  /** 取某成员的全部指标。 */
  async getByMember(memberId: string): Promise<MetricRecord[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<MetricRecord[]>('reportOps', {
          action: 'metric.getByMember',
          memberId
        })
      } catch (err) {
        console.warn('[metricService.getByMember] 云函数失败，回退 mock', err)
      }
    }
    return metricRecords.filter((item) => item.memberId === memberId)
  },

  /** 取全部异常指标。 */
  async getAbnormal(): Promise<MetricRecord[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<MetricRecord[]>('reportOps', { action: 'metric.getAbnormal' })
      } catch (err) {
        console.warn('[metricService.getAbnormal] 云函数失败，回退 mock', err)
      }
    }
    return metricRecords.filter((item) => item.isAbnormal)
  },

  /** 首页 / 成员详情用的趋势摘要（P2 接 ECharts 时再从已确认指标聚合）。 */
  async getTrendSummaries(): Promise<TrendSummary[]> {
    return [...trendSummaries]
  },

  /**
   * 从解读记录取出待确认指标（仅读，不入库）。
   * metric-confirm 页 onLoad 调用：渲染 AI 解读出的异常指标，confirmationState 置 pending。
   * 返回 null 表示找不到解读记录。
   */
  async getPendingFromInterpretation(
    reportId: string,
    measuredAt: string
  ): Promise<{ memberId: string; metrics: MetricRecord[] } | null> {
    const interp = await interpretationService.getByReport(reportId)
    if (!interp || !interp.abnormalMetrics || !interp.abnormalMetrics.length) return null
    const metrics: MetricRecord[] = interp.abnormalMetrics.map((item) => {
      // 物化时补临时 id 供 wx:key 使用，入库时由云端重新 genId。
      const base = toPendingMetric(item, { reportId, memberId: interp.memberId, measuredAt })
      return { ...base, id: `pending-${interp.memberId}-${item.metricName}-${measuredAt}` } as MetricRecord
    })
    return { memberId: interp.memberId, metrics }
  },

  /**
   * 物化单条指标入库（confirmationState 由调用方决定，通常 confirmed/modified）。
   * 调用方传入完整 MetricRecord（含 confirmationState）；临时 id 会被忽略，由云端 genId。
   * 返回入库后的实体（含 _id 和真实 id）。
   */
  async create(metric: MetricRecord): Promise<MetricRecord> {
    if (isCloudReady()) {
      // 去掉临时 id，让云端生成；其余字段透传。
      const { id: _omit, ...payload } = metric
      void _omit
      return callCloud<MetricRecord>('reportOps', { action: 'metric.create', metric: payload })
    }
    throw new Error('create 需要 cloud，mock 阶段不支持写操作')
  },

  /**
   * 更新已入库指标（改确认状态等）。
   * 注意：云函数按 _id 过滤，id 参数必须传入库实体的 _id。
   */
  async update(id: string, patch: Partial<MetricRecord>): Promise<void> {
    if (isCloudReady()) {
      await callCloud('reportOps', { action: 'metric.update', id, patch })
      return
    }
    throw new Error('update 需要 cloud，mock 阶段不支持写操作')
  },

  /**
   * 删除已入库指标。
   * 注意：云函数按 _id 过滤，id 参数必须传入库实体的 _id。
   */
  async remove(id: string): Promise<void> {
    if (isCloudReady()) {
      await callCloud('reportOps', { action: 'metric.remove', id })
      return
    }
    throw new Error('remove 需要 cloud，mock 阶段不支持写操作')
  },

  /**
   * 更新已入库指标的确认状态（二次确认 / 忽略场景）。
   * 注意：id 必须传入库实体的 _id。
   */
  async updateConfirmation(id: string, state: MetricConfirmationState): Promise<void> {
    const patch: Partial<MetricRecord> = { confirmationState: state }
    if (state === 'ignored') patch.statusText = '已忽略'
    return this.update(id, patch)
  }
}
