// 云函数：exportData
// 导出当前用户全部档案为平台无关 JSON 结构。
//
// 这是 iOS 迁移的前置依赖（docs/plans/2026-06-17-platform-decision.md 第 5 节）。
// 输出结构必须与 miniprogram/services/exportService.ts 的 ExportBundle 严格一致：
//   meta / members / reports / metrics / reminders / interpretations
//
// 报告原始文件（图片/PDF）在 P1 阶段仍存云存储 fileID，本函数只导出元数据引用，
// 不打包文件内容。iOS 端如需原始文件，单独按 fileID 拉取。

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const APP_VERSION = '0.1.0'
const SCHEMA_VERSION = 1

exports.main = async (event) => {
  const userId = resolveUserId(event)
  const where = { userId }

  try {
    const [members, reports, metrics, reminders, interpretations] = await Promise.all([
      db.collection('members').where(where).get(),
      db.collection('reports').where(where).get(),
      db.collection('metric_records').where(where).get(),
      db.collection('reminders').where(where).get(),
      db.collection('interpretations').where(where).get()
    ])

    return {
      ok: true,
      data: {
        meta: {
          schemaVersion: SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          sourcePlatform: 'wechat-miniapp',
          appVersion: APP_VERSION
        },
        members: stripInternal(members.data),
        reports: stripInternal(reports.data),
        metrics: stripInternal(metrics.data),
        reminders: stripInternal(reminders.data),
        interpretations: stripInternal(interpretations.data)
      }
    }
  } catch (err) {
    return { ok: false, error: String(err && err.errMsg ? err.errMsg : err) }
  }
}

// 移除云数据库内部字段（_id/_openid 等），保证导出结构平台无关。
function stripInternal(records) {
  return records.map(({ _id, _openid, ...rest }) => rest)
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
