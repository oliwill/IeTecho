import { members, firstUseMember } from '../data/mock-members'
import type { Member } from '../models/member'
import { resolve } from './_async'

/**
 * 成员读取 service。
 * 数据来源当前为本地 mock,接云函数时替换内部实现,接口不变。
 */
export const memberService = {
  /** 全部家人列表。 */
  list: (): Promise<Member[]> => resolve(members),

  /** 按 id 取单个成员,未找到返回 undefined。 */
  getById: (id: string): Promise<Member | undefined> =>
    resolve(members.find((item) => item.id === id)),

  /** 首次使用时的默认「我」(空档案)。 */
  getFirstUseMember: (): Promise<Member> => resolve(firstUseMember)
}
