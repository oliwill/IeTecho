// 云函数：getDashboard
// 首页聚合：今日重点、待办提醒、趋势摘要、最近报告。
//
// 输出结构与 miniprogram/models/scenario.ts 的 Dashboard 接口对齐。
// 聚合逻辑纯 Node，平台无关，iOS 后端可直接复用。

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const userId = resolveUserId(event, context)
  const where = { userId }

  try {
    const [members, reminders, reports, metrics] = await Promise.all([
      db.collection('members').where(where).get(),
      db.collection('reminders').where(where).get(),
      db.collection('reports').where(where).orderBy('reportDate', 'desc').limit(1).get(),
      db.collection('metric_records').where({ ...where, isAbnormal: true }).get()
    ])

    const hasData = members.data.length > 0

    // 首次使用空态
    if (!hasData) {
      return {
        ok: true,
        data: {
          scenario: 'firstUse',
          todayFocus: null,
          reminders: [],
          trendSummaries: [],
          recentReport: null
        }
      }
    }

    // 今日重点：选取异常指标最多的成员（简单策略，P2 可优化）
    const todayFocus = buildTodayFocus(members.data, metrics.data)

    // 提醒排序：逾期 > 今日 > 未来，首页只取前 3 条
    const sortedReminders = sortReminders(reminders.data).slice(0, 3)

    // 趋势摘要：P1 返回空数组（基于已确认指标的聚合逻辑留 P2 接 ECharts 时完善）
    const trendSummaries = []

    // 最近报告
    const recentReport = reports.data[0] || null

    return {
      ok: true,
      data: {
        scenario: 'multiFamily',
        todayFocus,
        reminders: sortedReminders,
        trendSummaries,
        recentReport
      }
    }
  } catch (err) {
    return { ok: false, error: String(err && err.errMsg ? err.errMsg : err) }
  }
}

function buildTodayFocus(members, abnormalMetrics) {
  if (abnormalMetrics.length === 0) return null
  // 统计每个成员的异常指标数，选最多的
  const countByMember = {}
  abnormalMetrics.forEach((m) => {
    countByMember[m.memberId] = (countByMember[m.memberId] || 0) + 1
  })
  const targetMemberId = Object.entries(countByMember).sort((a, b) => b[1] - a[1])[0][0]
  const member = members.find((m) => m.id === targetMemberId || m._id === targetMemberId)
  if (!member) return null
  return {
    memberId: member.id || member._id,
    memberName: member.name,
    title: `${member.name} 有 ${countByMember[targetMemberId]} 项指标需要关注`,
    description: member.statusText || '建议查看报告解读',
    nextAction: member.nextAction || '查看报告解读',
    targetPage: '/pages/member-detail/index'
  }
}

function sortReminders(reminders) {
  const order = { overdue: 0, today: 1, future: 2 }
  return [...reminders].sort((a, b) => {
    const oa = order[a.status] ?? 9
    const ob = order[b.status] ?? 9
    if (oa !== ob) return oa - ob
    return (a.time || '').localeCompare(b.time || '')
  })
}

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
