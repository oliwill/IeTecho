// 云函数：memberOps
// 家庭成员档案增删改查。
//
// 设计原则（平台决策 docs/plans/2026-06-17-platform-decision.md）：
// - 纯 Node 业务逻辑，不依赖微信特有能力，方便 iOS 阶段复用。
// - 数据模型平台无关：用自有 userId 字段做用户隔离，不依赖 _openid 做唯一标识。
// - action 路由模式：单个云函数处理多个操作，iOS 后端可直接复用此结构。
//
// 调用方式：
//   wx.cloud.callFunction({ name: 'memberOps', data: { action, ... } })
//
// action 列表：
//   list                       取当前用户全部家人
//   get          { id }        取单个成员
//   getFirstUse                 取首次使用时的默认「我」空档案（本地构造，不查库）
//   create       { member }    创建成员
//   update       { id, patch } 更新成员
//   remove       { id }        删除成员

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const COLLECTION = 'members'

exports.main = async (event, context) => {
  const { action } = event
  const userId = resolveUserId(event, context)

  try {
    switch (action) {
      case 'list':
        return await list(userId)
      case 'get':
        return await get(userId, event.id)
      case 'getFirstUse':
        return firstUseMember()
      case 'create':
        return await create(userId, event.member)
      case 'update':
        return await update(userId, event.id, event.patch)
      case 'remove':
        return await remove(userId, event.id)
      default:
        return { ok: false, error: `unknown action: ${action}` }
    }
  } catch (err) {
    return { ok: false, error: String(err && err.errMsg ? err.errMsg : err) }
  }
}

async function list(userId) {
  const { data } = await db.collection(COLLECTION).where({ userId }).get()
  return { ok: true, data }
}

async function get(userId, id) {
  const { data } = await db.collection(COLLECTION).where({ _id: id, userId }).get()
  return { ok: true, data: data[0] || null }
}

async function create(userId, member) {
  const now = new Date().toISOString()
  const doc = {
    ...member,
    userId,
    id: member.id || genId('member'),
    createdAt: now,
    updatedAt: now
  }
  const { _id } = await db.collection(COLLECTION).add({ data: doc })
  return { ok: true, data: { ...doc, _id } }
}

async function update(userId, id, patch) {
  const payload = { ...patch, updatedAt: new Date().toISOString() }
  const { stats } = await db
    .collection(COLLECTION)
    .where({ _id: id, userId })
    .update({ data: payload })
  return { ok: true, updated: stats.updated }
}

async function remove(userId, id) {
  const { stats } = await db.collection(COLLECTION).where({ _id: id, userId }).remove()
  return { ok: true, removed: stats.removed }
}

// 首次使用默认「我」：本地构造空档案，不写库，前端引导用户上传报告后再正式 create。
function firstUseMember() {
  return {
    ok: true,
    data: {
      id: 'member-self-empty',
      name: '我',
      relation: 'self',
      relationLabel: '本人',
      gender: 'unknown',
      focusTags: [],
      avatarType: 'self',
      status: 'empty',
      statusText: '还没有档案',
      abnormalMetricCount: 0,
      reminderCount: 0,
      nextAction: '上传我的体检报告'
    }
  }
}

// 用户标识解析：优先用自有 userId（预留），回退到微信 openid（P1 阶段）。
// iOS 阶段独立后端会用自己的鉴权产出 userId，此函数保持单一职责。
function resolveUserId(event, context) {
  if (event.userId) return event.userId
  if (context && context.OPENID) return `wx:${context.OPENID}`
  return 'anonymous'
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
