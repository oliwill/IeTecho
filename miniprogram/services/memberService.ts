import { members, firstUseMember } from '../data/mock-members'
import type { Member } from '../models/member'
import { callCloud, isCloudReady } from './_cloud'

/**
 * 成员 service。
 * 数据来源：云函数可用时走 memberOps，否则回退本地 mock（联调期友好）。
 * iOS 阶段：_cloud 实现换成 fetch 后端，此 service 接口不变。
 */

export const memberService = {
  /** 全部家人列表。 */
  async list(): Promise<Member[]> {
    if (isCloudReady()) {
      try {
        return await callCloud<Member[]>('memberOps', { action: 'list' })
      } catch (err) {
        console.warn('[memberService.list] 云函数失败，回退 mock', err)
      }
    }
    return members
  },

  /** 按 id 取单个成员，未找到返回 undefined。 */
  async getById(id: string): Promise<Member | undefined> {
    if (isCloudReady()) {
      try {
        const data = await callCloud<Member | null>('memberOps', { action: 'get', id })
        return data || undefined
      } catch (err) {
        console.warn('[memberService.getById] 云函数失败，回退 mock', err)
      }
    }
    return members.find((item) => item.id === id)
  },

  /** 首次使用时的默认「我」（空档案）。 */
  async getFirstUseMember(): Promise<Member> {
    if (isCloudReady()) {
      try {
        return await callCloud<Member>('memberOps', { action: 'getFirstUse' })
      } catch (err) {
        console.warn('[memberService.getFirstUseMember] 云函数失败，回退 mock', err)
      }
    }
    return firstUseMember
  },

  /** 创建成员（mock 阶段无写操作，云函数可用时走 memberOps.create）。 */
  async create(member: Partial<Member>): Promise<Member> {
    if (isCloudReady()) {
      return callCloud<Member>('memberOps', { action: 'create', member })
    }
    throw new Error('create 需要 cloud，mock 阶段不支持写操作')
  },

  /** 更新成员。 */
  async update(id: string, patch: Partial<Member>): Promise<void> {
    if (isCloudReady()) {
      await callCloud('memberOps', { action: 'update', id, patch })
      return
    }
    throw new Error('update 需要 cloud，mock 阶段不支持写操作')
  }
}
