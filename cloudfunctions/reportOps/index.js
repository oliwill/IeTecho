// 云函数：reportOps
// 体检报告与指标记录增删改查。
//
// 设计原则同 memberOps：纯 Node、平台无关、action 路由、自有 userId 隔离。
// 详见 docs/plans/2026-06-17-platform-decision.md。
//
// action 列表：
//   report.list                   当前用户全部报告
//   report.getByMember {memberId} 某成员的全部报告
//   report.get         {id}       单条报告
//   report.create      {report}   创建报告
//   report.update      {id,patch} 更新报告
//   report.remove      {id}       删除报告
//
//   metric.list                    全部已确认指标
//   metric.getByReport {reportId}  某报告下全部指标
//   metric.getByMember {memberId}  某成员全部指标
//   metric.getAbnormal             全部异常指标
//   metric.create      {metric}    新增指标
//   metric.update      {id,patch}  更新指标（含确认状态）
//   metric.remove      {id}        删除指标
//
//   trend.getSummaries             首页/成员详情用的趋势摘要

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const REPORTS = 'reports'
const METRICS = 'metric_records'

exports.main = async (event) => {
  const { action } = event
  const userId = resolveUserId(event, context)

  try {
    // 报告操作
    if (action === 'report.list') return await listReports(userId)
    if (action === 'report.getByMember') return await listReports(userId, event.memberId)
    if (action === 'report.get') return await getReport(userId, event.id)
    if (action === 'report.create') return await createReport(userId, event.report)
    if (action === 'report.update') return await updateReport(userId, event.id, event.patch)
    if (action === 'report.remove') return await removeReport(userId, event.id)

    // 指标操作
    if (action === 'metric.list') return await listMetrics(userId)
    if (action === 'metric.getByReport') return await listMetrics(userId, { reportId: event.reportId })
    if (action === 'metric.getByMember') return await listMetrics(userId, { memberId: event.memberId })
    if (action === 'metric.getAbnormal') return await listMetrics(userId, { abnormal: true })
    if (action === 'metric.create') return await createMetric(userId, event.metric)
    if (action === 'metric.update') return await updateMetric(userId, event.id, event.patch)
    if (action === 'metric.remove') return await removeMetric(userId, event.id)

    // 趋势摘要（基于已确认指标聚合，P1 先返回空结构，P2 接 ECharts 时完善）
    if (action === 'trend.getSummaries') return { ok: true, data: [] }

    return { ok: false, error: `unknown action: ${action}` }
  } catch (err) {
    return { ok: false, error: String(err && err.errMsg ? err.errMsg : err) }
  }
}

// ── 报告 ──────────────────────────────────────────

async function listReports(userId, memberId) {
  const where = memberId ? { userId, memberId } : { userId }
  const { data } = await db.collection(REPORTS).where(where).get()
  return { ok: true, data }
}

async function getReport(userId, id) {
  const { data } = await db.collection(REPORTS).where({ _id: id, userId }).get()
  return { ok: true, data: data[0] || null }
}

async function createReport(userId, report) {
  const now = new Date().toISOString()
  const doc = {
    ...report,
    userId,
    id: report.id || genId('report'),
    createdAt: now,
    updatedAt: now
  }
  const { _id } = await db.collection(REPORTS).add({ data: doc })
  return { ok: true, data: { ...doc, _id } }
}

async function updateReport(userId, id, patch) {
  const payload = { ...patch, updatedAt: new Date().toISOString() }
  const { stats } = await db.collection(REPORTS).where({ _id: id, userId }).update({ data: payload })
  return { ok: true, updated: stats.updated }
}

async function removeReport(userId, id) {
  const { stats } = await db.collection(REPORTS).where({ _id: id, userId }).remove()
  // 级联删除该报告下的指标（趋势统计不允许残留孤儿指标）
  await db.collection(METRICS).where({ reportId: id, userId }).remove()
  return { ok: true, removed: stats.removed }
}

// ── 指标 ──────────────────────────────────────────

async function listMetrics(userId, filter) {
  const where = { userId }
  if (filter && filter.reportId) where.reportId = filter.reportId
  if (filter && filter.memberId) where.memberId = filter.memberId
  if (filter && filter.abnormal) where.isAbnormal = true
  const { data } = await db.collection(METRICS).where(where).get()
  return { ok: true, data }
}

async function createMetric(userId, metric) {
  const now = new Date().toISOString()
  const doc = {
    ...metric,
    userId,
    id: metric.id || genId('metric'),
    createdAt: now,
    updatedAt: now
  }
  const { _id } = await db.collection(METRICS).add({ data: doc })
  return { ok: true, data: { ...doc, _id } }
}

async function updateMetric(userId, id, patch) {
  const payload = { ...patch, updatedAt: new Date().toISOString() }
  const { stats } = await db.collection(METRICS).where({ _id: id, userId }).update({ data: payload })
  return { ok: true, updated: stats.updated }
}

async function removeMetric(userId, id) {
  const { stats } = await db.collection(METRICS).where({ _id: id, userId }).remove()
  return { ok: true, removed: stats.removed }
}

// ── 工具 ──────────────────────────────────────────

function resolveUserId(event) {
  if (event.userId) return event.userId
  try {
    const wxContext = cloud.getWXContext()
    if (wxContext && wxContext.OPENID) {
      return `wx:${wxContext.OPENID}`
    }
  } catch (e) {
    // getWXContext 在非微信环境调用会抛错，忽略。
  }
  return 'anonymous'
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
